/**
 * =============================================================================
 * CONFIGURACIÓN DEL NEGOCIO — ÚNICO ARCHIVO QUE DEBES EDITAR
 * =============================================================================
 * Todo lo que aparece en el sitio (teléfono, WhatsApp, correo, redes, horarios)
 * se toma de aquí. Si un campo queda vacío (''), la interfaz lo oculta
 * automáticamente: nunca se publica un dato falso.
 *
 * ⚠️ PENDIENTE DE COMPLETAR CON DATOS REALES DEL CLIENTE:
 *   [ ] phone      → teléfono de oficina        ej: '+58 424-1234567'
 *   [ ] whatsapp   → solo dígitos con código país ej: '584241234567'
 *   [ ] email      → correo de reservas         ej: 'reservas@oxysalon.com'
 *   [ ] instagram  → usuario sin @              ej: 'oxysalon'
 *   [ ] facebook   → URL completa del perfil
 *   [ ] tiktok     → usuario sin @
 *   [ ] address    → dirección exacta del salón
 * =============================================================================
 */

export const SITE = {
  name: 'Oxysalon de Eventos Ojeda',
  shortName: 'Oxysalon',
  tagline: 'Salón de eventos en Ciudad Ojeda, Zulia',
  city: 'Ciudad Ojeda',
  state: 'Zulia',
  country: 'VE',

  // --- Contacto (completar) ---
  phone: '',
  whatsapp: '',
  email: '',
  address: '',

  // --- Redes sociales (completar) ---
  instagram: '',
  facebook: '',
  tiktok: '',

  // --- Ubicación (ya verificada en Google Maps) ---
  mapsEmbed:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1633.8387830558968!2d-71.31652705624218!3d10.192826187572912!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e89d100669b9c29%3A0xf957ce5a8fcd4d8c!2sOXYSALON%20DE%20EVENTOS%20OJEDA!5e1!3m2!1ses-419!2sve!4v1767986848163!5m2!1ses-419!2sve',
  mapsLink:
    'https://www.google.com/maps/search/?api=1&query=OXYSALON+DE+EVENTOS+OJEDA+Ciudad+Ojeda+Zulia',

  // --- Horarios ---
  hours: [
    { label: 'Lunes - Viernes', value: '9:00 AM - 6:00 PM' },
    { label: 'Sábados', value: '10:00 AM - 4:00 PM' },
    { label: 'Horario de eventos', value: '9:00 AM - 12:00 AM' },
  ],

  // --- Comercial ---
  currency: 'USD',
  maxGuests: 300,
} as const;

/** ¿Hay teléfono configurado? */
export const hasPhone = (): boolean => SITE.phone.trim().length > 0;

/** ¿Hay WhatsApp configurado? */
export const hasWhatsApp = (): boolean => /^\d{8,15}$/.test(SITE.whatsapp.trim());

/** ¿Hay correo configurado? */
export const hasEmail = (): boolean => /.+@.+\..+/.test(SITE.email.trim());

/** Enlace de WhatsApp con mensaje pre-cargado (null si no está configurado). */
export function whatsappLink(message?: string): string | null {
  if (!hasWhatsApp()) return null;
  const base = `https://wa.me/${SITE.whatsapp.trim()}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Enlace tel: (null si no está configurado). */
export function telLink(): string | null {
  if (!hasPhone()) return null;
  return `tel:${SITE.phone.replace(/[^\d+]/g, '')}`;
}

/** Enlace mailto: (null si no está configurado). */
export function mailLink(subject?: string): string | null {
  if (!hasEmail()) return null;
  const base = `mailto:${SITE.email.trim()}`;
  return subject ? `${base}?subject=${encodeURIComponent(subject)}` : base;
}

/** Redes sociales activas (solo las configuradas y con URL segura). */
export function socialLinks(): { name: string; url: string }[] {
  const safeUrl = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('@') || !/^https?:\/\//i.test(trimmed)) return null;
    return trimmed;
  };

  const links: { name: string; url: string }[] = [];

  if (SITE.instagram.trim()) {
    links.push({
      name: 'Instagram',
      url: `https://instagram.com/${SITE.instagram.trim().replace(/^@/, '')}`,
    });
  }

  const facebook = safeUrl(SITE.facebook);
  if (facebook) links.push({ name: 'Facebook', url: facebook });

  if (SITE.tiktok.trim()) {
    links.push({ name: 'TikTok', url: `https://tiktok.com/@${SITE.tiktok.trim().replace(/^@/, '')}` });
  }

  return links;
}
