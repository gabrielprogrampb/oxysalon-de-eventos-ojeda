/**
 * Analítica: tráfico, conversión e ingresos con rango de fechas.
 * Todos los agregados vienen calculados del servidor (RPC analytics_summary).
 */
import React, { useMemo, useState } from 'react';
import { PageHeader, StatCard } from '../AdminLayout';
import { getAnalytics } from '../../lib/admin';
import { useAsyncData } from '../../lib/useAsync';
import { formatCurrency, formatDate, STATUS_META } from '../../lib/format';
import { AreaChart, BarChart, Donut, Funnel } from '../../ui/charts';
import { Badge, ErrorState, Glyph, Progress, Segmented, Skeleton, TableWrap, Td, Th } from '../../ui';

const RANGES = [
  { id: '7', label: '7 días' },
  { id: '30', label: '30 días' },
  { id: '90', label: '90 días' },
];

export const Analytics: React.FC = () => {
  const [range, setRange] = useState('30');
  const days = Number(range);

  const { data, error, loading, initial, reload } = useAsyncData(() => getAnalytics(days), [days]);

  const series = data?.series ?? [];

  // Agrupación mensual para la gráfica de ingresos (legible en 90 días)
  const monthly = useMemo(() => {
    const buckets = new Map<string, number>();
    for (const d of data?.series ?? []) {
      const key = d.date.slice(0, 7);
      buckets.set(key, (buckets.get(key) ?? 0) + d.revenue);
    }
    return [...buckets.entries()].map(([key, value]) => ({
      label: new Date(`${key}-01T12:00:00`).toLocaleDateString('es-VE', { month: 'short' }),
      value: Math.round(value),
    }));
  }, [data]);

  const statusSegments = Object.entries(data?.statusCounts ?? {})
    .map(([s, v]) => ({
      label: STATUS_META[s as keyof typeof STATUS_META]?.label ?? s,
      value: Number(v),
      tone: s === 'booked' ? ('ok' as const) : s === 'new' ? ('accent' as const) : s === 'lost' ? ('neutral' as const) : ('info' as const),
    }))
    .sort((a, b) => b.value - a.value);

  const maxPath = Math.max(1, ...(data?.topPaths ?? []).map((p) => p.views));

  return (
    <div>
      <PageHeader
        title="Analítica"
        description="Tráfico, conversión y valor generado. Las visitas se deduplican por sesión y hora."
        breadcrumb={['Panel', 'Analítica']}
        actions={
          <>
            <Segmented label="Rango de fechas" options={RANGES} value={range} onChange={setRange} />
            <button
              onClick={reload}
              className="focus-ring inline-flex size-8 items-center justify-center rounded-lg border border-line text-muted hover:text-fg"
              aria-label="Actualizar métricas"
            >
              <Glyph name="refresh" />
            </button>
          </>
        }
      />

      {error ? (
        <div className="panel">
          <ErrorState onRetry={reload} retrying={loading} />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {initial ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[118px]" />)
            ) : (
              <>
                <StatCard label="Visitas" value={(data?.totals.visits ?? 0).toLocaleString('es-VE')} icon="visibility" />
                <StatCard
                  label="Solicitudes"
                  value={String(data?.totals.inquiries ?? 0)}
                  icon="inbox"
                  tone="accent"
                  hint={`${data && data.totals.visits > 0 ? ((data.totals.inquiries / data.totals.visits) * 100).toFixed(1) : '0.0'}% de las visitas`}
                />
                <StatCard
                  label="Reservas"
                  value={String(data?.totals.booked ?? 0)}
                  icon="event_available"
                  tone="ok"
                  hint={`${data && data.totals.inquiries > 0 ? ((data.totals.booked / data.totals.inquiries) * 100).toFixed(0) : 0}% de las solicitudes`}
                />
                <StatCard
                  label="Ingresos"
                  value={formatCurrency(data?.totals.revenue ?? 0)}
                  icon="payments"
                  tone="ok"
                  hint="Registrados en finanzas"
                />
              </>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
            <section className="panel xl:col-span-2" aria-labelledby="visits-title">
              <div className="panel-header">
                <div>
                  <h2 id="visits-title" className="panel-title">
                    Visitas y solicitudes
                  </h2>
                  <p className="panel-sub">Comparativa diaria del periodo</p>
                </div>
                <div className="flex gap-3 text-2xs text-muted">
                  <span className="flex items-center gap-1">
                    <span className="size-2 rounded-full bg-accent" /> Visitas
                  </span>
                </div>
              </div>
              <div className="p-4">
                {initial ? (
                  <Skeleton className="h-[220px]" />
                ) : (
                  <AreaChart
                    label="Visitas diarias"
                    data={series.map((d) => ({ label: formatDate(d.date), value: d.visits }))}
                  />
                )}
              </div>
            </section>

            <section className="panel" aria-labelledby="status-title">
              <div className="panel-header">
                <h2 id="status-title" className="panel-title">
                  Distribución del embudo
                </h2>
              </div>
              <div className="p-4">
                {statusSegments.length === 0 ? (
                  <p className="py-8 text-center text-2xs text-muted">Sin solicitudes registradas.</p>
                ) : (
                  <>
                    <Donut segments={statusSegments} label="solicitudes" />
                    <div className="mt-4">
                      <Funnel
                        label="Conversión del periodo"
                        steps={[
                          { label: 'Visitas', value: data?.totals.visits ?? 0 },
                          { label: 'Solicitudes', value: data?.totals.inquiries ?? 0 },
                          { label: 'Reservas', value: data?.totals.booked ?? 0 },
                        ]}
                      />
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            <section className="panel" aria-labelledby="revenue-title">
              <div className="panel-header">
                <div>
                  <h2 id="revenue-title" className="panel-title">
                    Ingresos por mes
                  </h2>
                  <p className="panel-sub">Movimientos de tipo ingreso registrados en el panel</p>
                </div>
              </div>
              <div className="p-4">
                {monthly.length === 0 ? (
                  <p className="py-10 text-center text-2xs text-muted">Todavía no hay ingresos registrados.</p>
                ) : (
                  <BarChart label="Ingresos mensuales" data={monthly} format={formatCurrency} tone="var(--ok)" />
                )}
              </div>
            </section>

            <section className="panel" aria-labelledby="paths-title">
              <div className="panel-header">
                <h2 id="paths-title" className="panel-title">
                  Páginas más visitadas
                </h2>
                <Badge tone="neutral">{data?.topPaths.length ?? 0}</Badge>
              </div>
              {(data?.topPaths.length ?? 0) === 0 ? (
                <p className="px-4 py-10 text-center text-2xs text-muted">Sin visitas en el periodo.</p>
              ) : (
                <TableWrap>
                  <thead>
                    <tr>
                      <Th>Ruta</Th>
                      <Th className="text-right">Visitas</Th>
                      <Th className="w-1/3">Peso</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.topPaths.map((p) => (
                      <tr key={p.path}>
                        <Td className="font-mono text-xs">{p.path}</Td>
                        <Td className="tabular text-right text-xs font-semibold">{p.views.toLocaleString('es-VE')}</Td>
                        <Td>
                          <Progress value={p.views} max={maxPath} label={undefined} />
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </TableWrap>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
};
