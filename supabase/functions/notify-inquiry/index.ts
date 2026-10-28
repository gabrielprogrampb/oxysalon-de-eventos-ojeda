// =============================================================================
// Supabase Edge Function: notify-inquiry
// Envía un correo al salón cada vez que entra una solicitud nueva.
//
// Requiere (Supabase → Edge Functions → Secrets):
//   RESEND_API_KEY   = re_xxxxxxxx        (resend.com, plan gratis: 100 correos/día)
//   NOTIFY_TO        = reservas@tudominio.com
//   NOTIFY_FROM      = onboarding@resend.dev   (o tu dominio verificado)
//   WEBHOOK_SECRET   = cadena larga aleatoria  (obligatorio: protege la función)
//
// Despliegue:
//   supabase functions deploy notify-inquiry --no-verify-jwt
//
// Configuración del disparador (Supabase → Database → Webhooks):
//   Tabla: inquiries · Evento: INSERT · Tipo: Supabase Edge Function
//   → notify-inquiry
//   → HTTP Headers:  x-webhook-secret: <el mismo valor de WEBHOOK_SECRET>
//
// Sin el header correcto la función responde 401 y no envía nada.
// =============================================================================

// @ts-expect-error — Deno runtime
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

interface InquiryRow {
  id: number;
  name: string;
  email: string;
  phone: string;
  event_type?: string | null;
  event_date?: string | null;
  guests_range?: string | null;
  space_interest?: string | null;
  message?: string | null;
}

interface WebhookPayload {
  type: string;
  table: string;
  record: InquiryRow;
}

const esc = (value: unknown): string =>
  String(value ?? '—').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c] as string);

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  const NOTIFY_TO = Deno.env.get('NOTIFY_TO');
  const NOTIFY_FROM = Deno.env.get('NOTIFY_FROM') ?? 'onboarding@resend.dev';
  const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET');

  if (!RESEND_API_KEY || !NOTIFY_TO) {
    console.error('Faltan RESEND_API_KEY o NOTIFY_TO');
    return new Response(JSON.stringify({ ok: false, error: 'missing_secrets' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // La función se despliega con --no-verify-jwt, así que se protege con un
  // secreto compartido enviado por el webhook de la base de datos.
  // Sin esto, cualquiera con la URL podría usarla para enviar correos.
  if (!WEBHOOK_SECRET || req.headers.get('x-webhook-secret') !== WEBHOOK_SECRET) {
    return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'bad_json' }), { status: 400 });
  }

  if (payload.table !== 'inquiries' || payload.type !== 'INSERT') {
    return new Response(JSON.stringify({ ok: true, skipped: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const r = payload.record;

  // `reply_to` inválido hace fallar el envío completo en Resend: se valida antes.
  const replyTo = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(String(r.email ?? ''))
    ? String(r.email).trim().toLowerCase()
    : undefined;

  const html = `
    <div style="font-family:system-ui,sans-serif;background:#0f0b18;color:#fff;padding:32px">
      <h2 style="color:#D4AF37;margin:0 0 4px">Nueva solicitud de cotización</h2>
      <p style="color:#9ca3af;margin:0 0 24px">Oxysalon de Eventos Ojeda · sitio web</p>
      <table style="width:100%;border-collapse:collapse;background:#1a1625;border-radius:12px;overflow:hidden">
        <tr><td style="padding:12px 16px;color:#9ca3af">Nombre</td><td style="padding:12px 16px;font-weight:600">${esc(r.name)}</td></tr>
        <tr><td style="padding:12px 16px;color:#9ca3af">Correo</td><td style="padding:12px 16px">${esc(r.email)}</td></tr>
        <tr><td style="padding:12px 16px;color:#9ca3af">Teléfono</td><td style="padding:12px 16px">${esc(r.phone)}</td></tr>
        <tr><td style="padding:12px 16px;color:#9ca3af">Evento</td><td style="padding:12px 16px">${esc(r.event_type)}</td></tr>
        <tr><td style="padding:12px 16px;color:#9ca3af">Fecha</td><td style="padding:12px 16px">${esc(r.event_date)}</td></tr>
        <tr><td style="padding:12px 16px;color:#9ca3af">Invitados</td><td style="padding:12px 16px">${esc(r.guests_range)}</td></tr>
        <tr><td style="padding:12px 16px;color:#9ca3af">Espacio</td><td style="padding:12px 16px">${esc(r.space_interest)}</td></tr>
      </table>
      <p style="margin:24px 0 8px;color:#9ca3af">Mensaje</p>
      <div style="background:#1a1625;padding:16px;border-radius:12px;white-space:pre-wrap">${esc(r.message)}</div>
      <p style="margin-top:28px">
        <a href="https://wa.me/${String(r.phone ?? '').replace(/\D/g, '')}"
           style="background:#25D366;color:#000;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700">
          Responder por WhatsApp
        </a>
      </p>
    </div>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Oxysalon <${NOTIFY_FROM}>`,
      to: [NOTIFY_TO],
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject: `Nueva solicitud: ${r.event_type ?? 'Evento'} — ${r.name}`,
      html,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error('Resend error:', detail);
    return new Response(JSON.stringify({ ok: false, error: 'resend_failed' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
