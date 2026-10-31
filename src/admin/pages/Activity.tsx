/**
 * Actividad: bitácora de auditoría generada por triggers en la base.
 * Muestra quién hizo qué y cuándo. La exportación CSV trabaja sobre la
 * página consultada (nunca se descarga la tabla completa al navegador).
 */
import React, { useState } from 'react';
import { PageHeader } from '../AdminLayout';
import { listAuditLogs, type AuditQuery } from '../../lib/admin';
import { useAsyncData } from '../../lib/useAsync';
import { formatDateTime, formatRelative } from '../../lib/format';
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Glyph,
  Input,
  LoadingBlock,
  Pagination,
  Select,
  TableWrap,
  Td,
  Th,
} from '../../ui';

const ENTITIES = [
  { id: 'all', label: 'Todas las entidades' },
  { id: 'inquiries', label: 'Solicitudes' },
  { id: 'transactions', label: 'Finanzas' },
  { id: 'gallery_items', label: 'Galería' },
  { id: 'calendar_events', label: 'Agenda' },
];

function csvEscape(value: string): string {
  const clean = value.replace(/"/g, '""');
  return /[",\n;]/.test(clean) ? `"${clean}"` : clean;
}

export const Activity: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [severity, setSeverity] = useState<AuditQuery['severity']>('all');
  const [entity, setEntity] = useState('all');
  const [search, setSearch] = useState('');

  const { data, error, loading, initial, reload } = useAsyncData(
    () => listAuditLogs({ page, pageSize, severity, entity, search }),
    [page, pageSize, severity, entity, search]
  );

  const exportCsv = () => {
    const rows = data?.rows ?? [];
    if (rows.length === 0) return;
    const header = ['Fecha', 'Autor', 'Acción', 'Entidad', 'ID', 'Resumen', 'Severidad'];
    const body = rows.map((r) =>
      [formatDateTime(r.createdAt), r.actorEmail ?? '', r.action, r.entity, r.entityId ?? '', r.summary, r.severity]
        .map((v) => csvEscape(String(v)))
        .join(',')
    );
    const blob = new Blob([`\uFEFF${[header.join(','), ...body].join('\n')}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `actividad-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader
        title="Actividad"
        description="Registro inmutable de cambios. Lo escribe la base de datos, no el navegador."
        breadcrumb={['Panel', 'Actividad']}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              icon={<Glyph name="download" />}
              onClick={exportCsv}
              disabled={(data?.rows.length ?? 0) === 0}
            >
              Exportar página
            </Button>
            <Button variant="secondary" size="sm" icon={<Glyph name="refresh" />} onClick={reload}>
              Actualizar
            </Button>
          </>
        }
      />

      <div className="panel overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
          <div className="relative min-w-[12rem] flex-1">
            <label htmlFor="audit-q" className="sr-only">
              Buscar en la bitácora
            </label>
            <Glyph name="search" className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
            <Input
              id="audit-q"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por resumen o autor"
              className="pl-9"
            />
          </div>

          <Select
            aria-label="Filtrar por entidad"
            value={entity}
            onChange={(e) => {
              setEntity(e.target.value);
              setPage(1);
            }}
          >
            {ENTITIES.map((e) => (
              <option key={e.id} value={e.id}>
                {e.label}
              </option>
            ))}
          </Select>

          <Select
            aria-label="Filtrar por severidad"
            value={severity}
            onChange={(e) => {
              setSeverity(e.target.value as AuditQuery['severity']);
              setPage(1);
            }}
          >
            <option value="all">Toda severidad</option>
            <option value="info">Informativo</option>
            <option value="warning">Advertencia</option>
            <option value="critical">Crítico</option>
          </Select>
        </div>

        {error ? (
          <ErrorState onRetry={reload} retrying={loading} />
        ) : initial ? (
          <LoadingBlock rows={6} />
        ) : (data?.rows.length ?? 0) === 0 ? (
          <EmptyState
            icon="history"
            title="Sin actividad registrada"
            description="Los cambios en solicitudes, finanzas, galería y agenda aparecerán aquí automáticamente."
          />
        ) : (
          <>
            <TableWrap>
              <thead>
                <tr>
                  <Th>Cuándo</Th>
                  <Th>Autor</Th>
                  <Th>Acción</Th>
                  <Th>Detalle</Th>
                  <Th>Severidad</Th>
                </tr>
              </thead>
              <tbody>
                {data?.rows.map((r) => (
                  <tr key={r.id} className="transition hover:bg-elevated/50">
                    <Td className="whitespace-nowrap">
                      <span className="block text-xs text-fg">{formatRelative(r.createdAt)}</span>
                      <span className="block text-[10px] text-muted">{formatDateTime(r.createdAt)}</span>
                    </Td>
                    <Td className="max-w-[12rem] truncate text-2xs text-muted">{r.actorEmail || 'sistema'}</Td>
                    <Td>
                      <code className="rounded bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-fg">{r.action}</code>
                    </Td>
                    <Td className="text-xs">
                      <span className="block text-fg">{r.summary}</span>
                      {r.entityId && <span className="block text-[10px] text-muted">#{r.entityId}</span>}
                    </Td>
                    <Td>
                      <Badge tone={r.severity === 'critical' ? 'danger' : r.severity === 'warning' ? 'warn' : 'neutral'}>
                        {r.severity === 'critical' ? 'Crítico' : r.severity === 'warning' ? 'Advertencia' : 'Info'}
                      </Badge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>

            <Pagination
              page={data?.page ?? 1}
              pageSize={pageSize}
              total={data?.total ?? 0}
              onPage={setPage}
              onPageSize={(s) => {
                setPageSize(s);
                setPage(1);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};
