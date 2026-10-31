import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Autenticación real con Supabase Auth.
 * Regla de oro: tener sesión NO es suficiente. Además el usuario debe existir
 * en la tabla `admins`; si no, se cierra la sesión inmediatamente.
 *
 * En modo demo (sin Supabase configurado) se permite entrar al panel para
 * revisión local: no hay datos reales de nadie en ese modo.
 */

interface AuthContextValue {
  loading: boolean;
  isAuthenticated: boolean;
  email: string | null;
  /** Nombre visible del administrador (vacío si nunca lo guardó). */
  fullName: string | null;
  error: string | null;
  mode: 'supabase' | 'demo';
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  /** Guarda nombre y apellido en `admins` y en los metadatos de Auth. */
  updateProfile: (input: { firstName: string; lastName: string }) => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const DEMO_SESSION_KEY = 'oxy_demo_session';
const DEMO_NAME_KEY = 'oxy_demo_name';

function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (m.includes('email not confirmed')) return 'Debes confirmar tu correo antes de entrar.';
  if (m.includes('too many requests') || m.includes('rate limit'))
    return 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.';
  if (m.includes('invalid email')) return 'El correo no tiene un formato válido.';
  if (m.includes('network')) return 'Sin conexión. Revisa tu internet e inténtalo otra vez.';
  return 'No se pudo iniciar sesión. Inténtalo de nuevo.';
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mode: 'supabase' | 'demo' = isSupabaseConfigured ? 'supabase' : 'demo';

  const verifyAdmin = useCallback(async (userId: string): Promise<boolean> => {
    if (!supabase) return false;
    const { data, error: dbError } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();
    if (dbError) {
      console.error('[auth] no se pudo verificar el rol de administrador:', dbError);
      return false;
    }
    return Boolean(data);
  }, []);

  useEffect(() => {
    let mounted = true;

    if (!supabase) {
      // Modo demo
      const demo = localStorage.getItem(DEMO_SESSION_KEY) === 'true';
      if (mounted) {
        setIsAuthenticated(demo);
        setEmail(demo ? 'demo@local' : null);
        setFullName(demo ? localStorage.getItem(DEMO_NAME_KEY) : null);
        setLoading(false);
      }
      return () => {
        mounted = false;
      };
    }

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      const session = data.session;
      if (session?.user) {
        const ok = await verifyAdmin(session.user.id);
        if (!mounted) return;
        if (ok) {
          setIsAuthenticated(true);
          setEmail(session.user.email ?? null);
          setFullName((session.user.user_metadata?.full_name as string) ?? null);
        } else {
          await supabase?.auth.signOut();
          setIsAuthenticated(false);
          setEmail(null);
          setFullName(null);
        }
      }
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        const ok = await verifyAdmin(session.user.id);
        if (!mounted) return;
        if (ok) {
          setIsAuthenticated(true);
          setEmail(session.user.email ?? null);
          setFullName((session.user.user_metadata?.full_name as string) ?? null);
        } else {
          // No llamar a signOut() de forma síncrona dentro de este callback:
          // el cliente de auth está bloqueado y puede colgarse.
          setTimeout(() => {
            void supabase?.auth.signOut();
          }, 0);
          setIsAuthenticated(false);
          setEmail(null);
          setFullName(null);
          setError('Esta cuenta no tiene acceso al panel administrativo.');
        }
      } else {
        setIsAuthenticated(false);
        setEmail(null);
        setFullName(null);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [verifyAdmin]);

  const signIn = useCallback(
    async (emailInput: string, password: string): Promise<boolean> => {
      setError(null);

      if (!supabase) {
        if (!emailInput.trim() || password.trim().length < 1) {
          setError('Escribe un correo y una contraseña (modo demostración).');
          return false;
        }
        localStorage.setItem(DEMO_SESSION_KEY, 'true');
        setIsAuthenticated(true);
        setEmail(emailInput.trim());
        setFullName(localStorage.getItem(DEMO_NAME_KEY));
        return true;
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: emailInput.trim().toLowerCase(),
        password,
      });

      if (authError) {
        setError(translateAuthError(authError.message));
        return false;
      }

      const ok = data.user ? await verifyAdmin(data.user.id) : false;
      if (!ok) {
        await supabase.auth.signOut();
        setError('Esta cuenta no tiene acceso al panel administrativo.');
        return false;
      }

      setIsAuthenticated(true);
      setEmail(data.user?.email ?? null);
      setFullName((data.user?.user_metadata?.full_name as string) ?? null);
      return true;
    },
    [verifyAdmin]
  );

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    localStorage.removeItem(DEMO_SESSION_KEY);
    setIsAuthenticated(false);
    setEmail(null);
    setFullName(null);
    setError(null);
  }, []);

  /**
   * Guarda el nombre visible.
   * En Supabase escribe en dos sitios a propósito:
   *   1. `admins.full_name` → es lo que ve la lista del equipo y la auditoría.
   *   2. metadatos de Auth → sobrevive a la recarga sin otra consulta.
   * En modo demostración se guarda en este navegador.
   */
  const updateProfile = useCallback(
    async ({ firstName, lastName }: { firstName: string; lastName: string }): Promise<boolean> => {
      setError(null);

      const name = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ');

      if (name.length < 2) {
        setError('Escribe al menos tu nombre.');
        return false;
      }
      if (name.length > 80) {
        setError('El nombre no puede pasar de 80 caracteres.');
        return false;
      }

      if (!supabase) {
        localStorage.setItem(DEMO_NAME_KEY, name);
        setFullName(name);
        return true;
      }

      const { error: rpcError } = await supabase.rpc('update_my_profile', { p_full_name: name });
      if (rpcError) {
        setError(
          rpcError.message.includes('not_admin')
            ? 'Tu cuenta no está registrada como administrador.'
            : 'No se pudo guardar el nombre. Revisa tu conexión.'
        );
        return false;
      }

      const { error: metaError } = await supabase.auth.updateUser({ data: { full_name: name } });
      if (metaError) {
        // El dato ya quedó en `admins`; solo falló la copia en la sesión.
        setFullName(name);
        return true;
      }

      setFullName(name);
      return true;
    },
    []
  );

  const resetPassword = useCallback(async (emailInput: string): Promise<boolean> => {
    setError(null);
    if (!supabase) {
      setError('La recuperación de contraseña requiere Supabase configurado.');
      return false;
    }
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      emailInput.trim().toLowerCase(),
      { redirectTo: `${window.location.origin}/reset-password` }
    );
    if (resetError) {
      setError(translateAuthError(resetError.message));
      return false;
    }
    return true;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      isAuthenticated,
      email,
      fullName,
      error,
      mode,
      signIn,
      signOut,
      resetPassword,
      updateProfile,
      clearError: () => setError(null),
    }),
    [loading, isAuthenticated, email, fullName, error, mode, signIn, signOut, resetPassword, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
