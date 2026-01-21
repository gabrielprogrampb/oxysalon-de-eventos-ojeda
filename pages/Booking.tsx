import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SPACES } from '../constants'; // Import SPACES to list them
import { AnimateOnScroll } from '../hooks/useScrollAnimation';

const SOCIAL_ICONS = [
  {
    name: 'Instagram',
    path: 'https://instagram.com',
    svg: <path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M18,5A1,1 0 0,1 19,6A1,1 0 0,1 18,7A1,1 0 0,1 17,6A1,1 0 0,1 18,5Z" />
  },
  {
    name: 'Facebook',
    path: 'https://facebook.com',
    svg: <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  },
  {
    name: 'TikTok',
    path: 'https://tiktok.com',
    svg: <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 1 0 7.75 6.82V9.17a7.18 7.18 0 0 0 4.12 1.87V7.55c-1.05-.12-2.07-.67-2.64-1.73Z" />
  }
];

const Booking: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedSpace, setSelectedSpace] = useState('');

  // Check if we have incoming state from Spaces page
  useEffect(() => {
    if (location.state && location.state.selectedSpace) {
      setSelectedSpace(location.state.selectedSpace);
    }
  }, [location.state]);

  return (
    <div className="relative font-display min-h-screen flex flex-col overflow-x-hidden text-white">
      {/* Full Page Parallax Background Image */}
      <div
        className="fixed inset-0 parallax-bg z-0 animate-pan-zoom"
        style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBPaRdV4e_HKmzWZBXlxITL7TpYG13wE1wPQ7oOsjLyrn6P4JPCckGRgntUETkrB6d10GZrqkkkRbb7GKCdeUYA0zdH4DY9bz-2kg1q3XJURcNwid1QDblXw0H_vjcO5A7depT-3e2wpez7lmvf07X0usbBO11Gykrtal4Bq4BXb2cT87ht7C1qiAHZlpqXto-fjYKqelL1WCWuZI2oo01HBO2449lZNCaVcsHWK49lHqK_sGaLujK5oqXExGoMAXfHeCO2LXG3WC51')` }}
      ></div>
      {/* Heavy Overlay to make text readable and content pop */}
      <div className="fixed inset-0 bg-[#0f0b18]/85 backdrop-blur-[2px] z-0"></div>

      {/* Ambient Orbes */}
      <div className="fixed top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] opacity-40 z-0 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-gold/10 rounded-full blur-[150px] opacity-30 z-0 pointer-events-none"></div>

      {/* Top App Bar */}
      <header className="sticky top-0 z-50 bg-transparent backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <h1 className="text-xl font-bold tracking-tight">Contacto y Reservas</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col gap-8 pb-24 max-w-6xl mx-auto w-full relative z-10 px-6 pt-10">

        {/* Intro Text */}
        <AnimateOnScroll animation="slide-up">
          <div className="mb-4">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-2">Comienza tu viaje.</h2>
            <p className="text-gray-400 text-lg">Estamos listos para hacer realidad tu visión.</p>
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Form (Glass effect) */}
          <section className="lg:col-span-7">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500"></div>

              <div className="mb-8">
                <span className="text-gold text-xs font-bold uppercase tracking-widest mb-2 block">Formulario de Cotización</span>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Completa los detalles de tu evento. Nuestro equipo de concierges se pondrá en contacto contigo en menos de 24 horas.
                </p>
              </div>

              <form className="flex flex-col gap-6">
                {/* Name */}
                <div className="group">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block group-focus-within:text-gold transition-colors">Nombre Completo <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    required
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 focus:border-gold focus:ring-0 transition-all font-medium text-base"
                    placeholder="Ej. María González"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div className="group">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block group-focus-within:text-gold transition-colors">Correo Electrónico <span className="text-red-400">*</span></label>
                    <input
                      type="email"
                      required
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 focus:border-gold focus:ring-0 transition-all font-medium text-base"
                      placeholder="maria@ejemplo.com"
                    />
                  </div>
                  {/* Phone */}
                  <div className="group">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block group-focus-within:text-gold transition-colors">Teléfono <span className="text-red-400">*</span></label>
                    <input
                      type="tel"
                      required
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 focus:border-gold focus:ring-0 transition-all font-medium text-base"
                      placeholder="+58 412 000 0000"
                    />
                  </div>
                </div>

                {/* Space Selection (New Field) */}
                <div className="group">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block group-focus-within:text-gold transition-colors">Espacio de Interés</label>
                  <select
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-gold focus:ring-0 transition-all font-medium text-base appearance-none cursor-pointer"
                    value={selectedSpace}
                    onChange={(e) => setSelectedSpace(e.target.value)}
                  >
                    <option className="bg-background-dark" value="">-- Seleccionar Espacio (Opcional) --</option>
                    {SPACES.map(space => (
                      <option key={space.id} value={space.name} className="bg-background-dark">{space.name} ({space.guests} pax)</option>
                    ))}
                  </select>
                </div>

                {/* Instagram & Telegram (Optional) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block group-focus-within:text-gold transition-colors">Instagram (Opcional)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">@</span>
                      <input
                        type="text"
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 pl-9 text-white placeholder:text-white/20 focus:border-gold focus:ring-0 transition-all font-medium text-base"
                        placeholder="usuario"
                      />
                    </div>
                  </div>
                  <div className="group">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block group-focus-within:text-gold transition-colors">Telegram (Opcional)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                        <span className="material-symbols-outlined text-[18px]">send</span>
                      </span>
                      <input
                        type="text"
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 pl-11 text-white placeholder:text-white/20 focus:border-gold focus:ring-0 transition-all font-medium text-base"
                        placeholder="usuario o teléfono"
                      />
                    </div>
                  </div>
                </div>

                {/* Date Section - Integrated with Calendar Check */}
                <div className="grid grid-cols-1 gap-6">
                  {/* Date */}
                  <div className="group">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider group-focus-within:text-gold transition-colors">Fecha Tentativa</label>
                      <button type="button" onClick={() => navigate('/calendar')} className="text-gold text-xs font-bold uppercase hover:underline flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">calendar_month</span>
                        Ver Disponibilidad
                      </button>
                    </div>
                    <input
                      type="date"
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-gold focus:ring-0 transition-all font-medium text-base [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Type */}
                  <div className="group">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block group-focus-within:text-gold transition-colors">Tipo de Evento</label>
                    <select className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-gold focus:ring-0 transition-all font-medium text-base appearance-none cursor-pointer">
                      <option className="bg-background-dark">Boda</option>
                      <option className="bg-background-dark">Corporativo</option>
                      <option className="bg-background-dark">15 Años</option>
                      <option className="bg-background-dark">Otro</option>
                    </select>
                  </div>
                  {/* Guests */}
                  <div className="group">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Invitados</label>
                    <select className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-gold focus:ring-0 transition-all font-medium text-base appearance-none cursor-pointer">
                      <option className="bg-background-dark">Menos de 50</option>
                      <option className="bg-background-dark">50 - 150</option>
                      <option className="bg-background-dark">150 - 300</option>
                      <option className="bg-background-dark">Más de 300</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="group">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block group-focus-within:text-gold transition-colors">Cuéntanos más detalles</label>
                  <textarea
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 focus:border-gold focus:ring-0 transition-all font-medium text-base resize-none min-h-[120px]"
                    placeholder="Colores, temática, necesidades especiales, ideas específicas..."
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button type="button" className="mt-4 w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-bold py-5 rounded-xl shadow-lg shadow-primary/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group hover:shadow-primary/40">
                  <span className="tracking-wide">SOLICITAR COTIZACIÓN</span>
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </form>
            </div>
          </section>

          {/* Right Column: Operating Hours & Map */}
          <section className="lg:col-span-5 flex flex-col gap-6 sticky top-24">

            {/* Operating Hours - NEW CARD */}
            <div className="rounded-[2rem] bg-[#1a1625] border border-white/10 p-8 shadow-2xl relative overflow-hidden group">
              {/* Decorative glow */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold/10 rounded-full blur-[50px]"></div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold border border-gold/20">
                  <span className="material-symbols-outlined">schedule</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Horarios de Atención</h3>
                  <p className="text-xs text-gray-400">Oficina y Visitas</p>
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-gray-300 font-medium">Lunes - Viernes</span>
                  <span className="text-white font-bold">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-gray-300 font-medium">Sábados</span>
                  <span className="text-white font-bold">10:00 AM - 4:00 PM</span>
                </div>
                <div className="pt-2">
                  <span className="block text-gray-300 font-medium mb-1">Horario de Eventos</span>
                  <span className="text-gold font-bold text-lg">9:00 AM - 12:00 AM</span>
                  <p className="text-[10px] text-gray-500 mt-1">Lunes a Domingo</p>
                </div>
              </div>

              <button onClick={() => navigate('/calendar')} className="w-full mt-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 hover:text-white transition-colors text-sm font-bold flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-lg">calendar_month</span>
                Consultar Agenda Completa
              </button>
            </div>

            {/* Map Card */}
            <div className="rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 group h-[250px] relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1633.8387830558968!2d-71.31652705624218!3d10.192826187572912!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e89d100669b9c29%3A0xf957ce5a8fcd4d8c!2sOXYSALON%20DE%20EVENTOS%20OJEDA!5e1!3m2!1ses-419!2sve!4v1767986848163!5m2!1ses-419!2sve"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(20%) contrast(1.1) opacity(0.8)' }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="transition-all duration-500 group-hover:filter-none group-hover:opacity-100"
              ></iframe>
              <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
                <span className="material-symbols-outlined text-gold text-sm">location_on</span>
                <span className="text-white text-xs font-bold">Ciudad Ojeda, Zulia</span>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 flex flex-col gap-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-6">Contacto Directo</h3>
                <div className="flex flex-col gap-5">
                  <a href="tel:+584121234567" className="flex items-center gap-4 group p-3 rounded-xl hover:bg-white/5 transition-colors -mx-3">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined">call</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Llámanos</p>
                      <p className="text-white font-medium group-hover:text-gold transition-colors">+58 (412) 123-4567</p>
                    </div>
                  </a>

                  <a href="mailto:concierge@oxyevents.com" className="flex items-center gap-4 group p-3 rounded-xl hover:bg-white/5 transition-colors -mx-3">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined">mail</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Escríbenos</p>
                      <p className="text-white font-medium group-hover:text-gold transition-colors">concierge@oxyevents.com</p>
                    </div>
                  </a>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                <span className="text-sm text-gray-400">Síguenos:</span>
                <div className="flex gap-2">
                  {SOCIAL_ICONS.map((social) => (
                    <a
                      key={social.name}
                      href={social.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-gold hover:text-black transition-all"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        {social.svg}
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Booking;