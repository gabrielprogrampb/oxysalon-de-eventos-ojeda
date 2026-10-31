/**
 * Agenda: disponibilidad pública y bloqueo de fechas.
 * Reutiliza el calendario del sitio para que lo que ve el cliente y lo que
 * ve la administración sean exactamente el mismo componente.
 */
import React, { useState } from 'react';
import { PageHeader } from '../AdminLayout';
import Calendar from '../../../components/Calendar';
import { deleteCalendarEvent, listCalendarEvents, upsertCalendarEvent } from '../../lib/store';
import { useAsyncData } from '../../lib/useAsync';
import { formatDate } from '../../lib/format';
import type { CalendarEvent } from '../../../types';
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Field,
  Glyph,
  Input,
  LoadingBlock,
  Modal,
  Select,
  Skeleton,
  useToast,
} from '../../ui';

export const Agenda: React.FC = () => {
  const { push } = useToast();
  const { data, error, loading, initial, reload } = useAsyncData(() => listCalendarEvents(), []);

  const [selected, setSelected] = useState<string | null>(null);
  const [mode, setMode] = useState<'menu' | 'block'>('menu');
  const [confirmFree, setConfirmFree] = useState(false);
  const [busy, setBusy] = useState(false);

  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<CalendarEvent['status']>('booked');
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('23:59');

  const events = data ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));

  const openDate = (date: string) => {
    setSelected(date);
    setMode('menu');
    const existing = events.find((e) => e.date === date);
    setTitle(existing?.title ?? '');
    setStatus(existing?.status ?? 'booked');
    setStart(existing?.timeStart ?? '09:00');
    setEnd(existing?.timeEnd ?? '23:59');
  };

  const save = async () => {
    if (!selected) return;
    if (start >= end) {
      push({ tone: 'danger', title: 'Horario inválido', description: 'La hora de fin debe ser posterior al inicio.' });
      return;
    }
    setBusy(true);
    try {
      await upsertCalendarEvent({ date: selected, status, title: title.trim() || undefined, timeStart: start, timeEnd: end });
      push({ tone: 'ok', title: 'Fecha guardada', description: `${formatDate(selected)} quedó ${status === 'hold' ? 'tentativa' : status === 'maintenance' ? 'en mantenimiento' : 'ocupada'}.` });
      setSelected(null);
      reload();
    } catch (err) {
      push({ tone: 'danger', title: 'No se pudo guardar', description: err instanceof Error ? err.message : 'Inténtalo de nuevo.' });
    } finally {
      setBusy(false);
    }
  };

  const free = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await deleteCalendarEvent(selected);
      push({ tone: 'ok', title: 'Fecha liberada', description: 'Ya aparece disponible en el sitio.' });
      setSelected(null);
      setConfirmFree(false);
      reload();
    } catch (err) {
      push({ tone: 'danger', title: 'No se pudo liberar', description: err instanceof Error ? err.message : 'Inténtalo de nuevo.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Agenda"
        description="Bloquea fechas reservadas o mantenimiento. El sitio público solo muestra fecha y estado, nunca el título."
        breadcrumb={['Panel', 'Agenda']}
        actions={
          <Button variant="secondary" size="sm" icon={<Glyph name="refresh" />} onClick={reload}>
            Actualizar
          </Button>
        }
      />

      {error ? (
        <div className="panel">
          <ErrorState onRetry={reload} retrying={loading} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
          <section className="panel xl:col-span-2" aria-labelledby="cal-title">
            <div className="panel-header">
              <h2 id="cal-title" className="panel-title">
                Calendario
              </h2>
              <p className="panel-sub">Haz clic en un día para gestionarlo</p>
            </div>
            <div className="p-4">
              {initial ? <Skeleton className="h-[320px]" /> : <Calendar events={events} onDateClick={openDate} isAdmin />}
            </div>
          </section>

          <section className="panel" aria-labelledby="next-title">
            <div className="panel-header">
              <h2 id="next-title" className="panel-title">
                Próximas fechas
              </h2>
              <Badge tone="accent">{upcoming.length}</Badge>
            </div>
            {initial ? (
              <LoadingBlock rows={4} />
            ) : upcoming.length === 0 ? (
              <EmptyState icon="event_available" title="Agenda libre" description="No hay fechas bloqueadas por delante." />
            ) : (
              <ul className="divide-y divide-line/60">
                {upcoming.map((e) => (
                  <li key={e.id}>
                    <button
                      onClick={() => openDate(e.date)}
                      className="focus-ring flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-elevated/60"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold text-fg">{e.title || 'Reservado'}</span>
                        <span className="block text-2xs text-muted">
                          {formatDate(e.date)}
                          {e.timeStart ? ` · ${e.timeStart}–${e.timeEnd}` : ''}
                        </span>
                      </span>
                      <Badge tone={e.status === 'hold' ? 'warn' : e.status === 'maintenance' ? 'neutral' : 'ok'}>
                        {e.status === 'hold' ? 'Tentativa' : e.status === 'maintenance' ? 'Mantenimiento' : 'Ocupado'}
                      </Badge>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title="Gestionar fecha"
        description={selected ? formatDate(selected) : undefined}
        footer={
          mode === 'block' ? (
            <>
              <Button variant="ghost" onClick={() => setMode('menu')} disabled={busy}>
                Atrás
              </Button>
              <Button variant="primary" loading={busy} onClick={save}>
                Guardar fecha
              </Button>
            </>
          ) : undefined
        }
      >
        {mode === 'menu' ? (
          <div className="space-y-2">
            <Button
              variant="secondary"
              block
              icon={<Glyph name="block" />}
              onClick={() => setMode('block')}
              className="justify-start"
            >
              Bloquear o marcar la fecha
            </Button>
            <Button
              variant="secondary"
              block
              icon={<Glyph name="event_available" />}
              onClick={() => setConfirmFree(true)}
              className="justify-start"
              disabled={!events.some((e) => e.date === selected)}
            >
              Liberar fecha
            </Button>
            <p className="pt-2 text-2xs leading-relaxed text-muted">
              Liberar una fecha la deja disponible de inmediato en el calendario público.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <Field label="Estado" htmlFor="cal-status">
              <Select id="cal-status" value={status} onChange={(e) => setStatus(e.target.value as CalendarEvent['status'])}>
                <option value="booked">Ocupado (evento confirmado)</option>
                <option value="hold">Tentativa (pre-reserva)</option>
                <option value="maintenance">Mantenimiento</option>
              </Select>
            </Field>
            <Field label="Título interno" htmlFor="cal-title-input" hint="No se publica en el sitio.">
              <Input
                id="cal-title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Boda privada"
                maxLength={120}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Inicio" htmlFor="cal-start">
                <Input id="cal-start" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
              </Field>
              <Field label="Fin" htmlFor="cal-end">
                <Input id="cal-end" type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
              </Field>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmFree}
        title="¿Liberar esta fecha?"
        description="El día volverá a aparecer como disponible para los clientes."
        confirmLabel="Liberar"
        onConfirm={free}
        onCancel={() => setConfirmFree(false)}
      />
    </div>
  );
};
