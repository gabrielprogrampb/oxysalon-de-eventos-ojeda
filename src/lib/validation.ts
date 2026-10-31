/**
 * Validación del formulario de cotización, sin dependencias de React.
 *
 * Vive aparte del componente por dos razones:
 *   1. Se puede probar sin montar la interfaz (ver validation.test.ts).
 *   2. La misma regla sirve para el formulario público y para cualquier
 *      alta manual desde el panel.
 *
 * Las reglas replican los límites de la base de datos (0001_init.sql):
 * si aquí se acepta algo que la base rechaza, el usuario ve un error genérico
 * después de esperar la red. Por eso los límites están alineados.
 */

export interface InquiryFormValues {
  name: string;
  email: string;
  phone: string;
  eventDate: string;
  consent: boolean;
}

export type InquiryField = keyof InquiryFormValues;

export type InquiryErrors = Partial<Record<InquiryField, string>>;

/** Mínimo de dígitos para considerar un teléfono útil (incluye código de área). */
export const MIN_PHONE_DIGITS = 7;

/** Longitud mínima del nombre: descarta iniciales y pruebas de una letra. */
export const MIN_NAME_LENGTH = 3;

/** Tiempo mínimo entre abrir el formulario y enviarlo (anti-bot). */
export const MIN_FILL_MS = 2500;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Normaliza a solo dígitos para contar longitud real del teléfono. */
export function phoneDigits(phone: string): string {
  return (phone || '').replace(/[^\d]/g, '');
}

/**
 * Valida los campos obligatorios.
 *
 * @param values  Valores actuales del formulario.
 * @param today   Fecha de hoy en formato `YYYY-MM-DD` (se inyecta para poder
 *                probar el caso "fecha pasada" sin depender del reloj real).
 */
export function validateInquiry(values: InquiryFormValues, today: string): InquiryErrors {
  const errors: InquiryErrors = {};

  if (values.name.trim().length < MIN_NAME_LENGTH) {
    errors.name = 'Escribe tu nombre completo.';
  }

  if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = 'Escribe un correo válido.';
  }

  if (phoneDigits(values.phone).length < MIN_PHONE_DIGITS) {
    errors.phone = 'Escribe un teléfono válido (incluye el código de área).';
  }

  // La fecha es opcional: solo se compara si el visitante eligió una.
  if (values.eventDate && values.eventDate < today) {
    errors.eventDate = 'La fecha ya pasó. Elige una fecha futura.';
  }

  if (!values.consent) {
    errors.consent = 'Debes autorizar el contacto para enviar la solicitud.';
  }

  return errors;
}

export function isValid(errors: InquiryErrors): boolean {
  return Object.keys(errors).length === 0;
}

/** El campo trampa solo lo llenan los bots: si trae texto, se descarta el envío. */
export function isHoneypotTripped(honeypot: string): boolean {
  return (honeypot || '').trim() !== '';
}

/** Un envío en menos de MIN_FILL_MS es casi siempre un bot. */
export function isSubmissionTooFast(mountedAt: number, now: number = Date.now()): boolean {
  return now - mountedAt < MIN_FILL_MS;
}
