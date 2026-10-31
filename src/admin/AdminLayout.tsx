/**
 * =============================================================================
 * CONSOLA — estructura de navegación
 * =============================================================================
 * Barra lateral fija en escritorio, panel deslizante en móvil, migas de pan,
 * búsqueda global y menú de cuenta. Todo navegable con teclado y con
 * `aria-current` en el enlace activo.
 * =============================================================================
 */
import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useTheme, type ThemeMode } from '../lib/theme';
import { isDemo } from '../lib/store';
import { initials } from '../lib/format';
import { Badge, Glyph, IconButton, cn } from '../ui';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  end?: boolean;
  badge?: number;
}

const SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Operación',
    items: [
      { to: '/admin', label: 'Resumen', icon: 'space_dashboard', end: true },
      { to: '/admin/solicitudes', label: 'Solicitudes', icon: 'inbox' },
      { to: '/admin/agenda', label: 'Agenda', icon: 'calendar_month' },
      { to: '/admin/finanzas', label: 'Finanzas', icon: 'account_balance_wallet' },
      { to: '/admin/galeria', label: 'Galería', icon: 'photo_library' },
    ],
  },
  {
    title: 'Análisis',
    items: [
      { to: '/admin/analitica', label: 'Analítica', icon: 'monitoring' },
      { to: '/admin/actividad', label: 'Actividad', icon: 'history' },
    ],
  },
  {
    title: 'Sistema',
    items: [{ to: '/admin/configuracion', label: 'Configuración', icon: 'settings' }],
  },
];

const THEME_CYCLE: Record<ThemeMode, ThemeMode> = { dark: 'light', light: 'system', system: 'dark' };
const THEME_ICON: Record<ThemeMode, string> = { dark: 'dark_mode', light: 'light_mode', system: 'contrast' };
const THEME_LABEL: Record<ThemeMode, string> = { dark: 'Tema oscuro', light: 'Tema claro', system: 'Tema del sistema' };

export const AdminLayout: React.FC<{ newInquiries?: number }> = ({ newInquiries = 0 }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [search, setSearch] = useState('');
  const accountRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { email, fullName, signOut } = useAuth();
  const { mode, setMode } = useTheme();

  // Cierra el panel móvil al cambiar de ruta
  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  // Cierra el menú de cuenta al hacer clic fuera o con Escape
  useEffect(() => {
    if (!accountOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!accountRef.current?.contains(e.target as Node)) setAccountOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setAccountOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [accountOpen]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = search.trim();
    navigate(term ? `/admin/solicitudes?q=${encodeURIComponent(term)}` : '/admin/solicitudes');
    setSearch('');
  };

  const nav = (
    <nav aria-label="Secciones del panel" className="flex flex-1 flex-col gap-5 overflow-y-auto px-2 py-3" data-scrollarea>
      {SECTIONS.map((section) => (
        <div key={section.title}>
          <p className="px-2.5 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted/70">{section.title}</p>
          <ul className="space-y-0.5">
            {section.items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'focus-ring group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition',
                      isActive
                        ? 'bg-accent/12 text-fg ring-1 ring-inset ring-accent/25'
                        : 'text-muted hover:bg-elevated hover:text-fg'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Glyph
                        name={item.icon}
                        className={cn('text-[19px]', isActive ? 'text-accent' : 'text-muted group-hover:text-fg')}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.to === '/admin/solicitudes' && newInquiries > 0 && (
                        <span className="rounded-full bg-gold px-1.5 py-0.5 text-[10px] font-bold tabular text-black">
                          {newInquiries > 99 ? '99+' : newInquiries}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="mt-auto rounded-xl border border-line bg-elevated/60 p-3">
        <p className="text-2xs font-semibold text-fg">Sitio público</p>
        <p className="mt-0.5 text-[10px] leading-relaxed text-muted">
          Los cambios se reflejan al instante en la web.
        </p>
        <Link
          to="/"
          className="focus-ring mt-2 inline-flex items-center gap-1 text-2xs font-semibold text-accent hover:underline"
        >
          Abrir sitio <Glyph name="open_in_new" className="text-[14px]" />
        </Link>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-bg text-fg">
      <a href="#contenido" className="skip-link">
        Saltar al contenido principal
      </a>

      <div className="flex">
        {/* Barra lateral — escritorio */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-surface lg:flex">
          <div className="flex items-center gap-2.5 px-4 py-4">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple-700 text-sm font-black text-white">
              O
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold leading-tight">Oxysalon</p>
              <p className="text-[10px] uppercase tracking-wider text-muted">Consola</p>
            </div>
          </div>
          {nav}
        </aside>

        {/* Barra lateral — móvil */}
        {menuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              aria-label="Cerrar menú"
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />
            <aside className="relative flex h-full w-64 flex-col border-r border-line bg-surface">
              <div className="flex items-center justify-between px-4 py-4">
                <p className="text-sm font-bold">Oxysalon</p>
                <IconButton label="Cerrar menú" onClick={() => setMenuOpen(false)}>
                  close
                </IconButton>
              </div>
              {nav}
            </aside>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Barra superior */}
          <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur">
            <div className="flex items-center gap-2 px-3 py-2.5 sm:px-5">
              <IconButton label="Abrir menú" className="lg:hidden" onClick={() => setMenuOpen(true)}>
                menu
              </IconButton>

              <form onSubmit={submitSearch} role="search" className="relative hidden max-w-sm flex-1 sm:block">
                <label htmlFor="global-search" className="sr-only">
                  Buscar solicitudes
                </label>
                <Glyph name="search" className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  id="global-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre, correo o teléfono…"
                  className="focus-ring h-9 w-full rounded-lg border border-line bg-bg pl-9 pr-3 text-sm placeholder:text-muted/70"
                />
              </form>

              <div className="ml-auto flex items-center gap-1">
                {isDemo && <Badge tone="warn" className="hidden md:inline-flex">Modo demo</Badge>}

                <IconButton
                  label={`${THEME_LABEL[mode]} — cambiar`}
                  onClick={() => setMode(THEME_CYCLE[mode])}
                >
                  {THEME_ICON[mode]}
                </IconButton>

                <div ref={accountRef} className="relative">
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-label="Cuenta y sesión"
                    aria-expanded={accountOpen}
                    onClick={() => setAccountOpen((v) => !v)}
                    className="focus-ring flex items-center gap-2 rounded-lg border border-line px-2 py-1.5 text-left hover:bg-elevated"
                  >
                    <span className="flex size-6 items-center justify-center rounded-full bg-accent/15 text-[10px] font-bold uppercase text-accent">
                      {initials(fullName ?? email ?? 'A')}
                    </span>
                    <span className="hidden max-w-[9rem] truncate text-2xs font-medium text-muted sm:block">
                      {fullName ?? email}
                    </span>
                    <Glyph name="expand_more" className="text-muted" />
                  </button>

                  {accountOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-1.5 w-56 overflow-hidden rounded-xl border border-line bg-surface shadow-pop"
                    >
                      <div className="border-b border-line px-3 py-2.5">
                        <p className="truncate text-xs font-semibold text-fg">{fullName ?? 'Sin nombre'}</p>
                        <p className="truncate text-[10px] text-muted">{email}</p>
                        <p className="mt-0.5 text-[10px] font-medium text-accent">Administrador</p>
                      </div>
                      <Link
                        role="menuitem"
                        to="/admin/configuracion"
                        className="focus-ring flex items-center gap-2 px-3 py-2 text-xs text-fg hover:bg-elevated"
                      >
                        <Glyph name="settings" /> Configuración
                      </Link>
                      <Link
                        role="menuitem"
                        to="/"
                        className="focus-ring flex items-center gap-2 px-3 py-2 text-xs text-fg hover:bg-elevated"
                      >
                        <Glyph name="public" /> Ver sitio
                      </Link>
                      <button
                        role="menuitem"
                        onClick={() => void signOut().then(() => navigate('/login'))}
                        className="focus-ring flex w-full items-center gap-2 border-t border-line px-3 py-2 text-xs text-danger hover:bg-danger/10"
                      >
                        <Glyph name="logout" /> Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isDemo && (
              <div className="border-t border-warn/25 bg-warn/10 px-4 py-1.5 text-2xs text-warn md:hidden">
                Modo demostración: los cambios se guardan solo en este navegador.
              </div>
            )}
          </header>

          <main id="contenido" className="flex-1 px-3 py-4 sm:px-5 sm:py-6">
            <div className="mx-auto w-full max-w-[1400px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

/** Cabecera estándar de cada pantalla. */
export const PageHeader: React.FC<{
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumb?: string[];
}> = ({ title, description, actions, breadcrumb }) => (
  <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
    <div className="min-w-0">
      {breadcrumb && breadcrumb.length > 0 && (
        <nav aria-label="Miga de pan" className="mb-1 flex items-center gap-1 text-2xs text-muted">
          {breadcrumb.map((crumb, i) => (
            <span key={crumb} className="flex items-center gap-1">
              {i > 0 && <Glyph name="chevron_right" className="text-[12px]" />}
              {crumb}
            </span>
          ))}
        </nav>
      )}
      <h1 className="text-xl font-bold tracking-tight text-fg sm:text-2xl">{title}</h1>
      {description && <p className="mt-0.5 max-w-2xl text-xs leading-relaxed text-muted">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

/** Tarjeta KPI reutilizable. */
export const StatCard: React.FC<{
  label: string;
  value: string;
  hint?: string;
  icon: string;
  tone?: 'accent' | 'ok' | 'warn' | 'danger';
  delta?: number | null;
  spark?: React.ReactNode;
  onClick?: () => void;
}> = ({ label, value, hint, icon, tone = 'accent', delta, spark, onClick }) => {
  const toneClass = {
    accent: 'text-accent bg-accent/10',
    ok: 'text-ok bg-ok/10',
    warn: 'text-warn bg-warn/10',
    danger: 'text-danger bg-danger/10',
  }[tone];

  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      onClick={onClick}
      className={cn(
        'panel p-4 text-left',
        onClick && 'focus-ring transition hover:border-accent/40 hover:shadow-pop'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-2xs font-semibold uppercase tracking-wide text-muted">{label}</p>
        <span className={cn('flex size-7 items-center justify-center rounded-lg', toneClass)}>
          <Glyph name={icon} className="text-[16px]" />
        </span>
      </div>
      <p className="tabular mt-2 text-2xl font-extrabold leading-none text-fg">{value}</p>
      <div className="mt-1.5 flex items-end justify-between gap-2">
        <div className="min-w-0">
          {typeof delta === 'number' && (
            <span
              className={cn(
                'tabular inline-flex items-center gap-0.5 text-2xs font-semibold',
                delta >= 0 ? 'text-ok' : 'text-danger'
              )}
            >
              <Glyph name={delta >= 0 ? 'trending_up' : 'trending_down'} className="text-[13px]" />
              {delta >= 0 ? '+' : ''}
              {delta}%
            </span>
          )}
          {hint && <p className="truncate text-2xs text-muted">{hint}</p>}
        </div>
        {spark && <div className="w-20 shrink-0">{spark}</div>}
      </div>
    </Wrapper>
  );
};
