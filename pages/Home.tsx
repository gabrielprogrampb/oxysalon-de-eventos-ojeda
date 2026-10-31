import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SPACES, TESTIMONIALS } from '../constants';
import Carousel from '../components/Carousel';
import { AnimateOnScroll } from '../hooks/useScrollAnimation';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col w-full bg-background-dark text-white font-display overflow-x-hidden">
      {/* Ambient Background Elements (Fills empty space globally) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-noise opacity-30"></div>
        <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px]"></div>
      </div>

      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 transition-all duration-300 glass-panel border-b border-white/5">
        <div className="w-full flex items-center justify-between px-6 py-3 md:py-4">
          <div className="w-[88px] hidden md:block"></div>

          <Link
            to="/"
            className="text-xl md:text-2xl font-bold tracking-tight text-center flex-1 text-white hover:text-gold transition-colors focus-ring rounded-lg"
          >
            OXYSALON <span className="text-gold font-light hidden sm:inline">DE EVENTOS</span>
          </Link>

          <div className="flex justify-end w-[88px]">
            <button
              onClick={() => navigate('/booking')}
              className="text-sm md:text-base font-bold tracking-wide text-gold border border-gold/30 bg-gold/10 px-4 py-1.5 md:px-6 md:py-2 rounded hover:bg-gold hover:text-black transition-all whitespace-nowrap"
            >
              RESERVAR
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pb-24 w-full relative z-10">
        {/* HeroSection with Parallax */}
        <section className="relative h-[95vh] w-full flex items-end justify-center pb-16 md:pb-24 overflow-hidden">
          <div
            className="absolute inset-0 parallax-bg z-0 animate-pan-zoom"
            style={{ backgroundImage: `url("/images/oxy/img-e59622203dde.webp")` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background-dark z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent z-10"></div>

          <div className="relative z-20 px-6 w-full text-center flex flex-col gap-6 items-center animate-fade-in-up max-w-5xl mx-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="h-px w-12 bg-gold/50"></div>
                <span className="text-gold text-sm font-bold uppercase tracking-[0.2em]">Experiencias Extraordinarias</span>
                <div className="h-px w-12 bg-gold/50"></div>
              </div>
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold leading-none tracking-tighter text-white drop-shadow-2xl">
                Elevamos Tu <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">Celebración</span>
              </h1>
              <p className="text-gray-300 text-lg md:text-xl font-light leading-relaxed max-w-xl mx-auto">
                Descubre espacios donde la arquitectura se encuentra con la emoción. El escenario perfecto para tu legado.
              </p>
            </div>
            <button
              onClick={() => navigate('/booking')}
              className="mt-6 group relative px-10 py-5 bg-white text-black font-bold text-lg rounded-full overflow-hidden hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                RESERVA TU FECHA
                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
              </span>
              <div className="absolute inset-0 bg-gold transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
            </button>
          </div>
        </section>

        {/* Spaces Section - Overlapping Hero for cohesion */}
        <section className="relative w-full overflow-hidden px-4 md:px-0 -mt-10 md:-mt-20 z-20">
          <div className="max-w-7xl mx-auto">
            <AnimateOnScroll animation="slide-up">
              <div className="px-4 md:px-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white">Nuestros Espacios</h2>
                </div>
                <button onClick={() => navigate('/spaces')} className="text-gold text-sm font-bold uppercase tracking-wider flex items-center gap-2 hover:gap-3 transition-all">
                  Explorar todo <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </AnimateOnScroll>

            <Carousel className="w-full" autoPlay={true} interval={4000}>
              {SPACES.map((space) => (
                <div key={space.id} onClick={() => navigate('/spaces')} className="snap-center shrink-0 w-[85vw] md:w-[450px] flex flex-col group cursor-pointer transition-transform duration-300 hover:-translate-y-2">
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110 group-hover:animate-pan-left"
                      style={{ backgroundImage: `url("${space.image}")` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>

                    <div className="absolute top-4 left-4">
                      <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                        {space.tag}
                      </span>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                      <h3 className="text-white text-2xl md:text-3xl font-bold mb-2 leading-none">{space.name}</h3>
                      <p className="text-gray-300 text-sm mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-gold text-sm">square_foot</span> {space.sqft} ft²
                        <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                        <span className="material-symbols-outlined text-gold text-sm">groups</span> {space.guests} pax
                      </p>
                      <div className="h-px w-full bg-white/20 group-hover:bg-gold transition-colors"></div>
                    </div>
                  </div>
                </div>
              ))}
            </Carousel>
          </div>
        </section>

        {/* Services Section */}
        <section className="mt-24 px-4 w-full relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-primary/5 blur-[150px] rounded-full pointer-events-none"></div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
              <AnimateOnScroll animation="slide-left">
                <div>
                  <span className="text-gold text-xs font-bold uppercase tracking-widest mb-3 block">Servicios Integrales</span>
                  <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">Todo lo que necesitas <br />para brillar.</h2>
                  <p className="text-gray-400 text-lg leading-relaxed mb-8">
                    No solo alquilamos espacios. Proveemos una plataforma completa de servicios de lujo para asegurar que tu evento sea impecable de principio a fin.
                  </p>
                  <button onClick={() => navigate('/services')} className="px-8 py-3 rounded-full border border-white/20 hover:bg-white hover:text-black transition-all font-bold">
                    Ver todos los servicios
                  </button>
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll animation="slide-right" delay={200}>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      icon: 'diamond',
                      label: 'Decoración',
                      image: '/images/oxy/img-31000bf958a9.webp'
                    },
                    {
                      icon: 'restaurant_menu',
                      label: 'Gastronomía',
                      image: '/images/oxy/img-369b9401311e.webp'
                    },
                    {
                      icon: 'music_note',
                      label: 'Sonido',
                      image: '/images/oxy/img-f54ceb1e4977.webp'
                    },
                    {
                      icon: 'local_bar',
                      label: 'Bar',
                      image: '/images/oxy/img-e44d09aa75df.webp'
                    }
                  ].map((item, idx) => (
                    <div key={idx} onClick={() => navigate('/services')} className="aspect-square rounded-3xl overflow-hidden relative group cursor-pointer border border-white/5 shadow-lg">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                        style={{ backgroundImage: `url('${item.image}')` }}
                      ></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20 group-hover:bg-black/40 transition-colors"></div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 p-4">
                        <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-gold group-hover:text-black group-hover:scale-110 transition-all duration-300">
                          <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                        </div>
                        <span className="font-bold text-white text-lg tracking-wide group-hover:-translate-y-1 transition-transform duration-300">{item.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* Testimonial Slider */}
        <section className="mt-24 mb-12 relative w-full py-20 bg-surface-dark/30 border-y border-white/5 backdrop-blur-sm">
          <AnimateOnScroll animation="slide-up">
            <div className="max-w-7xl mx-auto px-6 mb-12 flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-gold text-5xl mb-4 opacity-50">format_quote</span>
              <h2 className="text-white text-3xl md:text-4xl font-extrabold mb-4">Lo que dicen nuestros clientes</h2>
              <p className="text-gray-400 max-w-xl">La satisfacción de quienes confían en nosotros es nuestra mayor credencial.</p>
            </div>
          </AnimateOnScroll>

          <Carousel className="w-full" autoPlay={true} interval={5000}>
            {TESTIMONIALS.map((testimonial) => (
              <div key={testimonial.id} className="snap-center shrink-0 w-[90vw] md:w-[600px] px-2 pb-4">
                <div className="bg-[#151120] border border-white/10 rounded-3xl p-8 md:p-12 h-full relative flex flex-col gap-6 shadow-2xl hover:border-gold/30 transition-colors">
                  <div className="flex gap-1 text-gold">
                    {[1, 2, 3, 4, 5].map(i => <span key={i} className="material-symbols-outlined text-[20px] fill-current">star</span>)}
                  </div>
                  <p className="text-gray-200 text-lg md:text-xl leading-relaxed italic font-light">
                    "{testimonial.text}"
                  </p>
                  <div className="mt-auto flex items-center gap-4 pt-6 border-t border-white/5">
                    <div
                      className="w-14 h-14 rounded-full bg-gray-700 bg-cover bg-center shrink-0 border-2 border-white/10"
                      style={{ backgroundImage: `url("${testimonial.image}")` }}
                    ></div>
                    <div>
                      <p className="text-white font-bold text-lg">{testimonial.author}</p>
                      <p className="text-gold/80 text-xs font-bold uppercase tracking-wide">{testimonial.event}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </section>
      </main>
    </div>
  );
};

export default Home;