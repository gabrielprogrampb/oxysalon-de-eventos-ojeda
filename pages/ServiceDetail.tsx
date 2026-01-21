import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SERVICE_DETAILS } from '../constants';

interface ServiceDetailProps {
  type: 'decor' | 'tech' | 'bar';
}

const ServiceDetail: React.FC<ServiceDetailProps> = ({ type }) => {
  const navigate = useNavigate();
  const data = SERVICE_DETAILS[type];

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [type]);

  if (!data) return <div>Servicio no encontrado</div>;

  return (
    <div className="bg-background-dark font-display text-white min-h-screen overflow-x-hidden relative">
      
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 left-0 w-full h-full bg-noise opacity-30"></div>
         <div className="absolute top-[20%] right-[10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]"></div>
      </div>

      {/* Navigation (Floating) */}
      <div className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-50">
         <button 
            onClick={() => navigate('/services')}
            className="size-12 rounded-full bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-white group"
         >
            <span className="material-symbols-outlined text-2xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
         </button>
         <button 
           onClick={() => navigate('/booking')}
           className="px-6 py-2 bg-white text-black font-bold rounded-full shadow-lg hover:bg-gold transition-colors"
         >
           Cotizar Ahora
         </button>
      </div>

      {/* Hero Section */}
      <div className="relative h-screen w-full overflow-hidden">
        <div 
          className="absolute inset-0 parallax-bg transform scale-105"
          style={{ backgroundImage: `url('${data.heroImage}')` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/30 to-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-background-dark/80 via-transparent to-transparent"></div>

        <div className="absolute inset-0 flex items-center">
           <div className="max-w-7xl mx-auto px-6 w-full pt-20">
              <div className="max-w-3xl animate-fade-in-up">
                 <div className="flex items-center gap-4 mb-6">
                    <span className="h-px w-12 bg-gold"></span>
                    <span className="text-gold text-sm font-bold uppercase tracking-[0.2em]">{data.subtitle}</span>
                 </div>
                 <h1 className="text-6xl md:text-8xl font-extrabold leading-none tracking-tight mb-8">
                   {data.title.split(' ').map((word, i) => (
                     <span key={i} className="block">{word}</span>
                   ))}
                 </h1>
                 <p className="text-xl text-gray-200 leading-relaxed font-light max-w-xl border-l-2 border-white/20 pl-6">
                   {data.description}
                 </p>
              </div>
           </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
         
         {/* Features Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-32 items-center">
            <div>
               <h2 className="text-4xl font-bold mb-12">Detalles que marcan la diferencia</h2>
               <div className="grid grid-cols-1 gap-8">
                  {data.features.map((feature, idx) => (
                    <div key={idx} className="flex gap-6 group">
                       <div className="size-12 rounded-full border border-white/20 flex items-center justify-center shrink-0 group-hover:border-gold group-hover:text-gold transition-colors">
                          <span className="font-display font-bold text-lg">0{idx + 1}</span>
                       </div>
                       <div>
                          <h3 className="text-xl font-bold mb-2 group-hover:text-gold transition-colors">{feature.title}</h3>
                          <p className="text-gray-400">{feature.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
            
            {/* Featured Image / Video Placeholder */}
            <div className="relative h-[600px] rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 group">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                  style={{ backgroundImage: `url('${data.gallery[0]}')` }}
                ></div>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
            </div>
         </div>

         {/* Visual Gallery (Mosaic) */}
         <div className="mb-32">
            <h2 className="text-center text-3xl font-bold mb-12">Galería Visual</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[60vh] min-h-[500px]">
               <div className="md:col-span-2 h-full rounded-2xl overflow-hidden relative group">
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url('${data.gallery[1]}')` }}></div>
               </div>
               <div className="h-full rounded-2xl overflow-hidden relative group">
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url('${data.gallery[2]}')` }}></div>
               </div>
            </div>
         </div>

         {/* CTA Section */}
         <div className="bg-white/5 border border-white/10 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 to-purple-900/20 pointer-events-none"></div>
            <div className="relative z-10">
               <h2 className="text-4xl md:text-5xl font-extrabold mb-6">¿Listo para impresionar?</h2>
               <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">Incluye este servicio en tu paquete personalizado y lleva tu evento al siguiente nivel.</p>
               <button 
                 onClick={() => navigate('/booking')}
                 className="px-10 py-5 bg-white text-black font-bold text-lg rounded-full hover:bg-gold hover:scale-105 transition-all shadow-xl"
               >
                 Solicitar en mi Cotización
               </button>
            </div>
         </div>

      </div>

    </div>
  );
};

export default ServiceDetail;