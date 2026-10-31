/**
 * =============================================================================
 * CAPA DE DATOS DE LA CONSOLA
 * =============================================================================
 * Extiende `store.ts` con lo que el panel necesita y el sitio público no:
 * paginación en servidor, bitácora de auditoría, métricas agregadas y salud.
 *
 * Regla: ningún componente llama a Supabase directamente. Todo pasa por aquí,
 * y en modo demostración se devuelve data local con la misma forma.
 * =============================================================================
 */
import { supabase } from './supabase';
import { isDemo } from './store';
import { INQUIRIES, MOCK_TRANSACTIONS, GALLERY_ITEMS } from '../../constants';
import type { Inquiry, InquiryStatus } from '../../types';

// -----------------------------------------------------------------------------
// Tipos
// -----------------------------------------------------------------------------
export interface Paged<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AuditEntry {
  id: number;
  createdAt: string;
  actorEmail: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  summary: string;
  severity: 'info' | 'warning' | 'critical';
  changes: Record<string, { antes: unknown; despues: unknown }> | null;
}

export interface AnalyticsSummary {
  days: number;
  series: { date: string; visits: number; inquiries: number; booked: number; revenue: number }[];
  totals: { visits: number; inquiries: number; booked: number; revenue: number };
  allTime: { inquiries: number; booked: number; revenue: number; views: number };
  statusCounts: Partial<Record<InquiryStatus, number>>;
  topPaths: { path: string; views: number }[];
  pending: { newInquiries: number; upcoming: number };
}

export interface SystemHealth {
  databaseBytes: number;
  storageBytes: number;
  storageFiles: number;
  counts: Record<string, number>;
  oldestInquiry: string | null;
  lastAuditAt: string | null;
  purgeScheduled: boolean;
}

export interface TeamMember {
  userId: string;
  email: string;
  fullName: string | null;
  role: 'owner' | 'admin' | 'viewer';
  createdAt: string;
  lastSeenAt: string | null;
}

type Row = Record<string, unknown>;

// -----------------------------------------------------------------------------
// Utilidades
// -----------------------------------------------------------------------------
/** Neutraliza caracteres que rompen la sintaxis de filtros de PostgREST. */
function safeSearch(term: string): string {
  return term.replace(/[,()*%\\]/g, ' ').trim().slice(0, 80);
}

function toError(context: string, error: unknown): Error {
  const msg =
    typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message: unknown }).message)
      : 'Error desconocido';
  console.error(`[admin] ${context}:`, error);
  return new Error(`${context}: ${msg}`);
}

// -----------------------------------------------------------------------------
// Solicitudes paginadas
// -----------------------------------------------------------------------------
export interface InquiryQuery {
  page: number;
  pageSize: number;
  search?: string;
  status?: InquiryStatus | 'all';
  sort?: 'recent' | 'oldest' | 'value' | 'event';
}

export async function listInquiriesPaged(q: InquiryQuery): Promise<Paged<Inquiry>> {
  const page = Math.max(1, q.page);
  const pageSize = Math.min(100, Math.max(5, q.pageSize));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  if (!supabase || isDemo) {
    const term = (q.search ?? '').toLowerCase();
    let rows = INQUIRIES.filter((i) => {
      const matchTerm =
        !term ||
        i.name.toLowerCase().includes(term) ||
        i.email.toLowerCase().includes(term) ||
        i.phone.includes(term);
      const matchStatus = !q.status || q.status === 'all' || i.status === q.status;
      return matchTerm && matchStatus;
    });
    rows = [...rows].sort((a, b) => {
      if (q.sort === 'oldest') return a.createdAt.localeCompare(b.createdAt);
      if (q.sort === 'value') return (b.value ?? 0) - (a.value ?? 0);
      if (q.sort === 'event') return (a.eventDate ?? '9999').localeCompare(b.eventDate ?? '9999');
      return b.createdAt.localeCompare(a.createdAt);
    });
    return { rows: rows.slice(from, to + 1), total: rows.length, page, pageSize };
  }

  let query = supabase.from('inquiries').select('*', { count: 'exact' });

  if (q.status && q.status !== 'all') query = query.eq('status', q.status);

  const term = safeSearch(q.search ?? '');
  if (term) query = query.or(`name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`);

  if (q.sort === 'oldest') query = query.order('created_at', { ascending: true });
  else if (q.sort === 'value') query = query.order('value', { ascending: false, nullsFirst: false });
  else if (q.sort === 'event') query = query.order('event_date', { ascending: true, nullsFirst: false });
  else query = query.order('created_at', { ascending: false });

  const { data, error, count } = await query.range(from, to);
  if (error) throw toError('no se pudieron cargar las solicitudes', error);

  return {
    rows: (data ?? []).map((r) => mapInquiryRow(r as Row)),
    total: count ?? 0,
    page,
    pageSize,
  };
}

function mapInquiryRow(r: Row): Inquiry {
  return {
    id: Number(r.id),
    createdAt: String(r.created_at ?? new Date().toISOString()),
    name: String(r.name ?? ''),
    email: String(r.email ?? ''),
    phone: String(r.phone ?? ''),
    instagram: (r.instagram as string) ?? null,
    telegram: (r.telegram as string) ?? null,
    eventType: (r.event_type as string) ?? null,
    eventDate: (r.event_date as string) ?? null,
    guestsRange: (r.guests_range as string) ?? null,
    spaceInterest: (r.space_interest as string) ?? null,
    message: (r.message as string) ?? null,
    status: ((r.status as InquiryStatus) ?? 'new') as InquiryStatus,
    value: r.value === null || r.value === undefined ? null : Number(r.value),
    notes: (r.notes as string) ?? null,
    source: (r.source as string) ?? 'web',
  };
}

// -----------------------------------------------------------------------------
// Auditoría
// -----------------------------------------------------------------------------
export interface AuditQuery {
  page: number;
  pageSize: number;
  severity?: 'all' | 'info' | 'warning' | 'critical';
  entity?: string;
  search?: string;
}

export async function listAuditLogs(q: AuditQuery): Promise<Paged<AuditEntry>> {
  const page = Math.max(1, q.page);
  const pageSize = Math.min(100, Math.max(5, q.pageSize));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  if (!supabase || isDemo) {
    return { rows: [], total: 0, page, pageSize };
  }

  let query = supabase.from('audit_logs').select('*', { count: 'exact' });

  if (q.severity && q.severity !== 'all') query = query.eq('severity', q.severity);
  if (q.entity && q.entity !== 'all') query = query.eq('entity', q.entity);

  const term = safeSearch(q.search ?? '');
  if (term) query = query.or(`summary.ilike.%${term}%,actor_email.ilike.%${term}%`);

  const { data, error, count } = await query.order('created_at', { ascending: false }).range(from, to);
  if (error) throw toError('no se pudo cargar la bitácora', error);

  return {
    rows: (data ?? []).map((r) => {
      const row = r as Row;
      return {
        id: Number(row.id),
        createdAt: String(row.created_at),
        actorEmail: (row.actor_email as string) ?? null,
        action: String(row.action ?? ''),
        entity: String(row.entity ?? ''),
        entityId: row.entity_id === null || row.entity_id === undefined ? null : String(row.entity_id),
        summary: String(row.summary ?? ''),
        severity: ((row.severity as AuditEntry['severity']) ?? 'info') as AuditEntry['severity'],
        changes: (row.changes as AuditEntry['changes']) ?? null,
      };
    }),
    total: count ?? 0,
    page,
    pageSize,
  };
}

/** Historial de un registro concreto (para el detalle de una solicitud). */
export async function listEntityAudit(entity: string, entityId: string, limit = 12): Promise<AuditEntry[]> {
  if (!supabase || isDemo) return [];
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('entity', entity)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return []; // el historial es informativo: no rompe el detalle
  return (data ?? []).map((r) => {
    const row = r as Row;
    return {
      id: Number(row.id),
      createdAt: String(row.created_at),
      actorEmail: (row.actor_email as string) ?? null,
      action: String(row.action ?? ''),
      entity: String(row.entity ?? ''),
      entityId: row.entity_id ? String(row.entity_id) : null,
      summary: String(row.summary ?? ''),
      severity: ((row.severity as AuditEntry['severity']) ?? 'info') as AuditEntry['severity'],
      changes: (row.changes as AuditEntry['changes']) ?? null,
    };
  });
}

// -----------------------------------------------------------------------------
// Analítica
// -----------------------------------------------------------------------------
/** Serie determinista para el modo demostración (misma data en cada recarga). */
function demoAnalytics(days: number): AnalyticsSummary {
  const series: AnalyticsSummary['series'] = [];
  let seed = 20260101;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };

  const start = new Date();
  start.setDate(start.getDate() - (days - 1));

  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const weekend = [0, 6].includes(d.getDay());
    series.push({
      date: d.toISOString().slice(0, 10),
      visits: Math.round(18 + rnd() * 40 + (weekend ? 14 : 0)),
      inquiries: Math.round(rnd() * 3),
      booked: rnd() > 0.86 ? 1 : 0,
      revenue: rnd() > 0.8 ? Math.round(180 + rnd() * 520) : 0,
    });
  }

  const statusCounts: Partial<Record<InquiryStatus, number>> = {};
  for (const i of INQUIRIES) statusCounts[i.status] = (statusCounts[i.status] ?? 0) + 1;

  return {
    days,
    series,
    totals: {
      visits: series.reduce((a, s) => a + s.visits, 0),
      inquiries: series.reduce((a, s) => a + s.inquiries, 0),
      booked: series.reduce((a, s) => a + s.booked, 0),
      revenue: series.reduce((a, s) => a + s.revenue, 0),
    },
    allTime: {
      inquiries: INQUIRIES.length,
      booked: INQUIRIES.filter((i) => i.status === 'booked').length,
      revenue: INQUIRIES.filter((i) => i.status === 'booked').reduce((a, i) => a + (i.value ?? 0), 0),
      views: series.reduce((a, s) => a + s.visits, 0),
    },
    statusCounts,
    topPaths: [
      { path: '/', views: Math.round(series.reduce((a, s) => a + s.visits, 0) * 0.46) },
      { path: '/gallery', views: Math.round(series.reduce((a, s) => a + s.visits, 0) * 0.19) },
      { path: '/services', views: Math.round(series.reduce((a, s) => a + s.visits, 0) * 0.14) },
      { path: '/booking', views: Math.round(series.reduce((a, s) => a + s.visits, 0) * 0.11) },
      { path: '/spaces', views: Math.round(series.reduce((a, s) => a + s.visits, 0) * 0.07) },
    ],
    pending: {
      newInquiries: INQUIRIES.filter((i) => i.status === 'new').length,
      upcoming: 3,
    },
  };
}

export async function getAnalytics(days: number): Promise<AnalyticsSummary> {
  if (!supabase || isDemo) return demoAnalytics(Math.max(7, Math.min(days, 90)));

  const { data, error } = await supabase.rpc('analytics_summary', { p_days: days });
  if (error) throw toError('no se pudieron calcular las métricas', error);

  // El RPC devuelve jsonb; se normaliza para que la UI no dependa del casing SQL
  const raw = (data ?? {}) as Partial<AnalyticsSummary>;
  return {
    days: raw.days ?? days,
    series: raw.series ?? [],
    totals: raw.totals ?? { visits: 0, inquiries: 0, booked: 0, revenue: 0 },
    allTime: raw.allTime ?? { inquiries: 0, booked: 0, revenue: 0, views: 0 },
    statusCounts: raw.statusCounts ?? {},
    topPaths: raw.topPaths ?? [],
    pending: raw.pending ?? { newInquiries: 0, upcoming: 0 },
  };
}

// -----------------------------------------------------------------------------
// Salud del sistema
// -----------------------------------------------------------------------------
export async function getSystemHealth(): Promise<SystemHealth> {
  if (!supabase || isDemo) {
    return {
      databaseBytes: 0,
      storageBytes: 0,
      storageFiles: 0,
      counts: {
        inquiries: INQUIRIES.length,
        transactions: MOCK_TRANSACTIONS.length,
        gallery: GALLERY_ITEMS.length,
        calendar: 3,
        pageViews: 0,
        auditLogs: 0,
        admins: 1,
      },
      oldestInquiry: null,
      lastAuditAt: null,
      purgeScheduled: false,
    };
  }

  const { data, error } = await supabase.rpc('admin_health');
  if (error) throw toError('no se pudo leer la salud del sistema', error);
  const raw = (data ?? {}) as Partial<SystemHealth>;

  return {
    databaseBytes: Number(raw.databaseBytes ?? 0),
    storageBytes: Number(raw.storageBytes ?? 0),
    storageFiles: Number(raw.storageFiles ?? 0),
    counts: raw.counts ?? {},
    oldestInquiry: raw.oldestInquiry ?? null,
    lastAuditAt: raw.lastAuditAt ?? null,
    purgeScheduled: Boolean(raw.purgeScheduled),
  };
}

// -----------------------------------------------------------------------------
// Equipo
// -----------------------------------------------------------------------------
export async function listTeam(): Promise<TeamMember[]> {
  if (!supabase || isDemo) {
    return [
      {
        userId: 'demo',
        email: 'demo@local',
        fullName: 'Cuenta de demostración',
        role: 'owner',
        createdAt: new Date().toISOString(),
        lastSeenAt: new Date().toISOString(),
      },
    ];
  }

  const { data, error } = await supabase
    .from('admins')
    .select('user_id,email,full_name,role,created_at,last_seen_at')
    .order('created_at', { ascending: true });

  if (error) throw toError('no se pudo cargar el equipo', error);

  return (data ?? []).map((r) => {
    const row = r as Row;
    return {
      userId: String(row.user_id),
      email: String(row.email ?? ''),
      fullName: (row.full_name as string) ?? null,
      role: ((row.role as TeamMember['role']) ?? 'admin') as TeamMember['role'],
      createdAt: String(row.created_at ?? ''),
      lastSeenAt: (row.last_seen_at as string) ?? null,
    };
  });
}

/** Marca la última actividad del administrador (para "visto por última vez"). */
export async function touchAdminPresence(): Promise<void> {
  if (!supabase || isDemo) return;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await supabase.from('admins').update({ last_seen_at: new Date().toISOString() }).eq('user_id', data.user.id);
}
