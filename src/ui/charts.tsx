/**
 * =============================================================================
 * GRÁFICAS — SVG puro, sin librerías externas
 * =============================================================================
 * Todas son responsivas (viewBox + width 100%), accesibles (role="img" con
 * título y descripción) y respetan los tokens de color del tema activo.
 * =============================================================================
 */
import React, { useId, useMemo, useState } from 'react';
import { cn } from './index';

export interface Point {
  label: string;
  value: number;
}

const fmtInt = (n: number) => n.toLocaleString('es-VE');

// -----------------------------------------------------------------------------
// Sparkline: tendencia compacta para tarjetas KPI
// -----------------------------------------------------------------------------
export const Sparkline: React.FC<{ values: number[]; tone?: string; className?: string }> = ({
  values,
  tone = 'var(--accent)',
  className,
}) => {
  const path = useMemo(() => {
    if (values.length < 2) return '';
    const max = Math.max(...values);
    const min = Math.min(...values);
    const span = max - min || 1;
    return values
      .map((v, i) => {
        const x = (i / (values.length - 1)) * 100;
        const y = 30 - ((v - min) / span) * 26 - 2;
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  }, [values]);

  if (!path) return null;

  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className={cn('h-8 w-full', className)} aria-hidden="true">
      <path d={path} fill="none" stroke={tone} strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

// -----------------------------------------------------------------------------
// Área: evolución en el tiempo con tooltip accesible
// -----------------------------------------------------------------------------
export const AreaChart: React.FC<{
  data: Point[];
  height?: number;
  label: string;
  tone?: string;
  format?: (n: number) => string;
}> = ({ data, height = 220, label, tone = 'var(--accent)', format = fmtInt }) => {
  const gid = useId().replace(/:/g, '');
  const [hover, setHover] = useState<number | null>(null);

  const W = 600;
  const H = 220;
  const padX = 8;
  const padY = 14;

  const max = Math.max(1, ...data.map((d) => d.value));
  const step = data.length > 1 ? (W - padX * 2) / (data.length - 1) : 0;
  const x = (i: number) => padX + i * step;
  const y = (v: number) => H - padY - (v / max) * (H - padY * 2);

  const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(' ');
  const area = data.length > 0 ? `${line} L${x(data.length - 1).toFixed(1)},${H - padY} L${padX},${H - padY} Z` : '';
  const total = data.reduce((a, d) => a + d.value, 0);
  const peak = data.reduce((best, d) => (d.value > best.value ? d : best), data[0] ?? { label: '—', value: 0 });

  return (
    <figure className="w-full">
      <figcaption className="sr-only">
        {label}. Total {format(total)} en el periodo. Máximo {format(peak.value)} el {peak.label}.
      </figcaption>
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ height }}
          className="w-full overflow-visible"
          role="img"
          aria-label={`${label}. Total ${format(total)}.`}
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id={`g${gid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={tone} stopOpacity="0.32" />
              <stop offset="100%" stopColor={tone} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Rejilla horizontal: 4 líneas guía */}
          {[0, 0.25, 0.5, 0.75, 1].map((r) => (
            <line
              key={r}
              x1={padX}
              x2={W - padX}
              y1={padY + r * (H - padY * 2)}
              y2={padY + r * (H - padY * 2)}
              stroke="rgb(var(--line))"
              strokeWidth="1"
              strokeDasharray={r === 1 ? '0' : '3 4'}
            />
          ))}

          <path d={area} fill={`url(#g${gid})`} />
          <path d={line} fill="none" stroke={tone} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {data.map((d, i) => (
            <g key={`${d.label}-${i}`}>
              {/* Zona táctil amplia por punto */}
              <rect
                x={x(i) - step / 2}
                y={0}
                width={Math.max(step, 6)}
                height={H}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                tabIndex={-1}
              />
              {hover === i && (
                <>
                  <line x1={x(i)} x2={x(i)} y1={padY} y2={H - padY} stroke={tone} strokeWidth="1" strokeDasharray="3 3" />
                  <circle cx={x(i)} cy={y(d.value)} r="4" fill={tone} stroke="rgb(var(--surface))" strokeWidth="2" />
                </>
              )}
            </g>
          ))}
        </svg>

        {hover !== null && data[hover] && (
          <div
            className="pointer-events-none absolute top-0 rounded-lg border border-line bg-elevated px-2 py-1 text-2xs shadow-pop"
            style={{ left: `min(max(${(x(hover) / W) * 100}%, 0px), calc(100% - 6rem))` }}
          >
            <span className="block text-muted">{data[hover].label}</span>
            <span className="tabular font-semibold text-fg">{format(data[hover].value)}</span>
          </div>
        )}
      </div>

      {/* Etiquetas de eje: solo primera, media y última para no saturar */}
      <div className="mt-1 flex justify-between text-2xs text-muted">
        <span>{data[0]?.label ?? ''}</span>
        <span>{data[Math.floor(data.length / 2)]?.label ?? ''}</span>
        <span>{data[data.length - 1]?.label ?? ''}</span>
      </div>
    </figure>
  );
};

// -----------------------------------------------------------------------------
// Barras: comparativa por categoría o por mes
// -----------------------------------------------------------------------------
export const BarChart: React.FC<{
  data: Point[];
  height?: number;
  label: string;
  tone?: string;
  format?: (n: number) => string;
  horizontal?: boolean;
}> = ({ data, height = 200, label, tone = 'var(--accent)', format = fmtInt }) => {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <figure className="w-full">
      <figcaption className="sr-only">{label}</figcaption>
      <div className="flex items-end gap-1.5" style={{ height }} role="img" aria-label={label}>
        {data.map((d, i) => {
          const pct = (d.value / max) * 100;
          return (
            <div key={`${d.label}-${i}`} className="group relative flex h-full flex-1 flex-col justify-end gap-1">
              <div
                className="relative w-full rounded-t transition-all group-hover:opacity-90"
                style={{ height: `${Math.max(pct, 2)}%`, backgroundColor: tone }}
              >
                <span className="absolute -top-5 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-elevated px-1.5 py-0.5 text-2xs tabular text-fg shadow-pop group-hover:block">
                  {format(d.value)}
                </span>
              </div>
              <span className="truncate text-center text-[10px] text-muted">{d.label}</span>
            </div>
          );
        })}
      </div>
    </figure>
  );
};

// -----------------------------------------------------------------------------
// Dona: distribución de estados
// -----------------------------------------------------------------------------
const DONUT_TONES: Record<string, string> = {
  accent: 'var(--accent)',
  ok: 'var(--ok)',
  warn: 'var(--warn)',
  danger: 'var(--danger)',
  info: '#60a5fa',
  neutral: 'rgb(var(--line))',
};

export const Donut: React.FC<{
  segments: { label: string; value: number; tone: keyof typeof DONUT_TONES }[];
  label: string;
  centerLabel?: string;
  size?: number;
}> = ({ segments, label, centerLabel, size = 150 }) => {
  const total = segments.reduce((a, s) => a + s.value, 0);
  const R = 42;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="flex flex-wrap items-center gap-5">
      <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`${label}: ${total} en total`}>
        <circle cx="50" cy="50" r={R} fill="none" stroke="rgb(var(--elevated))" strokeWidth="14" />
        {total > 0 &&
          segments.map((s) => {
            const len = (s.value / total) * C;
            const dash = `${len} ${C - len}`;
            const el = (
              <circle
                key={s.label}
                cx="50"
                cy="50"
                r={R}
                fill="none"
                stroke={DONUT_TONES[s.tone]}
                strokeWidth="14"
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                transform="rotate(-90 50 50)"
                strokeLinecap="butt"
              />
            );
            offset += len;
            return el;
          })}
        <text
          x="50"
          y="48"
          textAnchor="middle"
          className="fill-[rgb(var(--fg))]"
          style={{ fontSize: 16, fontWeight: 700 }}
        >
          {centerLabel ?? fmtInt(total)}
        </text>
        <text x="50" y="60" textAnchor="middle" className="fill-[rgb(var(--muted))]" style={{ fontSize: 7 }}>
          {label}
        </text>
      </svg>

      <ul className="flex-1 space-y-1.5">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-2xs">
            <span
              aria-hidden="true"
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: DONUT_TONES[s.tone] }}
            />
            <span className="flex-1 text-muted">{s.label}</span>
            <span className="tabular font-semibold text-fg">{fmtInt(s.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Embudo: conversión del proceso comercial
// -----------------------------------------------------------------------------
export const Funnel: React.FC<{ steps: { label: string; value: number }[]; label: string }> = ({ steps, label }) => {
  const top = Math.max(1, steps[0]?.value ?? 1);
  return (
    <div role="img" aria-label={label} className="space-y-2.5">
      {steps.map((s, i) => {
        const pct = (s.value / top) * 100;
        const prev = i > 0 ? steps[i - 1].value : s.value;
        const drop = prev > 0 ? Math.round((s.value / prev) * 100) : 0;
        return (
          <div key={s.label}>
            <div className="mb-1 flex items-baseline justify-between text-2xs">
              <span className="text-muted">{s.label}</span>
              <span className="tabular font-semibold text-fg">
                {fmtInt(s.value)}
                {i > 0 && <span className="ml-1.5 font-normal text-muted">({drop}%)</span>}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-elevated">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(pct, 1.5)}%`,
                  backgroundColor: `hsl(268 70% ${62 - i * 6}%)`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
