/**
 * Resumen general: estado del negocio de un vistazo.
 * Densidad alta pero jerarquizada: cifras clave arriba, tendencia al centro,
 * trabajo pendiente a la derecha.
 */
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader, StatCard } from '../AdminLayout';
import { getAnalytics, listInquiriesPaged } from '../../lib/admin';
import { listCalendarEvents } from '../../lib/store';
import { useAsyncData } from '../../lib/useAsync';
import { formatCurrency, formatDate, formatRelative, STATUS_META } from '../../lib/format';
import { AreaChart, Donut, Funnel, Sparkline } from '../../ui/charts';
import { Badge, Button, EmptyState, ErrorState, Glyph, LoadingBlock, Skeleton } from '../../ui';

const RANGE = 30;

export const Overview: React.FC = () => {
  const navigate = useNavigate();

  const analytics = useAsyncData(() => getAnalytics(RANGE), []);
  const recent = useAsyncData(() => listInquiriesPaged({ page: 1, pageSize: 6, sort: 'recent' }), []);
  const agenda = useAsyncData(() => listCalendarEvents(), []);

  const a = analytics.data;
  const series = a?.series ?? [];

  // Comparativa: últimos 7 días contra los 7 anteriores (misma base de datos)
  const last7 = series.slice(-7).reduce((s, d) => s + d.visits, 0);
  const prev7 = series.slice(-14, -7).reduce((s, d) => s + d.visits, 0);
  const deltaVisits = prev7 > 0 ? Math.round(((last7 - prev7) / prev7) * 100) : null;

  const upcoming = (agenda.data ?? [])
    .filter((e) => new Date(`${e.date}T23:59:59`) >= new Date())
    .sort((x, y) => x.date.localeCompare(y.date))
    .slice(0, 5);

  const statusSegments = Object.entries(a?.statusCounts ?? {})
    .map(([status, value]) => ({
      label: STATUS_META[status as keyof typeof STATUS_META]?.label ?? status,
      value: Number(value),
      tone:
        status === 'booked'
          ? ('ok' as const)
          : status === 'new'
            ? ('accent' as const)
            : status === 'lost'
              ? ('neutral' as const)
              : status === 'quoted'
                ? ('warn' as const)
                : ('info' as const),
    }))
    .sort((x, y) => y.value - x.value);

  return (
    <div>
      <PageHeader
        title="Resumen"
        description={`Estado del negocio en los últimos ${RANGE} días.`}
        breadcrumb={['Panel']}
        actions={
          <>
            <Button variant="secondary" size="sm" icon={<Glyph name="refresh" />} onClick={() => analytics.reload()}>
              Actualizar
            </Button>
            <Button variant="primary" size="sm" icon={<Glyph name="monitoring" />} onClick={() => navigate('/admin/analitica')}>
              Ver analítica
            </Button>
          </>
        }
      />

      {analytics.error ? (
        <div className="panel">
          <ErrorState onRetry={analytics.reload} retrying={analytics.loading} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {analytics.initial || !a ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[118px]" />)
            ) : (
              <>
                <StatCard
                  label="Solicitudes nuevas"
                  value={String(a.pending.newInquiries)}
                  hint="Sin responder todavía"
                  icon="inbox"
                  tone={a.pending.newInquiries > 0 ? 'warn' : 'ok'}
                  onClick={() => navigate('/admin/solicitudes?estado=new')}
                />
                <StatCard
                  label="Visitas (7 días)"
                  value={last7.toLocaleString('es-VE')}
                  icon="visibility"
                  delta={deltaVisits}
                  spark={<Sparkline values={series.slice(-14).map((d) => d.visits)} />}
                />
                <StatCard
                  label="Eventos próximos"
                  value={String(a.pending.upcoming)}
                  hint="Fechas ocupadas en agenda"
                  icon="event"
                  onClick={() => navigate('/admin/agenda')}
                />
                <StatCard
                  label="Reservas cerradas"
                  value={formatCurrency(a.allTime.revenue)}
                  hint={`${a.allTime.booked} eventos confirmados`}
                  icon="payments"
                  tone="ok"
                  onClick={() => navigate('/admin/finanzas')}
                />
              </>
            )}
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-3">
            {/* Tendencia */}
            <section className="panel xl:col-span-2" aria-labelledby="trend-title">
              <div className="panel-header">
                <div>
                  <h2 id="trend-title" className="panel-title">
                    Visitas del sitio
                  </h2>
                  <p className="panel-sub">Últimos {RANGE} días · una visita por sesión y hora</p>
                </div>
                <Badge tone="accent">{a ? a.totals.visits.toLocaleString('es-VE') : '—'} total</Badge>
              </div>
              <div className="p-4">
                {analytics.initial ? (
                  <Skeleton className="h-[220px]" />
                ) : (
                  <AreaChart
                    label="Visitas diarias del sitio"
                    data={series.map((d) => ({
                      label: formatDate(d.date),
                      value: d.visits,
                    }))}
                  />
                )}
              </div>
            </section>

            {/* Embudo */}
            <section className="panel" aria-labelledby="funnel-title">
              <div className="panel-header">
                <h2 id="funnel-title" className="panel-title">
                  Embudo comercial
                </h2>
              </div>
              <div className="space-y-4 p-4">
                {a && (
                  <>
                    <Funnel
                      label="Conversión de visitas a reservas"
                      steps={[
                        { label: 'Visitas', value: a.totals.visits },
                        { label: 'Solicitudes', value: a.totals.inquiries },
                        { label: 'Reservas', value: a.allTime.booked },
                      ]}
                    />
                    <div className="divider" />
                    <dl className="grid grid-cols-2 gap-3 text-2xs">
                      <div>
                        <dt className="text-muted">Tasa de contacto</dt>
                        <dd className="tabular mt-0.5 text-base font-bold">
                          {a.totals.visits > 0 ? ((a.totals.inquiries / a.totals.visits) * 100).toFixed(1) : '0.0'}%
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted">Ticket promedio</dt>
                        <dd className="tabular mt-0.5 text-base font-bold">
                          {formatCurrency(a.allTime.booked > 0 ? a.allTime.revenue / a.allTime.booked : 0)}
                        </dd>
                      </div>
                    </dl>
                  </>
                )}
              </div>
            </section>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-3">
            {/* Solicitudes recientes */}
            <section className="panel xl:col-span-2" aria-labelledby="recent-title">
              <div className="panel-header">
                <h2 id="recent-title" className="panel-title">
                  Solicitudes recientes
                </h2>
                <Link to="/admin/solicitudes" className="focus-ring text-2xs font-semibold text-accent hover:underline">
                  Ver todas
                </Link>
              </div>

              {recent.error ? (
                <ErrorState onRetry={recent.reload} retrying={recent.loading} />
              ) : recent.initial ? (
                <LoadingBlock rows={4} />
              ) : (recent.data?.rows.length ?? 0) === 0 ? (
                <EmptyState
                  icon="mark_email_unread"
                  title="Sin solicitudes todavía"
                  description="Cuando alguien complete el formulario del sitio aparecerá aquí."
                />
              ) : (
                <ul className="divide-y divide-line/60">
                  {recent.data?.rows.map((i) => {
                    const meta = STATUS_META[i.status] ?? STATUS_META.new;
                    return (
                      <li key={i.id}>
                        <Link
                          to={`/admin/solicitudes/${i.id}`}
                          className="focus-ring flex items-center gap-3 px-4 py-2.5 transition hover:bg-elevated/60"
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-fg">{i.name}</span>
                            <span className="block truncate text-2xs text-muted">
                              {i.eventType || 'Consulta'} · {formatRelative(i.createdAt)}
                            </span>
                          </span>
                          <span className="hidden text-2xs text-muted sm:block">{formatDate(i.eventDate)}</span>
                          <Badge tone={i.status === 'booked' ? 'ok' : i.status === 'new' ? 'accent' : 'neutral'}>
                            {meta.label}
                          </Badge>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <div className="space-y-3">
              {/* Distribución */}
              <section className="panel" aria-labelledby="dist-title">
                <div className="panel-header">
                  <h2 id="dist-title" className="panel-title">
                    Estado de solicitudes
                  </h2>
                </div>
                <div className="p-4">
                  {statusSegments.length === 0 ? (
                    <p className="py-6 text-center text-2xs text-muted">Sin datos.</p>
                  ) : (
                    <Donut segments={statusSegments} label="solicitudes" centerLabel={String(a?.allTime.inquiries ?? 0)} />
                  )}
                </div>
              </section>

              {/* Agenda próxima */}
              <section className="panel" aria-labelledby="next-title">
                <div className="panel-header">
                  <h2 id="next-title" className="panel-title">
                    Próximas fechas
                  </h2>
                  <Link to="/admin/agenda" className="focus-ring text-2xs font-semibold text-accent hover:underline">
                    Agenda
                  </Link>
                </div>
                {upcoming.length === 0 ? (
                  <p className="px-4 py-6 text-center text-2xs text-muted">No hay fechas ocupadas próximamente.</p>
                ) : (
                  <ul className="divide-y divide-line/60">
                    {upcoming.map((e) => (
                      <li key={e.id} className="flex items-center gap-2.5 px-4 py-2">
                        <span
                          aria-hidden="true"
                          className={`size-1.5 rounded-full ${e.status === 'hold' ? 'bg-warn' : 'bg-ok'}`}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-medium text-fg">{e.title || 'Reservado'}</span>
                          <span className="block text-[10px] text-muted">{formatDate(e.date)}</span>
                        </span>
                        <Badge tone={e.status === 'hold' ? 'warn' : 'ok'}>
                          {e.status === 'hold' ? 'Tentativa' : 'Ocupado'}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
