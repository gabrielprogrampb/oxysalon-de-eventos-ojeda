/**
 * Identificador anónimo de sesión del navegador.
 * Se usa para deduplicar visitas y "me gusta" sin cookies ni datos personales.
 * No se envía a terceros ni se cruza con información del visitante.
 */
const KEY = 'oxy-session-id';

function generate(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  // Respaldo para navegadores antiguos (no criptográfico, solo identifica la pestaña)
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getSessionId(): string {
  try {
    const current = localStorage.getItem(KEY);
    if (current && current.length >= 8) return current;
    const next = generate();
    localStorage.setItem(KEY, next);
    return next;
  } catch {
    // Almacenamiento bloqueado: la métrica se descarta, la página sigue funcionando
    return '';
  }
}
