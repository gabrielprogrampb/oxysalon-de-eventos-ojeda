/**
 * Solicitudes: bandeja de trabajo con búsqueda, filtros y paginación real
 * (el servidor pagina; el navegador nunca descarga la tabla completa).
 */
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../AdminLayout';
import { listEntityAudit, listInquiriesPaged, type InquiryQuery } from '../../lib/admin';
import { getInquiry, updateInquiry } from '../../lib/store';
import { useAsyncData, useDebounced } from '../../lib/useAsync';
import { STATUS_META, STATUS_ORDER, formatCurrency, formatDate, formatDateTime, formatRelative } from '../../lib/format';
import type { InquiryStatus } from '../../../types';
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Field,
  Glyph,
  Input,
  LoadingBlock,
  Pagination,
  Select,
  Skeleton,
  TableWrap,
  Td,
  Textarea,
  Th,
  useToast,
} from '../../ui';

// -----------------------------------------------------------------------------
// Lista
// -----------------------------------------------------------------------------
export const Inquiries: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(params.get('q') ?? '');
  const search = useDebounced(searchInput, 320);

  const page = Math.max(1, Number(params.get('page') ?? 1));
  const status = (params.get('estado') ?? 'all') as InquiryStatus | 'all';
  const sort = (params.get('orden') ?? 'recent') as NonNullable<InquiryQuery['sort']>;
  const [pageSize, setPageSize] = useState(25);

  // La URL es la fuente de verdad: filtros compartibles y botón "atrás" funcional
  useEffect(() => {
    const next = new URLSearchParams(params);
    if (search) next.set('q', search);
    else next.delete('q');
    next.set('page', '1');
    if (next.toString() !== params.toString()) setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const query: InquiryQuery = { page, pageSize, search: params.get('q') ?? '', status, sort };
  const { data, error, loading, initial, reload } = useAsyncData(
    () => listInquiriesPaged(query),
    [page, pageSize, query.search, status, sort]
  );

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value === 'all' || value === '') next.delete(key);
    else next.set(key, value);
    next.set('page', '1');
    setParams(next);
  };

  return (
    <div>
      <PageHeader
        title="Solicitudes"
        description="Cada formulario enviado desde el sitio. El estado se actualiza aquí y queda auditado."
        breadcrumb={['Panel', 'Solicitudes']}
        actions={
          <Button variant="secondary" size="sm" icon={<Glyph name="refresh" />} onClick={reload}>
            Actualizar
          </Button>
        }
      />

      <div className="panel overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
          <div className="relative min-w-[12rem] flex-1">
            <label htmlFor="q" className="sr-only">
              Buscar solicitud
            </label>
            <Glyph name="search" className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
            <Input
              id="q"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Nombre, correo o teléfono"
              className="pl-9"
            />
          </div>

          <div>
            <label htmlFor="estado" className="sr-only">
              Estado
            </label>
            <Select id="estado" value={status} onChange={(e) => setFilter('estado', e.target.value)}>
              <option value="all">Todos los estados</option>
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label htmlFor="orden" className="sr-only">
              Orden
            </label>
            <Select id="orden" value={sort} onChange={(e) => setFilter('orden', e.target.value)}>
              <option value="recent">Más recientes</option>
              <option value="oldest">Más antiguas</option>
              <option value="value">Mayor valor</option>
              <option value="event">Fecha del evento</option>
            </Select>
          </div>

          {(params.get('q') || status !== 'all' || sort !== 'recent') && (
            <Button variant="ghost" size="sm" onClick={() => setParams(new URLSearchParams())}>
              Limpiar
            </Button>
          )}
        </div>

        {error ? (
          <ErrorState onRetry={reload} retrying={loading} />
        ) : initial ? (
          <LoadingBlock rows={6} />
        ) : (data?.rows.length ?? 0) === 0 ? (
          <EmptyState
            icon="search_off"
            title="Ninguna solicitud coincide"
            description="Prueba con otro término o limpia los filtros para ver todas."
            action={
              <Button size="sm" variant="secondary" onClick={() => setParams(new URLSearchParams())}>
                Limpiar filtros
              </Button>
            }
          />
        ) : (
          <>
            <TableWrap>
              <thead>
                <tr>
                  <Th>Cliente</Th>
                  <Th>Evento</Th>
                  <Th>Sede</Th>
                  <Th>Fecha evento</Th>
                  <Th className="text-right">Valor</Th>
                  <Th>Estado</Th>
                  <Th>Recibida</Th>
                  <Th>
                    <span className="sr-only">Acciones</span>
                  </Th>
                </tr>
              </thead>
              <tbody>
                {data?.rows.map((i) => (
                  <tr key={i.id} className="group transition hover:bg-elevated/50">
                    <Td>
                      <Link
                        to={`/admin/solicitudes/${i.id}`}
                        className="focus-ring block rounded font-semibold text-fg hover:text-accent"
                      >
                        {i.name}
                      </Link>
                      <span className="block text-2xs text-muted">{i.email}</span>
                    </Td>
                    <Td className="text-xs text-muted">{i.eventType || '—'}</Td>
                    <Td className="text-xs">
                      {i.venue ? <Badge tone="accent">{i.venue}</Badge> : <span className="text-muted">—</span>}
                    </Td>
                    <Td className="tabular text-xs">{formatDate(i.eventDate)}</Td>
                    <Td className="tabular text-right text-xs font-semibold">
                      {i.value ? formatCurrency(i.value) : '—'}
                    </Td>
                    <Td>
                      <Badge
                        tone={i.status === 'booked' ? 'ok' : i.status === 'new' ? 'accent' : i.status === 'lost' ? 'neutral' : 'warn'}
                        dot
                      >
                        {STATUS_META[i.status].label}
                      </Badge>
                    </Td>
                    <Td className="text-2xs text-muted">{formatRelative(i.createdAt)}</Td>
                    <Td className="text-right">
                      <Link
                        to={`/admin/solicitudes/${i.id}`}
                        aria-label={`Abrir solicitud de ${i.name}`}
                        className="focus-ring inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-elevated hover:text-fg"
                      >
                        <Glyph name="chevron_right" />
                      </Link>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>

            <Pagination
              page={data?.page ?? 1}
              pageSize={pageSize}
              total={data?.total ?? 0}
              onPage={(p) => {
                const next = new URLSearchParams(params);
                next.set('page', String(p));
                setParams(next);
              }}
              onPageSize={(s) => {
                setPageSize(s);
                const next = new URLSearchParams(params);
                next.set('page', '1');
                setParams(next);
              }}
            />
          </>
        )}
      </div>

      {loading && !initial && (
        <p className="mt-2 flex items-center gap-1.5 text-2xs text-muted" role="status">
          <span className="size-2 animate-pulse rounded-full bg-accent" /> Actualizando…
        </p>
      )}
    </div>
  );
};

// -----------------------------------------------------------------------------
// Detalle
// -----------------------------------------------------------------------------
export const InquiryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { push } = useToast();
  const numericId = Number(id);

  const detail = useAsyncData(() => getInquiry(numericId), [numericId]);
  const history = useAsyncData(() => listEntityAudit('inquiries', String(numericId)), [numericId]);

  const [status, setStatus] = useState<InquiryStatus>('new');
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!detail.data) return;
    setStatus(detail.data.status);
    setValue(detail.data.value ? String(detail.data.value) : '');
    setNotes(detail.data.notes ?? '');
  }, [detail.data]);

  if (detail.error) {
    return (
      <div className="panel">
        <ErrorState title="No se pudo abrir la solicitud" onRetry={detail.reload} retrying={detail.loading} />
      </div>
    );
  }

  if (detail.initial) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!detail.data) {
    return (
      <div className="panel">
        <EmptyState
          icon="search_off"
          title="Solicitud no encontrada"
          description="Puede que se haya eliminado o que el enlace esté mal."
          action={
            <Button size="sm" onClick={() => navigate('/admin/solicitudes')}>
              Volver al listado
            </Button>
          }
        />
      </div>
    );
  }

  const i = detail.data;

  const save = async () => {
    const amount = value.trim() === '' ? null : Number(value);
    if (amount !== null && (!Number.isFinite(amount) || amount < 0)) {
      push({ tone: 'danger', title: 'Valor inválido', description: 'Escribe un monto mayor o igual a cero.' });
      return;
    }
    setSaving(true);
    try {
      await updateInquiry(i.id, { status, value: amount, notes: notes.trim() || null });
      push({ tone: 'ok', title: 'Solicitud actualizada', description: 'El cambio quedó registrado en actividad.' });
      detail.reload();
      history.reload();
    } catch (err) {
      push({
        tone: 'danger',
        title: 'No se pudo guardar',
        description: err instanceof Error ? err.message : 'Inténtalo de nuevo.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={i.name}
        description={`Recibida ${formatDateTime(i.createdAt)} · Origen: ${i.source}`}
        breadcrumb={['Panel', 'Solicitudes', `#${i.id}`]}
        actions={
          <>
            <Button variant="ghost" size="sm" icon={<Glyph name="arrow_back" />} onClick={() => navigate('/admin/solicitudes')}>
              Volver
            </Button>
            <Button variant="primary" size="sm" loading={saving} onClick={save} icon={<Glyph name="save" />}>
              Guardar cambios
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <section className="panel lg:col-span-2" aria-labelledby="data-title">
          <div className="panel-header">
            <h2 id="data-title" className="panel-title">
              Datos del contacto
            </h2>
            <Badge tone={i.status === 'booked' ? 'ok' : i.status === 'new' ? 'accent' : 'neutral'} dot>
              {STATUS_META[i.status].label}
            </Badge>
          </div>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 p-4 sm:grid-cols-2">
            {[
              ['Correo', i.email],
              ['Teléfono', i.phone],
              ['Instagram', i.instagram || '—'],
              ['Telegram', i.telegram || '—'],
              ['Tipo de evento', i.eventType || '—'],
              ['Sede', i.venue || '—'],
              ['Fecha del evento', formatDate(i.eventDate)],
              ['Invitados', i.guestsRange || '—'],
              ['Espacio de interés', i.spaceInterest || '—'],
            ].map(([label, val]) => (
              <div key={label}>
                <dt className="text-2xs uppercase tracking-wide text-muted">{label}</dt>
                <dd className="mt-0.5 break-words text-sm text-fg">{val}</dd>
              </div>
            ))}
            <div className="sm:col-span-2">
              <dt className="text-2xs uppercase tracking-wide text-muted">Mensaje</dt>
              <dd className="mt-0.5 whitespace-pre-wrap rounded-lg border border-line bg-bg p-3 text-sm leading-relaxed">
                {i.message || 'Sin mensaje.'}
              </dd>
            </div>
          </dl>
        </section>

        <section className="panel" aria-labelledby="manage-title">
          <div className="panel-header">
            <h2 id="manage-title" className="panel-title">
              Gestión
            </h2>
          </div>
          <div className="space-y-3 p-4">
            <Field label="Estado" htmlFor="status">
              <Select id="status" value={status} onChange={(e) => setStatus(e.target.value as InquiryStatus)}>
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_META[s].label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Valor cotizado (USD)" htmlFor="value" hint="Déjalo vacío si aún no hay cotización.">
              <Input
                id="value"
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0.00"
              />
            </Field>

            <Field label="Notas internas" htmlFor="notes" hint="Solo las ve el equipo.">
              <Textarea id="notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} />
            </Field>

            <Button variant="primary" block loading={saving} onClick={save}>
              Guardar cambios
            </Button>
            <p className="text-[10px] leading-relaxed text-muted">
              Cada cambio de estado o valor queda en la bitácora con tu usuario y la fecha.
            </p>
          </div>
        </section>

        <section className="panel lg:col-span-3" aria-labelledby="history-title">
          <div className="panel-header">
            <h2 id="history-title" className="panel-title">
              Historial de esta solicitud
            </h2>
            <Badge tone="neutral">{history.data?.length ?? 0}</Badge>
          </div>
          {history.initial ? (
            <LoadingBlock rows={3} />
          ) : (history.data?.length ?? 0) === 0 ? (
            <p className="px-4 py-8 text-center text-2xs text-muted">
              Sin cambios registrados todavía. Los movimientos aparecerán aquí.
            </p>
          ) : (
            <ol className="divide-y divide-line/60">
              {history.data?.map((h) => (
                <li key={h.id} className="flex flex-wrap items-center gap-2 px-4 py-2.5 text-xs">
                  <Badge tone={h.severity === 'critical' ? 'danger' : h.severity === 'warning' ? 'warn' : 'neutral'}>
                    {h.action.split('.').pop()}
                  </Badge>
                  <span className="flex-1 text-fg">{h.summary}</span>
                  <span className="text-2xs text-muted">{h.actorEmail || 'sistema'}</span>
                  <span className="text-2xs text-muted">{formatDateTime(h.createdAt)}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
};
