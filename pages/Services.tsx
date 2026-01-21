import React from 'react';
import { useNavigate } from 'react-router-dom';
import Carousel from '../components/Carousel';
import { AnimateOnScroll } from '../hooks/useScrollAnimation';

const Services: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background-dark font-display antialiased text-white pb-24 min-h-screen overflow-x-hidden relative">
      {/* Background Texture for the whole page */}
      <div className="fixed inset-0 bg-noise opacity-30 pointer-events-none z-0"></div>

      {/* Immersive Parallax-style Header */}
      <div className="relative w-full h-[70vh] min-h-[500px] flex items-end">
        <div
          className="absolute inset-0 parallax-bg animate-pan-zoom"
          style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCPL3mZwTWipeFeef1EAkiAppOUz-4HxcmeXA5WwbWCb_Z46Rs_ng0eVm-8ipCfjcnU7HOhep5E6j934GI-4721tPLJ25VsHdpwTOjV3lKYzBNa6Un-MW7h1SCBU38b3HfiD1iZjCoVoByhao8sq_2JFP1lqzghkbJZCRNYRtVK9Sh4A8ucr4A670noCAggUCjqntaawE6uaCsBPyETkuqxLm6-PCQV4otfy6fHlLQUDG6gusZ6VcINttiuBb9uF4Inurk2p35GKUtb')` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent"></div>

        <div className="absolute top-0 w-full p-6 flex justify-between items-center z-50">
          <button
            onClick={() => navigate('/')}
            className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-white">arrow_back</span>
          </button>
        </div>

        <div className="relative z-10 px-6 pb-16 max-w-7xl mx-auto w-full">
          <div className="animate-fade-in-up">
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold uppercase tracking-widest text-black bg-gold rounded-full shadow-lg shadow-gold/20">Excelencia & Confort</span>
            <h1 className="text-5xl md:text-8xl font-extrabold leading-none tracking-tight mb-6 drop-shadow-lg">
              Instalaciones <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500">De Clase Mundial</span>
            </h1>
            <p className="text-gray-200 text-lg md:text-xl max-w-2xl leading-relaxed font-light drop-shadow-md">
              Cada detalle de nuestra sede ha sido curado para ofrecer una experiencia sin fricciones, donde el lujo se encuentra con la funcionalidad.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10 -mt-12 px-4">

        {/* Facilities Grid - Overlapping Header to remove gap */}
        <AnimateOnScroll animation="slide-up">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-20">
            {[
              { icon: 'groups', title: '300 Invitados', sub: 'Capacidad sentada' },
              { icon: 'local_parking', title: 'Valet Parking', sub: 'Estacionamiento privado' },
              { icon: 'skillet', title: 'Cocina Pro', sub: 'Equipamiento industrial' },
              { icon: 'wifi', title: 'WiFi 6', sub: 'Conectividad total' },
            ].map((facility, i) => (
              <div key={i} className="bg-[#151120]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center justify-center gap-4 shadow-2xl hover:-translate-y-2 transition-transform duration-300 group">
                <div className="size-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-black transition-colors">
                  <span className="material-symbols-outlined text-3xl">{facility.icon}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{facility.title}</h3>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mt-1 group-hover:text-white/70">{facility.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </AnimateOnScroll>

        {/* Premium Services - Large Immersive Cards */}
        <div className="mb-24 relative">
          {/* Decorative Blob */}
          <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

          <AnimateOnScroll animation="slide-up">
            <div className="text-center mb-12 relative z-10">
              <span className="text-gold text-xs font-bold uppercase tracking-widest">Servicios Exclusivos</span>
              <h2 className="text-4xl md:text-6xl font-extrabold mt-3">Elevamos tu Evento</h2>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div onClick={() => navigate('/services/decor')} className="group relative h-[450px] rounded-[2rem] overflow-hidden cursor-pointer shadow-2xl border border-white/5 transition-transform hover:-translate-y-1">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 group-hover:animate-pan-left" style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCWbtWTIb1VosjmoszvhvN7WwPA7qDCRzcaLEAPZsMxVLq3MKrGEyjDaTQ5Da26F6D274qlehsa7JB9gApZSFsFe7vR8HwdETrXRk4ucLgYrNND88-ahYCAiTzNauGiZ6cjxXaTuRP8OrIXuAoy9ncy_NNRd6QM5GAI6iKwGHz_M0_6UaRT96Rk_IO0U-zbCS6hTEGrzhLVA_WBLZJxpCf3PGATVQbctQ3jaPFjhDRjFva2NLyJbUbhj9CoQjEs33jgS5FrVgSBdZI1')` }}></div>
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors"></div>
              <div className="absolute inset-0 p-10 flex flex-col justify-end">
                <h3 className="text-4xl font-bold text-white mb-3">Diseño y Decoración</h3>
                <p className="text-gray-200 opacity-90 mb-6 max-w-sm text-lg font-light">Creamos universos visuales únicos. Desde arreglos florales hasta mobiliario de vanguardia.</p>
                <span className="inline-flex items-center gap-2 text-gold font-bold uppercase text-sm tracking-wider group-hover:translate-x-2 transition-transform">
                  Explorar Opciones <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div onClick={() => navigate('/services/tech')} className="group relative flex-1 min-h-[250px] rounded-[2rem] overflow-hidden cursor-pointer shadow-2xl border border-white/5 transition-transform hover:-translate-y-1">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 group-hover:animate-pan-right" style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuA64lWGVUXPBta19LZOBMoSswIP7fwpQfzhji2nVAeh3POwt1e6qoGrsgnMJPLd1PakYPNsTEKg9eMXER9OcDR90k6856IUrlaNxGNwuAgvZsXcz2DhHTTI3i4G9PAnMM59Kna2FOL6_SyaLxSDVaUPguYOQ8F_Oz6DQXOJQUfTQyt_guUJxsdnAVcWXIYEyRE-g1zv0AZII36M-tT9HsDJO3IjO2vZrDlUVG9w1pPdDKZZwccw0OwExn2Cj3bdcwzAHtSENApx-UhS')` }}></div>
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors"></div>
                <div className="absolute bottom-0 left-0 p-10">
                  <h3 className="text-3xl font-bold text-white">Producción Técnica</h3>
                  <p className="text-gray-200 text-base mt-2">Iluminación arquitectónica y sonido HI-FI.</p>
                </div>
              </div>
              <div onClick={() => navigate('/services/bar')} className="group bg-gradient-to-r from-[#2a0e5b] to-primary rounded-[2rem] p-10 flex items-center justify-between cursor-pointer hover:shadow-lg hover:shadow-primary/20 transition-all border border-white/10 hover:-translate-y-1">
                <div>
                  <h3 className="text-3xl font-bold text-white">Barra Libre Premium</h3>
                  <p className="text-white/80 text-base mt-2">Mixología de autor y licores importados.</p>
                </div>
                <span className="size-14 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">local_bar</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Client Stories (Modern Carousel) */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8 px-2">
            <h2 className="text-3xl font-bold text-white">Experiencias Recientes</h2>
            <button className="text-gold text-sm font-bold uppercase tracking-wider hover:text-white transition-colors">Ver todas</button>
          </div>
          <Carousel className="px-0">
            {[1, 2, 3].map((item) => (
              <div key={item} className="snap-center shrink-0 w-[300px] md:w-[400px] bg-[#1a1625] rounded-3xl border border-white/5 p-8 flex flex-col justify-between hover:border-gold/30 transition-colors shadow-xl">
                <div>
                  <div className="flex text-gold mb-4">
                    {[1, 2, 3, 4, 5].map(star => <span key={star} className="material-symbols-outlined text-lg fill-current">star</span>)}
                  </div>
                  <p className="text-gray-300 italic text-base leading-relaxed mb-6 font-light">
                    "Absolutamente impecable. El equipo de Oxy Salon cuidó cada detalle, permitiéndonos disfrutar nuestra boda sin preocupaciones."
                  </p>
                </div>
                <div className="flex items-center gap-4 border-t border-white/5 pt-6">
                  <div className="size-12 rounded-full bg-gray-600 border border-white/20"></div>
                  <div>
                    <p className="text-white font-bold text-base">Carla & Jose</p>
                    <p className="text-gray-500 text-xs uppercase tracking-wider">Boda, Nov 2023</p>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </div>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-background-dark/90 backdrop-blur-xl border-t border-white/10 z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="hidden md:block">
            <p className="text-white font-bold text-lg">¿Listo para crear magia?</p>
            <p className="text-gray-400 text-sm">Agenda una visita hoy mismo.</p>
          </div>
          <button
            onClick={() => navigate('/booking')}
            className="w-full md:w-auto px-10 bg-white text-black font-bold h-14 rounded-full shadow-lg hover:bg-gold hover:scale-105 transition-all flex items-center justify-center gap-3"
          >
            <span>Consultar Disponibilidad</span>
            <span className="material-symbols-outlined text-[24px]">calendar_today</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Services;