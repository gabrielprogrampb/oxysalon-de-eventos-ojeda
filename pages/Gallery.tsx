import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GALLERY_ITEMS } from '../constants';
import { GalleryItem } from '../types';
import { AnimateOnScroll } from '../hooks/useScrollAnimation';

// Sub-component to handle individual image loading states
const ImageCard: React.FC<{ item: GalleryItem, isLiked: boolean, onClick: () => void, onToggleLike: () => void }> = ({ item, isLiked, onClick, onToggleLike }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Determine aspect ratio class for the skeleton based on item type
  const aspectRatioClass =
    item.type === 'tall' ? 'aspect-[3/4]' :
      item.type === 'wide' ? 'aspect-video' :
        'aspect-square';

  return (
    <div
      className="relative w-full break-inside-avoid mb-3 rounded-lg overflow-hidden group cursor-zoom-in bg-gray-100 dark:bg-white/5 shadow-sm"
      onClick={onClick}
    >
      {/* Skeleton / Loading State */}
      {!isLoaded && (
        <div className={`w-full ${aspectRatioClass} bg-gray-200 dark:bg-gray-800 animate-pulse flex items-center justify-center absolute inset-0 z-10`}>
          <span className="material-symbols-outlined text-gray-400 dark:text-gray-600 text-3xl animate-spin">
            progress_activity
          </span>
        </div>
      )}

      <img
        src={item.image}
        alt={item.title || "Imagen de Galería"}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-auto object-cover transition-all duration-700 ease-out group-hover:scale-110 ${isLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-sm scale-105'
          }`}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300"></div>

      {/* Content Overlay */}
      {item.title && (
        <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 pointer-events-none">
          <span className="text-white text-sm font-bold tracking-wide block">{item.title}</span>
          <span className="text-gold text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
            {item.category || 'Ver detalles'}
          </span>
        </div>
      )}

      {/* Like Button & Counter - Always visible now */}
      <div
        className="absolute top-3 right-3 z-20 flex flex-col items-center gap-1"
        onClick={(e) => { e.stopPropagation(); onToggleLike(); }}
      >
        <button
          className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg ${isLiked
            ? 'bg-red-500 text-white shadow-red-500/30'
            : 'bg-black/30 text-white border border-white/20 hover:bg-black/50'
            }`}
        >
          <span className={`material-symbols-outlined text-[18px] ${isLiked ? 'fill-current' : ''}`}>
            favorite
          </span>
        </button>
        {item.likes > 0 && (
          <span className="text-[10px] font-bold text-white bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/10 shadow">
            {item.likes}
          </span>
        )}
      </div>

      {item.featured && (
        <div className="absolute top-3 left-3 bg-gold/90 px-2 py-0.5 rounded text-[10px] font-bold text-black shadow-lg z-20 uppercase tracking-wider pointer-events-none">
          Destacado
        </div>
      )}
    </div>
  );
};

// Lightbox Component
const Lightbox: React.FC<{ item: GalleryItem | null, onClose: () => void }> = ({ item, onClose }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center animate-fade-in-up" onClick={onClose}>
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-50"
      >
        <span className="material-symbols-outlined text-3xl">close</span>
      </button>

      {/* Image Container */}
      <div
        className="relative w-full h-full p-4 flex items-center justify-center overflow-hidden"
        onClick={(e) => { e.stopPropagation(); setIsZoomed(!isZoomed); }}
      >
        <img
          src={item.image}
          alt={item.title}
          className={`max-w-full max-h-full object-contain transition-transform duration-300 cursor-zoom-in ${isZoomed ? 'scale-[2] cursor-zoom-out' : 'scale-100'}`}
          style={isZoomed ? { transformOrigin: 'center center' } : {}}
        />
      </div>

      {/* Caption */}
      {!isZoomed && (
        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black to-transparent pointer-events-none">
          <h3 className="text-2xl font-bold text-white">{item.title}</h3>
          <p className="text-gold text-sm font-bold uppercase tracking-wider">{item.category}</p>
        </div>
      )}
    </div>
  );
};

const Gallery: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('Todo');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  // Initialize Items from localStorage
  const [items, setItems] = useState<GalleryItem[]>(() => {
    const saved = localStorage.getItem('gallery_items');
    return saved ? JSON.parse(saved) : GALLERY_ITEMS;
  });

  // Track which items THIS user has liked (local browser session)
  const [userLikedIds, setUserLikedIds] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('user_liked_ids');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Sync to local storage when items change
  useEffect(() => {
    localStorage.setItem('gallery_items', JSON.stringify(items));
  }, [items]);

  const handleToggleLike = (id: number) => {
    const isLiked = userLikedIds.has(id);
    const newLikedIds = new Set(userLikedIds);

    // Update Item Count
    const updatedItems = items.map(item => {
      if (item.id === id) {
        // Safety check: don't go below 0
        const newCount = isLiked ? Math.max(0, (item.likes || 0) - 1) : (item.likes || 0) + 1;
        return { ...item, likes: newCount };
      }
      return item;
    });

    // Update User State
    if (isLiked) {
      newLikedIds.delete(id);
    } else {
      newLikedIds.add(id);
    }

    setItems(updatedItems);
    setUserLikedIds(newLikedIds);
    localStorage.setItem('user_liked_ids', JSON.stringify(Array.from(newLikedIds)));
  };

  const categories = ['Todo', 'Bodas', 'Corporativo', 'Decoración', 'Tecnología', 'Bebidas', 'Salones', 'Exterior'];

  // Filter Logic
  const filteredItems = activeFilter === 'Todo'
    ? items
    : items.filter(item => item.category === activeFilter);

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-background-dark text-white font-display overflow-x-hidden">

      {/* Lightbox Overlay */}
      <Lightbox item={selectedImage} onClose={() => setSelectedImage(null)} />

      {/* Immersive Hero Header with Parallax */}
      <div className="relative w-full h-[40vh] min-h-[300px] flex items-end">
        <div
          className="absolute inset-0 parallax-bg animate-pan-zoom"
          style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDwDlq3l0_l6efrFfNfvSlojfptK78NpCaP_5vYGjAYJ7ze85bgWUg0ETA8SwlqQ4YeaA40DjhgKN1pqJ2S_O83HIfgRiG2ZwavG2AyAQiH11WcCK_wt-Xtuba9zQ_bbUnrBlRsMHRpAnw_yc13YJtVEPSdH1511ATfRWriAiS2C7MRHpJGV3YiSN62Zk-UXeHG4jXQDaqrwsn_HdThmnAdyS56-tS2jQxWO7XHi388wDwwp4Srd1EWKk20UDvmuZMWgngA2rYS81eh')` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-background-dark/30 via-background-dark/60 to-background-dark"></div>

        {/* Navigation Bar (Absolute over Hero) */}
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-50">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center size-10 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <button
            onClick={() => navigate('/booking')}
            className="bg-white text-black text-sm font-bold py-2 px-5 rounded-full shadow-lg hover:bg-gold transition-colors"
          >
            Reservar
          </button>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-8 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-px w-8 bg-gold"></span>
              <span className="text-gold text-xs font-bold uppercase tracking-widest">Portafolio</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-none text-white">
              Nuestros <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Espacios</span>
            </h1>
          </div>
          <div className="flex gap-4 md:gap-8 text-sm md:text-base font-medium text-gray-300 w-full md:w-auto justify-between md:justify-start">
            <div className="text-center">
              <span className="block text-xl md:text-2xl font-bold text-white">{items.length}</span>
              <span className="text-[10px] md:text-xs uppercase tracking-wider opacity-60">Fotos</span>
            </div>
            <div className="text-center">
              <span className="block text-xl md:text-2xl font-bold text-white">15</span>
              <span className="text-[10px] md:text-xs uppercase tracking-wider opacity-60">Sedes</span>
            </div>
            <div className="text-center">
              <span className="block text-xl md:text-2xl font-bold text-white">4.9</span>
              <span className="text-[10px] md:text-xs uppercase tracking-wider opacity-60">Valoración</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-[1920px] mx-auto">

        {/* Filter Bar - Sticky with Mobile Optimization */}
        <div className="sticky top-0 z-40 bg-background-dark/95 backdrop-blur-xl border-b border-white/5 py-4">
          <div className="flex overflow-x-auto gap-3 px-6 pb-2 no-scrollbar w-full touch-pan-x">
            {categories.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-6 transition-all group border whitespace-nowrap active:scale-95 ${activeFilter === filter
                  ? 'bg-white text-black border-white shadow-lg shadow-white/10'
                  : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/30'
                  }`}
              >
                <p className="text-sm font-bold">{filter}</p>
              </button>
            ))}
            {/* Spacer to ensure last item is visible in scroll */}
            <div className="w-4 shrink-0"></div>
          </div>
        </div>

        {/* Promo Banner */}
        <AnimateOnScroll animation="slide-up">
          <div className="mx-4 md:mx-6 mt-6 mb-8 p-6 md:p-8 rounded-2xl bg-gradient-to-r from-primary to-purple-800 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10 text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-1">¿Te inspiraste con lo que ves?</h3>
              <p className="text-white/80 text-sm md:text-base">Transformamos estas ideas en tu realidad.</p>
            </div>
            <button
              onClick={() => navigate('/booking')}
              className="relative z-10 whitespace-nowrap bg-white text-primary font-bold py-3 px-6 rounded-xl hover:scale-105 transition-transform shadow-lg w-full md:w-auto"
            >
              Cotizar Mi Evento
            </button>
          </div>
        </AnimateOnScroll>

        {/* Dense Masonry Grid - Optimized for Mobile (1 col on small screens) */}
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 2xl:columns-5 gap-3 px-3 md:px-6 pb-20">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <ImageCard
                key={`${item.id}-${index}`}
                item={item}
                isLiked={userLikedIds.has(item.id)}
                onClick={() => setSelectedImage(item)}
                onToggleLike={() => handleToggleLike(item.id)}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-gray-600">image_not_supported</span>
              </div>
              <h3 className="text-xl font-bold text-white">Sin resultados</h3>
              <p className="text-gray-400 mt-2">No hay imágenes disponibles en la categoría <span className="text-gold font-bold">"{activeFilter}"</span>.</p>
              <button onClick={() => setActiveFilter('Todo')} className="mt-6 text-sm font-bold text-gold hover:underline">Ver todas las imágenes</button>
            </div>
          )}
        </div>
      </div>

      {/* Admin Floating Action Button (Simulated - Left aligned now to avoid overlap) */}
      <button
        onClick={() => navigate('/dashboard')}
        className="fixed bottom-6 left-6 w-12 h-12 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full flex items-center justify-center z-40 hover:bg-white hover:text-primary transition-colors shadow-xl"
        title="Panel Administrativo"
      >
        <span className="material-symbols-outlined text-xl">edit</span>
      </button>
    </div>
  );
};

export default Gallery;