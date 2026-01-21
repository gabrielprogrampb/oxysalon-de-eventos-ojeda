import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SPACES } from '../constants';
import { AnimateOnScroll } from '../hooks/useScrollAnimation';

// Componente SpaceCard con animaciones
const SpaceCard: React.FC<{
   space: typeof SPACES[0];
   index: number;
   handleBookSpace: (name: string) => void;
}> = ({ space, index, handleBookSpace }) => {
   // Alternar dirección visual
   const isReversed = index % 2 === 1;

   return (
      <div className={`flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-20 group`}>

         {/* Image Section con animación usando wrapper robusto */}
         <div className="w-full md:w-1/2 relative">
            <AnimateOnScroll animation="scale-in" className="w-full h-full">
               <div className={`aspect-[4/5] md:aspect-[3/4] rounded-[2rem] overflow-hidden relative shadow-2xl border border-white/5`}>
                  <div
                     className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                     style={{ backgroundImage: `url('${space.image}')` }}
                  ></div>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500"></div>

                  {/* Floating Badge */}
                  <div className="absolute top-6 left-6">
                     <span className="px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-xs font-bold uppercase tracking-wider text-white">
                        {space.tag}
                     </span>
                  </div>
               </div>
            </AnimateOnScroll>

            {/* Decorative Box behind */}
            <div className={`absolute -z-10 top-10 ${isReversed ? '-right-4' : '-left-4'} w-full h-full border border-white/10 rounded-[2rem] hidden md:block opacity-50`}></div>
         </div>

         {/* Text Content con animación slide */}
         <div className={`w-full md:w-1/2 space-y-8`}>
            <AnimateOnScroll animation={isReversed ? 'slide-left' : 'slide-right'}>
               <div>
                  <div className={`flex items-center gap-4 mb-4 text-gold`}>
                     <span className="w-12 h-px bg-gold"></span>
                     <span className="text-xs font-bold uppercase tracking-widest">0{index + 1}</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6">
                     {space.name}
                  </h2>
                  <p className="text-gray-300 text-lg leading-relaxed font-light">
                     {space.description || "Un espacio diseñado para superar expectativas, combinando elegancia atemporal con comodidades modernas."}
                  </p>
               </div>

               {/* Features Grid */}
               <div className="grid grid-cols-2 gap-y-6 gap-x-4 border-y border-white/10 py-8">
                  <div className="flex items-center gap-3">
                     <span className="material-symbols-outlined text-gold">groups</span>
                     <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Capacidad</p>
                        <p className="text-white font-medium">{space.guests} Personas</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <span className="material-symbols-outlined text-gold">square_foot</span>
                     <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Dimensiones</p>
                        <p className="text-white font-medium">{space.sqft || 'Consultar'} ft²</p>
                     </div>
                  </div>

                  {space.features && space.features.slice(0, 2).map((feature, i) => (
                     <div key={i} className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-gray-400">check_circle</span>
                        <p className="text-gray-300 text-sm">{feature}</p>
                     </div>
                  ))}
               </div>

               <div className="flex items-center gap-6">
                  <button
                     onClick={() => handleBookSpace(space.name)}
                     className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gold transition-all shadow-lg hover:shadow-gold/20 flex items-center gap-2 group/btn"
                  >
                     Reservar Este Espacio
                     <span className="material-symbols-outlined transition-transform group-hover/btn:translate-x-1 text-lg">arrow_forward</span>
                  </button>
               </div>
            </AnimateOnScroll>
         </div>

      </div>
   );
};

const Spaces: React.FC = () => {
   const navigate = useNavigate();

   // Updated navigation to send space name
   const handleBookSpace = (spaceName: string) => {
      navigate('/booking', { state: { selectedSpace: spaceName } });
   };

   return (
      <div className="bg-background-dark font-display antialiased text-white min-h-screen overflow-x-hidden relative pb-20">

         {/* Background Elements */}
         <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-0 left-0 w-full h-full bg-noise opacity-20"></div>
            <div className="absolute top-[10%] left-[20%] w-[800px] h-[800px] bg-primary/5 rounded-full blur-[180px]"></div>
            <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-gold/5 rounded-full blur-[150px]"></div>
         </div>

         {/* Header con animación de paneo suave en el fondo */}
         <div className="relative w-full h-[60vh] min-h-[500px] flex items-end overflow-hidden">
            <div
               className="absolute inset-0 parallax-bg animate-pan-zoom"
               style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuD-zXpaBHCbYl8UJYlqygJMGx3gdT0il88hrKtzg-GLoMC2MzD2xrDn1LtKR-LAp9xbNaoJ8V9tr5qNUCbn-Mm-vlzvP2z2Z_WiDqB0Rn8WHxjPTOGhjsmaUAxno-N-yV_yJ-vL5W9nvyyevRJhWSQQJQPtcccUrauG4n3FceztQ1t1obEC9jGnYMi5UN8mkwuBMY-r6XpiYoaMILz414HDQELdxa1p-DtD-ROkiIqFVCBsDprBwyuEz0B59AVAIZLjJExcQiYgv8dt')` }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/70 to-black/30"></div>

            {/* Navigation Bar */}
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
               <button
                  onClick={() => navigate('/')}
                  className="size-12 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-white"
               >
                  <span className="material-symbols-outlined text-2xl">arrow_back</span>
               </button>
               <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-white/80 hidden md:block">Colección de Espacios</h2>
               <button
                  onClick={() => navigate('/booking')}
                  className="px-6 py-2 bg-white text-black font-bold rounded-full shadow-lg hover:bg-gold transition-colors"
               >
                  Reservar
               </button>
            </div>

            {/* Hero Content */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-20 animate-fade-in-up">
               <span className="text-gold text-xs font-bold uppercase tracking-[0.3em] mb-4 block">Arquitectura & Diseño</span>
               <h1 className="text-5xl md:text-8xl font-extrabold text-white leading-none mb-6">
                  Nuestros <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Escenarios</span>
               </h1>
               <p className="text-gray-300 text-lg md:text-xl max-w-2xl font-light leading-relaxed">
                  Cada rincón de Oxysalon ha sido concebido para contar una historia diferente. Descubre el lienzo perfecto para tu próxima obra maestra.
               </p>
            </div>
         </div>

         {/* Spaces List - Zig Zag Layout con animaciones */}
         <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 flex flex-col gap-32">
            {SPACES.map((space, index) => (
               <SpaceCard
                  key={space.id}
                  space={space}
                  index={index}
                  handleBookSpace={handleBookSpace}
               />
            ))}
         </div>

         {/* Bottom CTA */}
         <div className="mt-20 max-w-5xl mx-auto px-6 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">¿No estás seguro de cuál elegir?</h3>
            <p className="text-gray-400 mb-8">Nuestro equipo de concierge puede asesorarte según el tipo y tamaño de tu evento.</p>
            <button
               onClick={() => navigate('/booking')}
               className="text-gold border-b border-gold pb-1 hover:text-white hover:border-white transition-colors font-bold text-lg"
            >
               Contactar Asesor
            </button>
         </div>

      </div>
   );
};

export default Spaces;