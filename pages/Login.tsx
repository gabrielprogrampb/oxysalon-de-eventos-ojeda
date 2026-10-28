import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../src/lib/auth';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [notice, setNotice] = useState('');
  const [forgotMode, setForgotMode] = useState(false);

  const { signIn, resetPassword, isAuthenticated, loading, error, clearError, mode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = (location.state as { from?: string } | null)?.from || '/dashboard';

  useEffect(() => {
    if (!loading && isAuthenticated) navigate(redirectTo, { replace: true });
  }, [loading, isAuthenticated, navigate, redirectTo]);

  useEffect(() => {
    if (error) setLocalError(error);
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setNotice('');
    clearError();

    if (email.trim().length < 5 || !email.includes('@')) {
      setLocalError('Escribe un correo válido.');
      return;
    }

    setSubmitting(true);
    try {
      if (forgotMode) {
        const ok = await resetPassword(email);
        if (ok) setNotice('Si el correo está registrado, recibirás un enlace para restablecer la contraseña.');
      } else {
        if (password.length < 1) {
          setLocalError('Escribe tu contraseña.');
          return;
        }
        await signIn(email, password);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background-dark text-white font-display p-4 relative overflow-hidden">
      {/* Fondo */}
      <div
        className="absolute inset-0 parallax-bg z-0 opacity-40 blur-sm"
        style={{ backgroundImage: `url("/images/oxy/img-4c3093b10c97.webp")` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent z-10"></div>

      <div className="relative z-20 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl animate-fade-in-up">
        <div className="text-center mb-8">
          <h1
            className="text-2xl font-bold tracking-tight text-white cursor-pointer"
            onClick={() => navigate('/')}
          >
            OXYSALON <span className="text-gold font-light block md:inline">DE EVENTOS</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2">Acceso administrativo</p>
        </div>

        {mode === 'demo' && (
          <div className="mb-6 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs p-3 rounded-xl leading-relaxed">
            <strong className="block mb-1">Modo demostración</strong>
            Supabase no está configurado. Puedes entrar con cualquier correo y contraseña:
            los cambios se guardan solo en este navegador.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <label htmlFor="login-email" className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
              Correo
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <span className="material-symbols-outlined text-xl">mail</span>
              </span>
              <input
                id="login-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:border-gold focus:ring-0 transition-colors"
                placeholder="tu@correo.com"
                required
              />
            </div>
          </div>

          {!forgotMode && (
            <div className="space-y-2">
              <label htmlFor="login-password" className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <span className="material-symbols-outlined text-xl">lock</span>
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-white placeholder:text-gray-600 focus:border-gold focus:ring-0 transition-colors"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {localError && (
            <div
              role="alert"
              className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">error</span>
              {localError}
            </div>
          )}

          {notice && (
            <div
              role="status"
              className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm p-3 rounded-lg flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">check_circle</span>
              {notice}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting && (
              <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
            )}
            {forgotMode ? 'Enviar enlace de recuperación' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            onClick={() => {
              setForgotMode((v) => !v);
              setLocalError('');
              setNotice('');
              clearError();
            }}
            className="text-gray-400 hover:text-gold text-xs transition-colors"
          >
            {forgotMode ? 'Volver al inicio de sesión' : '¿Olvidaste tu contraseña?'}
          </button>
          <button onClick={() => navigate('/')} className="text-gray-500 hover:text-white text-sm transition-colors">
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
