import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../src/lib/supabase';

/**
 * Pantalla a la que llega el usuario desde el correo de recuperación.
 * Supabase abre la sesión temporal con el token del enlace; aquí solo se
 * define la contraseña nueva.
 */
const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setError('La recuperación de contraseña requiere Supabase configurado.');
      return;
    }
    let active = true;

    // El enlace puede traer la sesión en el hash (#access_token=...) o en ?code=
    const init = async () => {
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      if (active) setReady(Boolean(data.session));
    };
    void init();

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (active && (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') && session) {
        setReady(true);
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (!supabase) return;

    setSaving(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError('No se pudo actualizar la contraseña. El enlace pudo haber expirado.');
        return;
      }
      setDone(true);
      await supabase.auth.signOut();
      setTimeout(() => navigate('/login', { replace: true }), 2200);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background-dark text-white font-display p-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-center mb-2">Nueva contraseña</h1>
        <p className="text-gray-400 text-sm text-center mb-8">
          Define una contraseña nueva para tu cuenta administrativa.
        </p>

        {done ? (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm p-4 rounded-xl text-center">
            Contraseña actualizada. Te llevamos al inicio de sesión…
          </div>
        ) : !isSupabaseConfigured ? (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm p-4 rounded-xl">
            Supabase no está configurado en este entorno.
          </div>
        ) : !ready ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-sm p-4 rounded-xl">
            El enlace no es válido o ya expiró. Solicita uno nuevo desde la pantalla de inicio de sesión.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="new-password" className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
                Contraseña nueva
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl py-4 px-4 text-white focus:border-gold focus:ring-0"
                placeholder="Mínimo 8 caracteres"
                required
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
                Repetir contraseña
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl py-4 px-4 text-white focus:border-gold focus:ring-0"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div role="alert" className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-primary to-purple-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all disabled:opacity-60"
            >
              {saving ? 'Guardando…' : 'Guardar contraseña'}
            </button>
          </form>
        )}

        <button
          onClick={() => navigate('/login')}
          className="mt-6 w-full text-center text-gray-500 hover:text-white text-sm transition-colors"
        >
          Volver al inicio de sesión
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;
