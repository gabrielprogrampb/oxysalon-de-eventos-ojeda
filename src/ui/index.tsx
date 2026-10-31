/**
 * =============================================================================
 * DESIGN SYSTEM — primitivas de interfaz de la consola
 * =============================================================================
 * Sin dependencias externas: solo React + Tailwind. Todo componente es
 * accesible por teclado, tiene estados de foco visibles y textos alternativos.
 * Los colores salen de los tokens semánticos definidos en src/index.css.
 * =============================================================================
 */
import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

// -----------------------------------------------------------------------------
// Utilidades
// -----------------------------------------------------------------------------
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

// -----------------------------------------------------------------------------
// Botones
// -----------------------------------------------------------------------------
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'subtle';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-accent text-white hover:brightness-110 active:brightness-95 shadow-sm disabled:bg-accent/50',
  secondary:
    'bg-elevated text-fg border border-line hover:border-accent/50 hover:bg-elevated/70',
  ghost: 'text-muted hover:text-fg hover:bg-elevated',
  danger: 'bg-danger text-white hover:brightness-110 active:brightness-95',
  subtle: 'bg-accent/10 text-accent hover:bg-accent/15 border border-accent/25',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-9 px-3.5 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-5 text-sm gap-2 rounded-xl',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  block?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', loading, icon, block, className, children, disabled, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      // Evita el doble envío: mientras carga, el botón queda inerte
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'focus-ring inline-flex select-none items-center justify-center font-semibold transition',
        'disabled:cursor-not-allowed disabled:opacity-60',
        VARIANTS[variant],
        SIZES[size],
        block && 'w-full',
        className
      )}
      {...rest}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : (
        icon
      )}
      {children}
    </button>
  );
});

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Obligatorio: es el nombre accesible del botón. */
  label: string;
  tone?: 'default' | 'danger';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, tone = 'default', className, children, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'focus-ring inline-flex size-9 items-center justify-center rounded-lg border border-transparent transition',
        tone === 'danger'
          ? 'text-muted hover:border-danger/30 hover:bg-danger/10 hover:text-danger'
          : 'text-muted hover:border-line hover:bg-elevated hover:text-fg',
        className
      )}
      {...rest}
    >
      <span aria-hidden="true" className="material-symbols-outlined text-[20px] leading-none">
        {children}
      </span>
    </button>
  );
});

// -----------------------------------------------------------------------------
// Formularios
// -----------------------------------------------------------------------------
export interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Field: React.FC<FieldProps> = ({ label, htmlFor, hint, error, required, children, className }) => (
  <div className={cn('space-y-1.5', className)}>
    <label htmlFor={htmlFor} className="block text-xs font-semibold text-fg">
      {label}
      {required && (
        <span className="ml-0.5 text-danger" aria-hidden="true">
          *
        </span>
      )}
    </label>
    {children}
    {hint && !error && <p className="text-2xs text-muted">{hint}</p>}
    {error && (
      <p role="alert" className="text-2xs font-medium text-danger">
        {error}
      </p>
    )}
  </div>
);

const CONTROL =
  'focus-ring w-full rounded-lg border bg-bg px-3 text-sm text-fg placeholder:text-muted/70 transition disabled:opacity-60';

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  function Input({ className, invalid, ...rest }, ref) {
    return (
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(CONTROL, 'h-9', invalid ? 'border-danger/60' : 'border-line hover:border-line/80', className)}
        {...rest}
      />
    );
  }
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }
>(function Textarea({ className, invalid, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(CONTROL, 'py-2 leading-relaxed', invalid ? 'border-danger/60' : 'border-line', className)}
      {...rest}
    />
  );
});

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...rest }, ref) {
    return (
      <select ref={ref} className={cn(CONTROL, 'h-9 cursor-pointer border-line pr-8', className)} {...rest}>
        {children}
      </select>
    );
  }
);

export const Switch: React.FC<{
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}> = ({ checked, onChange, label, description, disabled }) => {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <label htmlFor={id} className="block text-sm font-medium text-fg">
          {label}
        </label>
        {description && <p className="mt-0.5 text-2xs leading-relaxed text-muted">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'focus-ring relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition',
          checked ? 'bg-accent' : 'bg-line',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 size-4 rounded-full bg-white shadow transition-all',
            checked ? 'left-[1.15rem]' : 'left-0.5'
          )}
        />
      </button>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Presentación
// -----------------------------------------------------------------------------
type Tone = 'neutral' | 'accent' | 'ok' | 'warn' | 'danger' | 'info';

const TONES: Record<Tone, string> = {
  neutral: 'bg-elevated text-muted border-line',
  accent: 'bg-accent/12 text-accent border-accent/30',
  ok: 'bg-ok/12 text-ok border-ok/30',
  warn: 'bg-warn/12 text-warn border-warn/30',
  danger: 'bg-danger/12 text-danger border-danger/30',
  info: 'bg-blue-500/12 text-blue-400 border-blue-500/30',
};

export const Badge: React.FC<{ tone?: Tone; children: React.ReactNode; dot?: boolean; className?: string }> = ({
  tone = 'neutral',
  children,
  dot,
  className,
}) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-2xs font-semibold whitespace-nowrap',
      TONES[tone],
      className
    )}
  >
    {dot && <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />}
    {children}
  </span>
);

export const Avatar: React.FC<{ name: string; className?: string }> = ({ name, className }) => {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
  // Color estable derivado del nombre (sin Math.random: mismo usuario, mismo color)
  const hue = [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
  return (
    <span
      aria-hidden="true"
      className={cn('inline-flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold', className)}
      style={{ backgroundColor: `hsl(${hue} 55% 22%)`, color: `hsl(${hue} 80% 82%)` }}
    >
      {initials || '?'}
    </span>
  );
};

const BAR_TONE: Record<Tone, string> = {
  neutral: 'bg-muted',
  accent: 'bg-accent',
  ok: 'bg-ok',
  warn: 'bg-warn',
  danger: 'bg-danger',
  info: 'bg-blue-400',
};

export const Progress: React.FC<{ value: number; max?: number; label?: string; tone?: Tone }> = ({
  value,
  max = 100,
  label,
  tone = 'accent',
}) => {
  const pct = Math.max(0, Math.min(100, (value / (max || 1)) * 100));
  return (
    <div>
      {label && (
        <div className="mb-1 flex justify-between text-2xs text-muted">
          <span>{label}</span>
          <span className="tabular">{pct.toFixed(0)}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progreso'}
        className="h-1.5 w-full overflow-hidden rounded-full bg-elevated"
      >
        <div className={cn('h-full rounded-full transition-all', BAR_TONE[tone])} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Estados
// -----------------------------------------------------------------------------
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('skeleton', className)} aria-hidden="true" />
);

export const LoadingBlock: React.FC<{ label?: string; rows?: number }> = ({ label = 'Cargando…', rows = 3 }) => (
  <div role="status" aria-live="polite" className="space-y-3 p-5">
    <span className="sr-only">{label}</span>
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className={cn('h-10', i === rows - 1 && 'w-2/3')} />
    ))}
  </div>
);

export const EmptyState: React.FC<{
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ icon = 'inbox', title, description, action }) => (
  <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
    <span
      aria-hidden="true"
      className="material-symbols-outlined flex size-12 items-center justify-center rounded-2xl border border-line bg-elevated text-2xl text-muted"
    >
      {icon}
    </span>
    <div>
      <p className="text-sm font-semibold text-fg">{title}</p>
      {description && <p className="mx-auto mt-1 max-w-sm text-2xs leading-relaxed text-muted">{description}</p>}
    </div>
    {action}
  </div>
);

export const ErrorState: React.FC<{
  title?: string;
  description?: string;
  onRetry?: () => void;
  retrying?: boolean;
}> = ({ title = 'No se pudieron cargar los datos', description, onRetry, retrying }) => (
  <div role="alert" className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
    <span
      aria-hidden="true"
      className="material-symbols-outlined flex size-12 items-center justify-center rounded-2xl border border-danger/30 bg-danger/10 text-2xl text-danger"
    >
      cloud_off
    </span>
    <div>
      <p className="text-sm font-semibold text-fg">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-2xs leading-relaxed text-muted">
        {description ?? 'Revisa tu conexión. Si el problema continúa, escríbenos por WhatsApp.'}
      </p>
    </div>
    {onRetry && (
      <Button size="sm" variant="secondary" onClick={onRetry} loading={retrying} icon={<Glyph name="refresh" />}>
        Reintentar
      </Button>
    )}
  </div>
);

/** Icono Material Symbols con tamaño controlado. */
export const Glyph: React.FC<{ name: string; className?: string }> = ({ name, className }) => (
  <span aria-hidden="true" className={cn('material-symbols-outlined text-[18px] leading-none', className)}>
    {name}
  </span>
);

// -----------------------------------------------------------------------------
// Tablas
// -----------------------------------------------------------------------------
export const TableWrap: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div data-scrollarea className={cn('overflow-x-auto', className)}>
    <table className="w-full border-collapse text-left text-sm">{children}</table>
  </div>
);

export const Th: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className, children, ...rest }) => (
  <th
    scope="col"
    className={cn(
      'sticky top-0 z-10 whitespace-nowrap border-b border-line bg-surface px-4 py-2.5 text-2xs font-semibold uppercase tracking-wide text-muted',
      className
    )}
    {...rest}
  >
    {children}
  </th>
);

export const Td: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className, children, ...rest }) => (
  <td className={cn('border-b border-line/60 px-4 py-3 align-middle text-fg', className)} {...rest}>
    {children}
  </td>
);

export const Pagination: React.FC<{
  page: number;
  pageSize: number;
  total: number;
  onPage: (p: number) => void;
  onPageSize?: (s: number) => void;
}> = ({ page, pageSize, total, onPage, onPageSize }) => {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <nav
      aria-label="Paginación"
      className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 text-2xs text-muted"
    >
      <p className="tabular">
        {from}–{to} de {total.toLocaleString('es-VE')}
      </p>
      <div className="flex items-center gap-2">
        {onPageSize && (
          <label className="flex items-center gap-1.5">
            <span className="sr-only sm:not-sr-only">Filas</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSize(Number(e.target.value))}
              className="focus-ring h-7 rounded-md border border-line bg-bg px-1.5 text-2xs text-fg"
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        )}
        <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Anterior
        </Button>
        <span className="tabular px-1">
          {page} / {pages}
        </span>
        <Button size="sm" variant="ghost" disabled={page >= pages} onClick={() => onPage(page + 1)}>
          Siguiente
        </Button>
      </div>
    </nav>
  );
};

// -----------------------------------------------------------------------------
// Tabs y segmentado
// -----------------------------------------------------------------------------
export const Tabs: React.FC<{
  tabs: { id: string; label: string; count?: number }[];
  value: string;
  onChange: (id: string) => void;
  label: string;
}> = ({ tabs, value, onChange, label }) => {
  // Navegación con flechas dentro del tablist (patrón ARIA de tabs)
  const onKeyDown = (e: React.KeyboardEvent) => {
    const idx = tabs.findIndex((t) => t.id === value);
    if (idx < 0) return;
    let next = idx;
    if (e.key === 'ArrowRight') next = (idx + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (idx - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    else return;
    e.preventDefault();
    onChange(tabs[next].id);
  };

  return (
    <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className="flex gap-1 overflow-x-auto border-b border-line">
      {tabs.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(t.id)}
            className={cn(
              'focus-ring relative -mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition',
              active ? 'border-accent text-fg' : 'border-transparent text-muted hover:text-fg'
            )}
          >
            {t.label}
            {typeof t.count === 'number' && (
              <span className="ml-1.5 rounded bg-elevated px-1.5 py-0.5 text-2xs tabular text-muted">{t.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export const Segmented: React.FC<{
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  label: string;
}> = ({ options, value, onChange, label }) => (
  <div role="group" aria-label={label} className="inline-flex rounded-lg border border-line bg-bg p-0.5">
    {options.map((o) => (
      <button
        key={o.id}
        type="button"
        aria-pressed={o.id === value}
        onClick={() => onChange(o.id)}
        className={cn(
          'focus-ring rounded-md px-2.5 py-1 text-2xs font-semibold transition',
          o.id === value ? 'bg-accent text-white shadow-sm' : 'text-muted hover:text-fg'
        )}
      >
        {o.label}
      </button>
    ))}
  </div>
);

// -----------------------------------------------------------------------------
// Superposiciones accesibles (modal / drawer)
// -----------------------------------------------------------------------------
function useLockBody(open: boolean) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);
}

function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
}

/** Atrapa el foco dentro del contenedor (WCAG 2.4.3). */
function useFocusTrap(open: boolean, ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open || !ref.current) return;
    const node = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    const selector =
      'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';
    const focusables = () => Array.from(node.querySelectorAll<HTMLElement>(selector)).filter((el) => el.offsetParent !== null);
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    node.addEventListener('keydown', onKey);
    return () => {
      node.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [open, ref]);
}

export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({ open, onClose, title, description, children, footer, size = 'md' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useLockBody(open);
  useEscape(open, onClose);
  useFocusTrap(open, ref);

  if (!open) return null;
  const width =
    size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-2xl' : size === 'xl' ? 'max-w-4xl' : 'max-w-lg';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <button className="absolute inset-0 cursor-default" aria-label="Cerrar" tabIndex={-1} onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'relative w-full rounded-t-2xl border border-line bg-surface shadow-pop sm:rounded-2xl',
          width,
          'animate-fade-in-up'
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 id={titleId} className="text-base font-semibold tracking-tight text-fg">
              {title}
            </h2>
            {description && <p className="mt-1 text-2xs leading-relaxed text-muted">{description}</p>}
          </div>
          <IconButton label="Cerrar" onClick={onClose}>
            close
          </IconButton>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4" data-scrollarea>
          {children}
        </div>
        {footer && <div className="flex justify-end gap-2 border-t border-line px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
};

export const Drawer: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}> = ({ open, onClose, title, subtitle, children, footer }) => {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useLockBody(open);
  useEscape(open, onClose);
  useFocusTrap(open, ref);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <button className="absolute inset-0 cursor-default" aria-label="Cerrar" tabIndex={-1} onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex h-full w-full max-w-md flex-col border-l border-line bg-surface shadow-pop"
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="truncate text-base font-semibold tracking-tight text-fg">
              {title}
            </h2>
            {subtitle && <p className="truncate text-2xs text-muted">{subtitle}</p>}
          </div>
          <IconButton label="Cerrar" onClick={onClose}>
            close
          </IconButton>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4" data-scrollarea>
          {children}
        </div>
        {footer && <div className="border-t border-line px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Toasts (avisos no bloqueantes, anunciados por lector de pantalla)
// -----------------------------------------------------------------------------
type ToastTone = 'ok' | 'danger' | 'info';
interface Toast {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
}

const ToastContext = createContext<{ push: (t: Omit<Toast, 'id'>) => void } | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { ...t, id }]);
    window.setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== id)), 5200);
  }, []);
  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(92vw,22rem)] flex-col gap-2"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-start gap-2.5 rounded-xl border px-3.5 py-3 shadow-pop backdrop-blur',
              t.tone === 'ok'
                ? 'border-ok/30 bg-ok/12'
                : t.tone === 'danger'
                  ? 'border-danger/30 bg-danger/12'
                  : 'border-line bg-elevated'
            )}
          >
            <Glyph
              name={t.tone === 'ok' ? 'check_circle' : t.tone === 'danger' ? 'error' : 'info'}
              className={cn('mt-0.5', t.tone === 'ok' ? 'text-ok' : t.tone === 'danger' ? 'text-danger' : 'text-accent')}
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-fg">{t.title}</p>
              {t.description && <p className="mt-0.5 text-2xs leading-relaxed text-muted">{t.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx;
}

// -----------------------------------------------------------------------------
// Diálogo de confirmación (para acciones destructivas)
// -----------------------------------------------------------------------------
export const ConfirmDialog: React.FC<{
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}> = ({ open, title, description, confirmLabel = 'Confirmar', onConfirm, onCancel }) => {
  const [busy, setBusy] = useState(false);
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={busy}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            loading={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm();
              } finally {
                setBusy(false);
              }
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-muted">
        Esta acción queda registrada en el historial de actividad y no se puede deshacer.
      </p>
    </Modal>
  );
};
