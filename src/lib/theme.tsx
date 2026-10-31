/**
 * Tema de la consola: oscuro (por defecto), claro o el del sistema.
 * Se guarda en localStorage y se aplica como `data-theme` en <html>,
 * que es lo que leen los tokens CSS de src/index.css.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type ThemeMode = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';

const KEY = 'oxy-theme';

interface ThemeContextValue {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (m: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function readMode(): ThemeMode {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === 'dark' || raw === 'light' || raw === 'system') return raw;
  } catch {
    /* almacenamiento bloqueado (modo privado): se usa el valor por defecto */
  }
  return 'dark';
}

function apply(resolved: ResolvedTheme) {
  const root = document.documentElement;
  root.setAttribute('data-theme', resolved);
  // La clase `dark` mantiene compatibles los `dark:` de las vistas públicas
  root.classList.toggle('dark', resolved === 'dark');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', resolved === 'dark' ? '#0f0b18' : '#f7f5fb');
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(readMode);
  const [resolved, setResolved] = useState<ResolvedTheme>(() =>
    readMode() === 'system' ? systemTheme() : (readMode() as ResolvedTheme)
  );

  useEffect(() => {
    const next: ResolvedTheme = mode === 'system' ? systemTheme() : mode;
    setResolved(next);
    apply(next);
    try {
      localStorage.setItem(KEY, mode);
    } catch {
      /* ignore */
    }
  }, [mode]);

  // Sigue el cambio del sistema si el modo es "system"
  useEffect(() => {
    if (mode !== 'system' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = () => {
      const next: ResolvedTheme = mq.matches ? 'light' : 'dark';
      setResolved(next);
      apply(next);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [mode]);

  const setMode = useCallback((m: ThemeMode) => setModeState(m), []);
  const value = useMemo(() => ({ mode, resolved, setMode }), [mode, resolved, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  return ctx;
}
