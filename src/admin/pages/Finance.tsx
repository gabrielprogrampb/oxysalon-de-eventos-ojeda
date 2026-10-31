/**
 * Finanzas: balance, evolución mensual y registro de movimientos.
 * El formulario valida en el cliente y en la base (numeric >= 0).
 */
import React, { useMemo, useState } from 'react';
import { PageHeader, StatCard } from '../AdminLayout';
import { createTransaction, deleteTransaction, listTransactions } from '../../lib/store';
import { useAsyncData } from '../../lib/useAsync';
import { formatCurrency, formatDate } from '../../lib/format';
import type { Transaction } from '../../../types';
import { BarChart } from '../../ui/charts';
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
  Segmented,
  Skeleton,
  TableWrap,
  Td,
  Th,
  useToast,
} from '../../ui';

const CATEGORIES = ['General', 'Reservas', 'Eventos', 'Materiales', 'Mantenimiento', 'Personal'];

export const Finance: React.FC = () => {
  const { push } = useToast();
  const { data, error, loading, initial, reload } = useAsyncData(() => listTransactions(), []);

  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [openNew, setOpenNew] = useState(false);
  const [toDelete, setToDelete] = useState<Transaction | null>(null);

  const [form, setForm] = useState({
    title: '',
    amount: '',
    type: 'income' as Transaction['type'],
    category: 'Reservas',
    date: new Date().toISOString().slice(0, 10),
    status: 'completed' as Transaction['status'],
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const rows = data ?? [];
  const income = rows.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const expense = rows.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const balance = income - expense;
  const pending = rows.filter((t) => t.status === 'pending').length;

  const filtered = filter === 'all' ? rows : rows.filter((t) => t.type === filter);

  const monthly = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    for (const t of data ?? []) {
      const key = t.date.slice(0, 7);
      const cur = map.get(key) ?? { income: 0, expense: 0 };
      if (t.type === 'income') cur.income += t.amount;
      else cur.expense += t.amount;
      map.set(key, cur);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, v]) => ({
        label: new Date(`${key}-01T12:00:00`).toLocaleDateString('es-VE', { month: 'short' }),
        value: Math.round(v.income),
      }));
  }, [data]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (form.title.trim().length < 2) {
      setFormError('Escribe un concepto de al menos 2 caracteres.');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError('El monto debe ser mayor que cero.');
      return;
    }
    setFormError('');
    setSaving(true);
    try {
      await createTransaction({
        title: form.title.trim(),
        amount,
        type: form.type,
        category: form.category,
        date: form.date,
        status: form.status,
      });
      push({ tone: 'ok', title: 'Movimiento registrado', description: `${formatCurrency(amount)} · ${form.title.trim()}` });
      setOpenNew(false);
      setForm({ ...form, title: '', amount: '' });
      reload();
    } catch (err) {
      push({ tone: 'danger', title: 'No se pudo guardar', description: err instanceof Error ? err.message : 'Inténtalo de nuevo.' });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    try {
      await deleteTransaction(toDelete.id);
      push({ tone: 'ok', title: 'Movimiento eliminado' });
      setToDelete(null);
      reload();
    } catch (err) {
      push({ tone: 'danger', title: 'No se pudo eliminar', description: err instanceof Error ? err.message : 'Inténtalo de nuevo.' });
    }
  };

  return (
    <div>
      <PageHeader
        title="Finanzas"
        description="Ingresos y egresos del salón. El balance se calcula sobre los movimientos registrados."
        breadcrumb={['Panel', 'Finanzas']}
        actions={
          <Button variant="primary" size="sm" icon={<Glyph name="add" />} onClick={() => setOpenNew(true)}>
            Nuevo movimiento
          </Button>
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
                <StatCard
                  label="Balance neto"
                  value={formatCurrency(balance)}
                  icon="account_balance_wallet"
                  tone={balance >= 0 ? 'ok' : 'danger'}
                  hint={`${rows.length} movimientos`}
                />
                <StatCard label="Ingresos" value={formatCurrency(income)} icon="trending_up" tone="ok" />
                <StatCard label="Egresos" value={formatCurrency(expense)} icon="trending_down" tone="danger" />
                <StatCard
                  label="Por cobrar"
                  value={String(pending)}
                  icon="schedule"
                  tone="warn"
                  hint="Movimientos pendientes"
                />
              </>
            )}
          </div>

          <section className="panel" aria-labelledby="evo-title">
            <div className="panel-header">
              <div>
                <h2 id="evo-title" className="panel-title">
                  Ingresos por mes
                </h2>
                <p className="panel-sub">Últimos 6 meses con movimientos</p>
              </div>
            </div>
            <div className="p-4">
              {monthly.length === 0 ? (
                <p className="py-10 text-center text-2xs text-muted">Sin movimientos registrados.</p>
              ) : (
                <BarChart label="Ingresos mensuales" data={monthly} format={formatCurrency} tone="var(--ok)" height={160} />
              )}
            </div>
          </section>

          <section className="panel overflow-hidden" aria-labelledby="list-title">
            <div className="panel-header">
              <h2 id="list-title" className="panel-title">
                Movimientos
              </h2>
              <Segmented
                label="Filtrar por tipo"
                value={filter}
                onChange={(v) => setFilter(v as typeof filter)}
                options={[
                  { id: 'all', label: 'Todos' },
                  { id: 'income', label: 'Ingresos' },
                  { id: 'expense', label: 'Egresos' },
                ]}
              />
            </div>

            {initial ? (
              <LoadingBlock rows={5} />
            ) : filtered.length === 0 ? (
              <EmptyState
                icon="receipt_long"
                title="Sin movimientos"
                description="Registra el primer ingreso o gasto para empezar a ver el balance."
                action={
                  <Button size="sm" variant="primary" onClick={() => setOpenNew(true)}>
                    Nuevo movimiento
                  </Button>
                }
              />
            ) : (
              <TableWrap>
                <thead>
                  <tr>
                    <Th>Concepto</Th>
                    <Th>Categoría</Th>
                    <Th>Fecha</Th>
                    <Th>Estado</Th>
                    <Th className="text-right">Monto</Th>
                    <Th>
                      <span className="sr-only">Acciones</span>
                    </Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id} className="transition hover:bg-elevated/50">
                      <Td className="font-medium">{t.title}</Td>
                      <Td className="text-xs text-muted">{t.category}</Td>
                      <Td className="tabular text-xs">{formatDate(t.date)}</Td>
                      <Td>
                        <Badge tone={t.status === 'completed' ? 'ok' : 'warn'}>
                          {t.status === 'completed' ? 'Confirmado' : 'Pendiente'}
                        </Badge>
                      </Td>
                      <Td
                        className={`tabular text-right font-semibold ${t.type === 'income' ? 'text-ok' : 'text-danger'}`}
                      >
                        {t.type === 'expense' ? '−' : '+'}
                        {formatCurrency(t.amount)}
                      </Td>
                      <Td className="text-right">
                        <button
                          onClick={() => setToDelete(t)}
                          aria-label={`Eliminar ${t.title}`}
                          className="focus-ring inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-danger/10 hover:text-danger"
                        >
                          <Glyph name="delete" />
                        </button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            )}
          </section>
        </div>
      )}

      <Modal
        open={openNew}
        onClose={() => setOpenNew(false)}
        title="Nuevo movimiento"
        description="Registra un ingreso o un gasto del salón."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpenNew(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="primary" loading={saving} onClick={submit}>
              Registrar
            </Button>
          </>
        }
      >
        <form onSubmit={submit} className="space-y-3">
          <Field label="Concepto" htmlFor="t-title" required>
            <Input
              id="t-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ej. Reserva boda 15 nov"
              maxLength={160}
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Tipo" htmlFor="t-type">
              <Select
                id="t-type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as Transaction['type'] })}
              >
                <option value="income">Ingreso</option>
                <option value="expense">Gasto</option>
              </Select>
            </Field>
            <Field label="Monto (USD)" htmlFor="t-amount" required>
              <Input
                id="t-amount"
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Categoría" htmlFor="t-cat">
              <Select id="t-cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Fecha" htmlFor="t-date">
              <Input
                id="t-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </Field>
          </div>

          <Field label="Estado" htmlFor="t-status">
            <Select
              id="t-status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Transaction['status'] })}
            >
              <option value="completed">Confirmado</option>
              <option value="pending">Pendiente</option>
            </Select>
          </Field>

          {formError && (
            <p role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-2xs text-danger">
              {formError}
            </p>
          )}
        </form>
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        title="¿Eliminar este movimiento?"
        description={toDelete ? `${toDelete.title} · ${formatCurrency(toDelete.amount)}` : ''}
        confirmLabel="Eliminar"
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
};
