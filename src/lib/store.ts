/**
 * =============================================================================
 * CAPA DE DATOS
 * =============================================================================
 * Toda la aplicación habla con este módulo. Nunca se llama a Supabase ni a
 * localStorage desde un componente: así el sitio funciona igual en modo
 * producción (Supabase) y en modo demo (sin credenciales).
 * =============================================================================
 */
import { supabase, isSupabaseConfigured } from './supabase';
import { optimizeImage } from './image';
import { GALLERY_ITEMS, INQUIRIES, MOCK_TRANSACTIONS } from '../../constants';
import type {
  CalendarEvent,
  GalleryItem,
  Inquiry,
  InquiryInput,
  InquiryStatus,
  Transaction,
} from '../../types';

export type DataMode = 'supabase' | 'demo';
export const dataMode: DataMode = isSupabaseConfigured ? 'supabase' : 'demo';
export const isDemo = dataMode === 'demo';

export class ApiError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

// -----------------------------------------------------------------------------
// Utilidades
// -----------------------------------------------------------------------------
const LS = {
  inquiries: 'oxy_demo_inquiries',
  gallery: 'oxy_demo_gallery',
  transactions: 'oxy_demo_transactions',
  calendar: 'oxy_demo_calendar',
  views: 'oxy_demo_views',
} as const;

function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLS<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* cuota llena: se ignora en modo demo */
  }
}

const nextId = (items: { id: number }[]): number =>
  items.reduce((max, i) => Math.max(max, i.id), 0) + 1;

function fail(context: string, error: unknown): never {
  const msg =
    typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message: unknown }).message)
      : 'Error desconocido';
  console.error(`[api] ${context}:`, error);
  throw new ApiError(`No se pudo completar la operación (${context}). ${msg}`, error);
}

// -----------------------------------------------------------------------------
// Mapeadores DB (snake_case) → dominio (camelCase)
// -----------------------------------------------------------------------------
type Row = Record<string, unknown>;

const mapInquiry = (r: Row): Inquiry => ({
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
  status: (r.status as InquiryStatus) ?? 'new',
  value: r.value === null || r.value === undefined ? null : Number(r.value),
  notes: (r.notes as string) ?? null,
  source: (r.source as string) ?? 'web',
});

const mapGallery = (r: Row): GalleryItem => ({
  id: Number(r.id),
  createdAt: (r.created_at as string) ?? undefined,
  image: String(r.image_url ?? ''),
  title: (r.title as string) ?? undefined,
  category: (r.category as string) ?? undefined,
  type: (r.type as GalleryItem['type']) ?? 'wide',
  likes: Number(r.likes ?? 0),
  featured: Boolean(r.featured),
  published: r.published === undefined ? true : Boolean(r.published),
});

const mapTransaction = (r: Row): Transaction => ({
  id: Number(r.id),
  createdAt: (r.created_at as string) ?? undefined,
  title: String(r.title ?? ''),
  amount: Number(r.amount ?? 0),
  type: (r.type as Transaction['type']) ?? 'income',
  category: String(r.category ?? 'General'),
  date: String(r.date ?? '').slice(0, 10),
  status: (r.status as Transaction['status']) ?? 'completed',
  inquiryId: r.inquiry_id === null || r.inquiry_id === undefined ? null : Number(r.inquiry_id),
});

const mapCalendar = (r: Row): CalendarEvent => ({
  id: String(r.id),
  date: String(r.date ?? '').slice(0, 10),
  status: (r.status as CalendarEvent['status']) ?? 'booked',
  title: (r.title as string) ?? undefined,
  timeStart: r.time_start ? String(r.time_start).slice(0, 5) : undefined,
  timeEnd: r.time_end ? String(r.time_end).slice(0, 5) : undefined,
});

// -----------------------------------------------------------------------------
// SOLICITUDES / COTIZACIONES
// -----------------------------------------------------------------------------
export async function createInquiry(input: InquiryInput): Promise<void> {
  if (!supabase) {
    const items = readLS<Inquiry[]>(LS.inquiries, INQUIRIES);
    const created: Inquiry = {
      id: nextId(items),
      createdAt: new Date().toISOString(),
      ...input,
      status: 'new',
      source: 'web',
    };
    writeLS(LS.inquiries, [created, ...items]);
    return;
  }

  // Se usa una función RPC en el servidor: valida, fija los campos internos
  // (status, source, value, notes) y aplica límite anti-spam.
  const { error } = await supabase.rpc('submit_inquiry', {
    p_name: input.name,
    p_email: input.email,
    p_phone: input.phone,
    p_instagram: input.instagram?.trim() || null,
    p_telegram: input.telegram?.trim() || null,
    p_event_type: input.eventType?.trim() || null,
    p_event_date: input.eventDate || null,
    p_guests_range: input.guestsRange?.trim() || null,
    p_space_interest: input.spaceInterest?.trim() || null,
    p_message: input.message?.trim() || null,
  });

  if (error) {
    const msg = `${error.message} ${error.details ?? ''}`.toLowerCase();
    if (msg.includes('rate_limited')) {
      throw new ApiError('Ya recibimos varias solicitudes con este correo. Escríbenos por WhatsApp.');
    }
    if (msg.includes('invalid_email')) {
      throw new ApiError('El correo no es válido. Revísalo e inténtalo de nuevo.');
    }
    if (msg.includes('invalid_phone')) {
      throw new ApiError('El teléfono no es válido. Incluye el código de área.');
    }
    if (msg.includes('invalid_name')) {
      throw new ApiError('Escribe tu nombre completo.');
    }
    fail('enviar solicitud', error);
  }
}

export async function listInquiries(): Promise<Inquiry[]> {
  if (!supabase) return readLS<Inquiry[]>(LS.inquiries, INQUIRIES);
  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) fail('listar solicitudes', error);
  return (data ?? []).map(mapInquiry);
}

export async function getInquiry(id: number): Promise<Inquiry | null> {
  if (!supabase) {
    const items = readLS<Inquiry[]>(LS.inquiries, INQUIRIES);
    return items.find((i) => i.id === id) ?? null;
  }
  const { data, error } = await supabase.from('inquiries').select('*').eq('id', id).maybeSingle();
  if (error) fail('obtener solicitud', error);
  return data ? mapInquiry(data as Row) : null;
}

export async function updateInquiry(id: number, patch: Partial<Inquiry>): Promise<void> {
  if (!supabase) {
    const items = readLS<Inquiry[]>(LS.inquiries, INQUIRIES);
    writeLS(
      LS.inquiries,
      items.map((i) => (i.id === id ? { ...i, ...patch } : i))
    );
    return;
  }

  const dbPatch: Row = {};
  if (patch.status !== undefined) dbPatch.status = patch.status;
  if (patch.value !== undefined) dbPatch.value = patch.value;
  if (patch.notes !== undefined) dbPatch.notes = patch.notes;
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.email !== undefined) dbPatch.email = patch.email;
  if (patch.phone !== undefined) dbPatch.phone = patch.phone;
  if (patch.eventDate !== undefined) dbPatch.event_date = patch.eventDate;
  if (patch.spaceInterest !== undefined) dbPatch.space_interest = patch.spaceInterest;

  const { error } = await supabase.from('inquiries').update(dbPatch).eq('id', id);
  if (error) fail('actualizar solicitud', error);
}

export async function deleteInquiry(id: number): Promise<void> {
  if (!supabase) {
    const items = readLS<Inquiry[]>(LS.inquiries, INQUIRIES);
    writeLS(
      LS.inquiries,
      items.filter((i) => i.id !== id)
    );
    return;
  }
  const { error } = await supabase.from('inquiries').delete().eq('id', id);
  if (error) fail('eliminar solicitud', error);
}

// -----------------------------------------------------------------------------
// GALERÍA
// -----------------------------------------------------------------------------
export async function listGallery(publicOnly = false): Promise<GalleryItem[]> {
  if (!supabase) return readLS<GalleryItem[]>(LS.gallery, GALLERY_ITEMS);

  let query = supabase.from('gallery_items').select('*').order('sort_order', { ascending: true });
  if (publicOnly) query = query.eq('published', true);

  const { data, error } = await query;
  if (error) fail('listar galería', error);
  const items = (data ?? []).map(mapGallery);

  // En el panel se muestra la realidad (si está vacío, está vacío).
  if (!publicOnly) return items;

  // En el sitio público, si aún no hay fotos subidas se muestra el contenido base.
  return items.length > 0 ? items : GALLERY_ITEMS;
}

export async function getGalleryItem(id: number): Promise<GalleryItem | null> {
  if (!supabase) {
    const items = readLS<GalleryItem[]>(LS.gallery, GALLERY_ITEMS);
    return items.find((i) => i.id === id) ?? null;
  }
  const { data, error } = await supabase.from('gallery_items').select('*').eq('id', id).maybeSingle();
  if (error) fail('obtener imagen', error);
  return data ? mapGallery(data as Row) : null;
}

export async function createGalleryItem(item: {
  image: string;
  title?: string;
  category?: string;
  type: GalleryItem['type'];
  featured?: boolean;
  published?: boolean;
}): Promise<void> {
  if (!supabase) {
    const items = readLS<GalleryItem[]>(LS.gallery, GALLERY_ITEMS);
    writeLS(LS.gallery, [
      {
        id: nextId(items),
        image: item.image,
        title: item.title,
        category: item.category,
        type: item.type,
        likes: 0,
        featured: item.featured ?? false,
        published: item.published ?? true,
        createdAt: new Date().toISOString(),
      },
      ...items,
    ]);
    return;
  }
  const { error } = await supabase.from('gallery_items').insert({
    image_url: item.image,
    title: item.title ?? null,
    category: item.category ?? null,
    type: item.type,
    featured: item.featured ?? false,
    published: item.published ?? true,
  });
  if (error) fail('crear imagen', error);
}

export async function updateGalleryItem(id: number, patch: Partial<GalleryItem>): Promise<void> {
  if (!supabase) {
    const items = readLS<GalleryItem[]>(LS.gallery, GALLERY_ITEMS);
    writeLS(
      LS.gallery,
      items.map((i) => (i.id === id ? { ...i, ...patch } : i))
    );
    return;
  }
  const dbPatch: Row = {};
  if (patch.image !== undefined) dbPatch.image_url = patch.image;
  if (patch.title !== undefined) dbPatch.title = patch.title;
  if (patch.category !== undefined) dbPatch.category = patch.category;
  if (patch.type !== undefined) dbPatch.type = patch.type;
  if (patch.featured !== undefined) dbPatch.featured = patch.featured;
  if (patch.published !== undefined) dbPatch.published = patch.published;

  const { error } = await supabase.from('gallery_items').update(dbPatch).eq('id', id);
  if (error) fail('actualizar imagen', error);
}

export async function deleteGalleryItem(id: number): Promise<void> {
  if (!supabase) {
    const items = readLS<GalleryItem[]>(LS.gallery, GALLERY_ITEMS);
    writeLS(
      LS.gallery,
      items.filter((i) => i.id !== id)
    );
    return;
  }

  // Se borra también el archivo de Storage: si solo se borra la fila, los
  // archivos quedan huérfanos y consumen cuota para siempre.
  const { data: row } = await supabase
    .from('gallery_items')
    .select('image_url')
    .eq('id', id)
    .maybeSingle();

  const storagePath = row?.image_url ? storagePathFromUrl(String(row.image_url)) : null;

  const { error } = await supabase.from('gallery_items').delete().eq('id', id);
  if (error) fail('eliminar imagen', error);

  if (storagePath) {
    const { error: storageError } = await supabase.storage.from('gallery').remove([storagePath]);
    if (storageError) {
      // No se interrumpe: la fila ya no existe y el archivo se puede limpiar después.
      console.warn('[api] no se pudo borrar el archivo de Storage:', storageError.message);
    }
  }
}

export async function likeGalleryItem(id: number): Promise<number> {
  if (!supabase) {
    const items = readLS<GalleryItem[]>(LS.gallery, GALLERY_ITEMS);
    let likes = 0;
    const next = items.map((i) => {
      if (i.id !== id) return i;
      likes = (i.likes || 0) + 1;
      return { ...i, likes };
    });
    writeLS(LS.gallery, next);
    return likes;
  }
  const { data, error } = await supabase.rpc('like_gallery_item', { item_id: id });
  if (error) fail('registrar me gusta', error);
  return Number(data ?? 0);
}

const MAX_INPUT_BYTES = 12 * 1024 * 1024; // foto de teléfono sin comprimir
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

/** Extrae la ruta interna del bucket a partir de una URL pública. */
function storagePathFromUrl(url: string): string | null {
  const marker = '/storage/v1/object/public/gallery/';
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length).split('?')[0]);
}

/** Sube una imagen al bucket `gallery` y devuelve la URL pública. */
export async function uploadGalleryImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new ApiError('Formato no permitido. Usa JPG, PNG, WEBP o AVIF.');
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new ApiError('La imagen supera los 12 MB. Usa una versión más liviana.');
  }

  // Se comprime en el navegador: 4–8 MB → 150–250 KB. Es lo que evita llenar
  // el 1 GB del plan gratuito con un puñado de fotos.
  const optimized = await optimizeImage(file);

  if (!supabase) {
    // Modo demo: URL temporal del navegador (no persiste tras recargar).
    return URL.createObjectURL(optimized);
  }

  const ext = optimized.type === 'image/webp' ? 'webp' : optimized.name.split('.').pop()?.toLowerCase() || 'jpg';
  const safeName =
    optimized.name
      .replace(/\.[^.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 40) || 'imagen';
  const path = `${new Date().getFullYear()}/${Date.now()}-${safeName}.${ext}`;

  const { error } = await supabase.storage.from('gallery').upload(path, optimized, {
    cacheControl: '31536000',
    upsert: false,
    contentType: optimized.type,
  });
  if (error) fail('subir imagen', error);

  const { data } = supabase.storage.from('gallery').getPublicUrl(path);
  return data.publicUrl;
}

// -----------------------------------------------------------------------------
// FINANZAS
// -----------------------------------------------------------------------------
export async function listTransactions(): Promise<Transaction[]> {
  if (!supabase) return readLS<Transaction[]>(LS.transactions, MOCK_TRANSACTIONS);
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false });
  if (error) fail('listar movimientos', error);
  const items = (data ?? []).map(mapTransaction);
  return items.length > 0 ? items : [];
}

export async function createTransaction(input: {
  title: string;
  amount: number;
  type: Transaction['type'];
  category: string;
  date: string;
  status?: Transaction['status'];
}): Promise<void> {
  if (!supabase) {
    const items = readLS<Transaction[]>(LS.transactions, MOCK_TRANSACTIONS);
    writeLS(LS.transactions, [
      {
        id: nextId(items),
        title: input.title,
        amount: input.amount,
        type: input.type,
        category: input.category,
        date: input.date,
        status: input.status ?? 'completed',
        createdAt: new Date().toISOString(),
      },
      ...items,
    ]);
    return;
  }
  const { error } = await supabase.from('transactions').insert({
    title: input.title,
    amount: input.amount,
    type: input.type,
    category: input.category,
    date: input.date,
    status: input.status ?? 'completed',
  });
  if (error) fail('registrar movimiento', error);
}

export async function deleteTransaction(id: number): Promise<void> {
  if (!supabase) {
    const items = readLS<Transaction[]>(LS.transactions, MOCK_TRANSACTIONS);
    writeLS(
      LS.transactions,
      items.filter((t) => t.id !== id)
    );
    return;
  }
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) fail('eliminar movimiento', error);
}

// -----------------------------------------------------------------------------
// AGENDA
// -----------------------------------------------------------------------------
/** Agenda pública: solo fecha y estado (sin títulos ni notas privadas). */
export async function listPublicCalendar(): Promise<CalendarEvent[]> {
  if (!supabase) return readLS<CalendarEvent[]>(LS.calendar, []);

  const { data, error } = await supabase.from('calendar_public').select('date,status');
  if (error) fail('consultar disponibilidad', error);
  return (data ?? []).map((r, idx) => ({
    id: `pub-${idx}`,
    date: String((r as Row).date).slice(0, 10),
    status: ((r as Row).status as CalendarEvent['status']) ?? 'booked',
  }));
}

/** Agenda completa (solo administración). */
export async function listCalendarEvents(): Promise<CalendarEvent[]> {
  if (!supabase) return readLS<CalendarEvent[]>(LS.calendar, []);
  const { data, error } = await supabase.from('calendar_events').select('*').order('date');
  if (error) fail('listar agenda', error);
  return (data ?? []).map(mapCalendar);
}

export async function upsertCalendarEvent(event: {
  date: string;
  status: CalendarEvent['status'];
  title?: string;
  timeStart?: string;
  timeEnd?: string;
}): Promise<void> {
  if (!supabase) {
    const items = readLS<CalendarEvent[]>(LS.calendar, []);
    const rest = items.filter((e) => e.date !== event.date);
    writeLS(LS.calendar, [...rest, { id: event.date, ...event }]);
    return;
  }
  const { error } = await supabase.from('calendar_events').upsert(
    {
      date: event.date,
      status: event.status,
      title: event.title ?? null,
      time_start: event.timeStart || null,
      time_end: event.timeEnd || null,
    },
    { onConflict: 'date' }
  );
  if (error) fail('guardar fecha', error);
}

export async function deleteCalendarEvent(date: string): Promise<void> {
  if (!supabase) {
    const items = readLS<CalendarEvent[]>(LS.calendar, []);
    writeLS(
      LS.calendar,
      items.filter((e) => e.date !== date)
    );
    return;
  }
  const { error } = await supabase.from('calendar_events').delete().eq('date', date);
  if (error) fail('liberar fecha', error);
}

// -----------------------------------------------------------------------------
// ESTADÍSTICAS
// -----------------------------------------------------------------------------
export async function recordPageView(path: string): Promise<void> {
  if (!supabase) {
    const total = readLS<number>(LS.views, 0) + 1;
    writeLS(LS.views, total);
    return;
  }
  // Se ignora el error: una visita perdida nunca debe romper la página.
  await supabase.from('page_views').insert({ path: path.slice(0, 200) });
}

export async function getVisitCount(): Promise<number> {
  if (!supabase) return readLS<number>(LS.views, 0);
  const { count, error } = await supabase
    .from('page_views')
    .select('*', { count: 'exact', head: true });
  if (error) return 0;
  return count ?? 0;
}
