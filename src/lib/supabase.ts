import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

/**
 * El sitio funciona en dos modos:
 *  - PRODUCCIÓN: con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY configuradas.
 *  - DEMO: sin credenciales. El contenido público se lee de constants.ts y el
 *    panel guarda en localStorage (solo para revisión local / capturas).
 *
 * La "anon key" es pública por diseño: la seguridad real la dan las políticas
 * RLS definidas en supabase/migrations/0001_init.sql.
 */
export const isSupabaseConfigured: boolean =
  rawUrl.startsWith('https://') &&
  rawKey.length > 20 &&
  !rawUrl.includes('TU-PROYECTO');

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(rawUrl, rawKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'oxy-auth',
      },
      global: {
        headers: { 'x-application-name': 'oxysalon-web' },
      },
    })
  : null;

export const SUPABASE_PROJECT_URL = isSupabaseConfigured ? rawUrl : null;
