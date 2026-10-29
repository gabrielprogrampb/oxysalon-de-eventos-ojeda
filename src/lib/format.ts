import type { InquiryStatus } from '../../types';

export const STATUS_META: Record<InquiryStatus, { label: string; badge: string; dot: string }> = {
  new: {
    label: 'Nuevo',
    badge: 'bg-gold/15 text-gold border-gold/40',
    dot: 'bg-gold',
  },
  contacted: {
    label: 'Contactado',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    dot: 'bg-blue-400',
  },
  quoted: {
    label: 'Cotizado',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dot: 'bg-amber-400',
  },
  booked: {
    label: 'Reservado',
    badge: 'bg-green-500/10 text-green-400 border-green-500/20',
    dot: 'bg-green-400',
  },
  lost: {
    label: 'Perdido',
    badge: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    dot: 'bg-gray-500',
  },
};

export const STATUS_ORDER: InquiryStatus[] = ['new', 'contacted', 'quoted', 'booked', 'lost'];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function formatDate(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value.length <= 10 ? `${value}T12:00:00` : value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('es-VE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** "hace 5 min", "ayer", "12 oct" */
export function formatRelative(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const diffMs = Date.now() - d.getTime();
  const min = Math.round(diffMs / 60000);

  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min} min`;
  const hours = Math.round(min / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'ayer';
  if (days < 30) return `hace ${days} días`;
  return formatDate(value);
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

const AVATAR_COLORS = [
  'bg-blue-500/15 text-blue-300',
  'bg-purple-500/15 text-purple-300',
  'bg-emerald-500/15 text-emerald-300',
  'bg-amber-500/15 text-amber-300',
  'bg-rose-500/15 text-rose-300',
];

export function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) % 997;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
