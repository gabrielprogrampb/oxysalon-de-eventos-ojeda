import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SPACES } from '../constants';
import { AnimateOnScroll } from '../hooks/useScrollAnimation';
import { createInquiry } from '../src/lib/store';
import { isHoneypotTripped, isSubmissionTooFast, isValid, validateInquiry } from '../src/lib/validation';
import { SITE, whatsappLink, hasPhone, telLink, hasEmail, mailLink, hasWhatsApp, socialLinks } from '../src/config/site';

const EVENT_TYPES = ['Boda', '15 Años', 'Corporativo', 'Cumpleaños', 'Bautizo / Primera Comunión', 'Otro'];
const GUESTS_RANGES = ['Menos de 50', '50 - 100', '100 - 150', '150 - 250', 'Más de 250'];
/** Sedes reales del negocio. El orden importa: Ojeda es la sede principal. */
const VENUES = ['Ojeda', 'Cabimas', 'Maracaibo'];

interface FormState {
  name: string;
  email: string;
  phone: string;
  instagram: string;
  telegram: string;
  eventType: string;
  eventDate: string;
  guestsRange: string;
  spaceInterest: string;
  venue: string;
  message: string;
  consent: boolean;
}

const EMPTY_FORM: FormState = {
  name: '',
  email: '',
  phone: '',
  instagram: '',
  telegram: '',
  eventType: 'Boda',
  eventDate: '',
  guestsRange: '50 - 100',
  spaceInterest: '',
  venue: 'Ojeda',
  message: '',
  consent: false,
};

const Booking: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mountedAt = useRef<number>(Date.now());

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const socials = socialLinks();
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Espacio preseleccionado desde la página de Espacios
  useEffect(() => {
    const incoming = (location.state as { selectedSpace?: string } | null)?.selectedSpace;
    if (incoming) setForm((f) => ({ ...f, spaceInterest: incoming }));
  }, [location.state]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    setServerError('');
  };

  const validate = (): boolean => {
    const next = validateInquiry(
      {
        name: form.name,
        email: form.email,
        phone: form.phone,
        eventDate: form.eventDate,
        consent: form.consent,
      },
      today
    );

    setErrors(next);
    return isValid(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    // Anti-bot: campo trampa + envío demasiado rápido
    if (isHoneypotTripped(honeypot)) return;
    if (isSubmissionTooFast(mountedAt.current)) {
      setServerError('Espera un momento antes de enviar el formulario.');
      return;
    }
    if (!validate()) {
      document.querySelector('[aria-invalid="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSubmitting(true);
    try {
      await createInquiry({
        name: form.name,
        email: form.email,
        phone: form.phone,
        instagram: form.instagram || undefined,
        telegram: form.telegram || undefined,
        eventType: form.eventType,
        eventDate: form.eventDate || undefined,
        guestsRange: form.guestsRange,
        spaceInterest: form.spaceInterest || undefined,
        venue: form.venue,
        message: form.message || undefined,
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setServerError(
        'No pudimos enviar tu solicitud. Inténtalo de nuevo o escríbenos por WhatsApp.'
      );
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (key: keyof FormState) =>
    `w-full bg-black/20 border rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 focus:ring-0 transition-all font-medium text-base ${
      errors[key] ? 'border-red-500/70 focus:border-red-500' : 'border-white/10 focus:border-gold'
    }`;

  const waHref = whatsappLink(
    'Hola, vengo de la página web de Oxysalon y quiero cotizar un evento.'
  );

  return (
    <div className="relative font-display min-h-screen flex flex-col overflow-x-hidden text-white">
      <div
        className="fixed inset-0 parallax-bg z-0 animate-pan-zoom"
        style={{ backgroundImage: `url('/images/oxy/img-903bf12d1b34.webp')` }}
      />
      <div className="fixed inset-0 bg-[#0f0b18]/85 backdrop-blur-[2px] z-0"></div>
      <div className="fixed top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] opacity-40 z-0 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-gold/10 rounded-full blur-[150px] opacity-30 z-0 pointer-events-none"></div>

      <header className="sticky top-0 z-50 bg-transparent backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
              aria-label="Volver"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <h1 className="text-xl font-bold tracking-tight">Contacto y Reservas</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-8 pb-24 max-w-6xl mx-auto w-full relative z-10 px-6 pt-10">
        <AnimateOnScroll animation="slide-up">
          <div className="mb-4">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-2">
              {submitted ? 'Solicitud recibida.' : 'Comienza tu viaje.'}
            </h2>
            <p className="text-gray-400 text-lg">
              {submitted
                ? 'Gracias por escribirnos. Te contactaremos muy pronto.'
                : 'Estamos listos para hacer realidad tu visión.'}
            </p>
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <section className="lg:col-span-7">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500"></div>

              {submitted ? (
                <div className="flex flex-col items-center text-center gap-6 py-8">
                  <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-green-400">check_circle</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">¡Listo, {form.name.split(' ')[0]}!</h3>
                    <p className="text-gray-300 leading-relaxed max-w-md">
                      Recibimos tu solicitud para <strong className="text-white">{form.eventType}</strong>
                      {form.eventDate ? (
                        <>
                          {' '}el <strong className="text-white">{form.eventDate}</strong>
                        </>
                      ) : null}
                      . Nuestro equipo revisará la disponibilidad y te responderá en menos de 24 horas.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                    {waHref && (
                      <a
                        href={waHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-[#25D366] text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 transition-all"
                      >
                        <span className="material-symbols-outlined text-lg">chat</span>
                        Escribir por WhatsApp
                      </a>
                    )}
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setForm(EMPTY_FORM);
                      }}
                      className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 font-bold py-3.5 rounded-xl transition-colors"
                    >
                      Enviar otra
                    </button>
                  </div>

                  <button onClick={() => navigate('/')} className="text-sm text-gray-400 hover:text-gold transition-colors">
                    Volver al inicio
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <span className="text-gold text-xs font-bold uppercase tracking-widest mb-2 block">
                      Formulario de cotización
                    </span>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Completa los detalles de tu evento. Nuestro equipo se pondrá en contacto contigo
                      en menos de 24 horas.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
                    {/* Honeypot anti-bot */}
                    <div className="hidden" aria-hidden="true">
                      <label htmlFor="website">No completar</label>
                      <input
                        id="website"
                        name="website"
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                      />
                    </div>

                    <div className="group">
                      <label htmlFor="name" className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                        Nombre completo <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        autoComplete="name"
                        value={form.name}
                        onChange={(e) => setField('name', e.target.value)}
                        aria-invalid={Boolean(errors.name)}
                        className={inputClass('name')}
                        placeholder="Ej. María González"
                      />
                      {errors.name && <p className="text-red-400 text-xs mt-1.5">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="group">
                        <label htmlFor="email" className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                          Correo electrónico <span className="text-red-400">*</span>
                        </label>
                        <input
                          id="email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          value={form.email}
                          onChange={(e) => setField('email', e.target.value)}
                          aria-invalid={Boolean(errors.email)}
                          className={inputClass('email')}
                          placeholder="maria@ejemplo.com"
                        />
                        {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>}
                      </div>
                      <div className="group">
                        <label htmlFor="phone" className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                          Teléfono / WhatsApp <span className="text-red-400">*</span>
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          value={form.phone}
                          onChange={(e) => setField('phone', e.target.value)}
                          aria-invalid={Boolean(errors.phone)}
                          className={inputClass('phone')}
                          placeholder="+58 412 000 0000"
                        />
                        {errors.phone && <p className="text-red-400 text-xs mt-1.5">{errors.phone}</p>}
                      </div>
                    </div>

                    <div className="group">
                      <label htmlFor="spaceInterest" className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                        Espacio de interés
                      </label>
                      <select
                        id="spaceInterest"
                        value={form.spaceInterest}
                        onChange={(e) => setField('spaceInterest', e.target.value)}
                        className={`${inputClass('spaceInterest')} appearance-none cursor-pointer`}
                      >
                        <option className="bg-background-dark" value="">
                          — Seleccionar espacio (opcional) —
                        </option>
                        {SPACES.map((space) => (
                          <option key={space.id} value={space.name} className="bg-background-dark">
                            {space.name} ({space.guests} personas)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="group">
                        <label htmlFor="instagram" className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                          Instagram (opcional)
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">@</span>
                          <input
                            id="instagram"
                            type="text"
                            value={form.instagram}
                            onChange={(e) => setField('instagram', e.target.value)}
                            className={`${inputClass('instagram')} pl-9`}
                            placeholder="usuario"
                          />
                        </div>
                      </div>
                      <div className="group">
                        <label htmlFor="telegram" className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                          Telegram (opcional)
                        </label>
                        <input
                          id="telegram"
                          type="text"
                          value={form.telegram}
                          onChange={(e) => setField('telegram', e.target.value)}
                          className={inputClass('telegram')}
                          placeholder="usuario o teléfono"
                        />
                      </div>
                    </div>

                    <div className="group">
                      <div className="flex justify-between items-center mb-2">
                        <label htmlFor="eventDate" className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Fecha tentativa
                        </label>
                        <button
                          type="button"
                          onClick={() => navigate('/calendar')}
                          className="text-gold text-xs font-bold uppercase hover:underline flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">calendar_month</span>
                          Ver disponibilidad
                        </button>
                      </div>
                      <input
                        id="eventDate"
                        type="date"
                        min={today}
                        value={form.eventDate}
                        onChange={(e) => setField('eventDate', e.target.value)}
                        aria-invalid={Boolean(errors.eventDate)}
                        className={`${inputClass('eventDate')} [color-scheme:dark]`}
                      />
                      {errors.eventDate && <p className="text-red-400 text-xs mt-1.5">{errors.eventDate}</p>}
                    </div>

                    <div className="group">
                      <label htmlFor="venue" className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                        Sede del evento
                      </label>
                      <select
                        id="venue"
                        value={form.venue}
                        onChange={(e) => setField('venue', e.target.value)}
                        className={`${inputClass('venue')} appearance-none cursor-pointer`}
                      >
                        {VENUES.map((v) => (
                          <option key={v} value={v} className="bg-background-dark">
                            {v}
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-gray-500 mt-1.5">
                        Tenemos tres sedes: Ojeda, Cabimas y Maracaibo.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="group">
                        <label htmlFor="eventType" className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                          Tipo de evento
                        </label>
                        <select
                          id="eventType"
                          value={form.eventType}
                          onChange={(e) => setField('eventType', e.target.value)}
                          className={`${inputClass('eventType')} appearance-none cursor-pointer`}
                        >
                          {EVENT_TYPES.map((t) => (
                            <option key={t} value={t} className="bg-background-dark">
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="group">
                        <label htmlFor="guestsRange" className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                          Invitados
                        </label>
                        <select
                          id="guestsRange"
                          value={form.guestsRange}
                          onChange={(e) => setField('guestsRange', e.target.value)}
                          className={`${inputClass('guestsRange')} appearance-none cursor-pointer`}
                        >
                          {GUESTS_RANGES.map((g) => (
                            <option key={g} value={g} className="bg-background-dark">
                              {g}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="group">
                      <label htmlFor="message" className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                        Cuéntanos más detalles
                      </label>
                      <textarea
                        id="message"
                        value={form.message}
                        onChange={(e) => setField('message', e.target.value)}
                        maxLength={2000}
                        className={`${inputClass('message')} resize-none min-h-[120px]`}
                        placeholder="Colores, temática, necesidades especiales, ideas específicas…"
                      />
                      <p className="text-right text-[10px] text-gray-500 mt-1">{form.message.length}/2000</p>
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form.consent}
                        onChange={(e) => setField('consent', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-white/20 bg-black/30 text-primary focus:ring-0"
                        aria-invalid={Boolean(errors.consent)}
                      />
                      <span className="text-xs text-gray-400 leading-relaxed">
                        Autorizo a {SITE.name} a contactarme por teléfono, WhatsApp o correo para
                        responder esta solicitud. Mis datos no se comparten con terceros.
                      </span>
                    </label>
                    {errors.consent && <p className="text-red-400 text-xs -mt-3">{errors.consent}</p>}

                    {serverError && (
                      <div role="alert" className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg flex items-start gap-2">
                        <span className="material-symbols-outlined text-lg">error</span>
                        <span>{serverError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="mt-2 w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-bold py-5 rounded-xl shadow-lg shadow-primary/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group hover:shadow-primary/40 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <span className="material-symbols-outlined animate-spin">progress_activity</span>
                          <span className="tracking-wide">ENVIANDO…</span>
                        </>
                      ) : (
                        <>
                          <span className="tracking-wide">SOLICITAR COTIZACIÓN</span>
                          <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                            arrow_forward
                          </span>
                        </>
                      )}
                    </button>

                    <p className="text-center text-[11px] text-gray-500">
                      Respuesta en menos de 24 horas hábiles. Sin compromiso.
                    </p>
                  </form>
                </>
              )}
            </div>
          </section>

          <section className="lg:col-span-5 flex flex-col gap-6 sticky top-24">
            <div className="rounded-[2rem] bg-[#1a1625] border border-white/10 p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold/10 rounded-full blur-[50px]"></div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold border border-gold/20">
                  <span className="material-symbols-outlined">schedule</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Horarios de atención</h3>
                  <p className="text-xs text-gray-400">Oficina y visitas</p>
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                {SITE.hours.map((h) => (
                  <div key={h.label} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0">
                    <span className="text-gray-300 font-medium">{h.label}</span>
                    <span className="text-white font-bold text-right">{h.value}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/calendar')}
                className="w-full mt-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 hover:text-white transition-colors text-sm font-bold flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">calendar_month</span>
                Consultar agenda completa
              </button>
            </div>

            <div className="rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 group h-[250px] relative">
              <iframe
                src={SITE.mapsEmbed}
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(20%) contrast(1.1) opacity(0.8)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación de Oxysalon de Eventos Ojeda"
                className="transition-all duration-500 group-hover:filter-none group-hover:opacity-100"
              ></iframe>
              <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
                <span className="material-symbols-outlined text-gold text-sm">location_on</span>
                <span className="text-white text-xs font-bold">
                  {SITE.city}, {SITE.state}
                </span>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 flex flex-col gap-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-6">Contacto directo</h3>
                <div className="flex flex-col gap-5">
                  {hasPhone() && telLink() && (
                    <a href={telLink()!} className="flex items-center gap-4 group p-3 rounded-xl hover:bg-white/5 transition-colors -mx-3">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined">call</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Llámanos</p>
                        <p className="text-white font-medium group-hover:text-gold transition-colors">{SITE.phone}</p>
                      </div>
                    </a>
                  )}

                  {hasWhatsApp() && waHref && (
                    <a href={waHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group p-3 rounded-xl hover:bg-white/5 transition-colors -mx-3">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-[#25D366] group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined">chat</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">WhatsApp</p>
                        <p className="text-white font-medium group-hover:text-gold transition-colors">Escríbenos ahora</p>
                      </div>
                    </a>
                  )}

                  {hasEmail() && mailLink('Solicitud de cotización') && (
                    <a href={mailLink('Solicitud de cotización')!} className="flex items-center gap-4 group p-3 rounded-xl hover:bg-white/5 transition-colors -mx-3">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined">mail</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Escríbenos</p>
                        <p className="text-white font-medium group-hover:text-gold transition-colors">{SITE.email}</p>
                      </div>
                    </a>
                  )}
                </div>
              </div>

              {socials.length > 0 && (
                <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                  <span className="text-sm text-gray-400">Síguenos:</span>
                  <div className="flex gap-2">
                    {socials.map((s) => (
                      <a
                        key={s.name}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white text-xs font-bold hover:bg-gold hover:text-black transition-all"
                      >
                        {s.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Booking;
