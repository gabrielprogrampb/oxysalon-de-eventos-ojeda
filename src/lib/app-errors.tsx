/**
 * =============================================================================
 * RESILIENCIA DE LA INTERFAZ
 * =============================================================================
 * · ErrorBoundary: si un componente falla, la app no queda en blanco.
 * · OfflineBanner: avisa cuando el usuario pierde la conexión.
 * Ninguno de los dos oculta el error: se registra en consola para diagnóstico.
 * =============================================================================
 */
import React, { Component, useEffect, useState } from 'react';

interface State {
  error: Error | null;
  info: string | null;
}

export class ErrorBoundary extends Component<{ children: React.ReactNode }, State> {
  state: State = { error: null, info: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Traza mínima, sin datos personales del visitante
    console.error('[ui] error no controlado:', error, info.componentStack?.slice(0, 800));
    this.setState({ info: info.componentStack ?? null });
  }

  private reset = () => {
    this.setState({ error: null, info: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-4 text-fg">
        <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-7 shadow-panel">
          <span
            aria-hidden="true"
            className="material-symbols-outlined mb-4 flex size-12 items-center justify-center rounded-2xl border border-danger/30 bg-danger/10 text-2xl text-danger"
          >
            report
          </span>
          <h1 className="text-lg font-semibold tracking-tight">Algo se rompió en esta pantalla</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            El error quedó registrado. Puedes reintentar sin recargar la página; si vuelve a pasar, recarga el
            navegador o escríbenos.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={this.reset}
              className="focus-ring rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-white"
            >
              Reintentar
            </button>
            <button
              onClick={() => window.location.reload()}
              className="focus-ring rounded-lg border border-line bg-elevated px-3.5 py-2 text-sm font-semibold"
            >
              Recargar
            </button>
            <a
              href="/"
              className="focus-ring rounded-lg px-3.5 py-2 text-sm font-semibold text-muted hover:text-fg"
            >
              Ir al inicio
            </a>
          </div>

          {import.meta.env.DEV && this.state.info && (
            <pre className="mt-5 max-h-40 overflow-auto rounded-lg bg-bg p-3 text-[10px] leading-relaxed text-muted">
              {this.state.error.message}
              {this.state.info}
            </pre>
          )}
        </div>
      </div>
    );
  }
}

/** Aviso persistente cuando no hay red. */
export const OfflineBanner: React.FC = () => {
  const [offline, setOffline] = useState(() => typeof navigator !== 'undefined' && !navigator.onLine);

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-[70] flex items-center justify-center gap-2 bg-warn px-4 py-1.5 text-2xs font-semibold text-black"
    >
      <span aria-hidden="true" className="material-symbols-outlined text-[16px]">
        wifi_off
      </span>
      Sin conexión. Los cambios no se guardarán hasta que vuelvas a estar en línea.
    </div>
  );
};
