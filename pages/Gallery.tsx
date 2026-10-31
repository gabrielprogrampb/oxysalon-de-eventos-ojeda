import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GalleryItem } from '../types';
import { AnimateOnScroll } from '../hooks/useScrollAnimation';
import { listGallery, likeGalleryItem } from '../src/lib/store';
import { SPACES } from '../constants';

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
      role="button"
      tabIndex={0}
      aria-label={
        (item.photos?.length ?? 0) > 1
          ? `Ver ${item.photos?.length} fotos de ${item.title || 'la galería'}`
          : `Ver ${item.title || 'la imagen'}`
      }
      className="relative w-full break-inside-avoid mb-3 rounded-lg overflow-hidden group cursor-zoom-in bg-gray-100 dark:bg-white/5 shadow-sm focus-ring"
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
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
            {(item.photos?.length ?? 0) > 1 && ` · ${item.photos?.length} fotos`}
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

// Visor con carrusel: un tema puede tener varias fotos, cada una con su
// propio título, descripción y enlace.
const Lightbox: React.FC<{ item: GalleryItem | null; onClose: () => void }> = ({ item, onClose }) => {
  const [index, setIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const photos = item?.photos?.length
    ? item.photos
    : item
      ? [{ id: 0, itemId: item.id, image: item.image, title: item.title, sortOrder: 0 }]
      : [];
  const total = photos.length;

  // Al abrir otro tema se vuelve a la primera foto.
  useEffect(() => {
    setIndex(0);
    setIsZoomed(false);
  }, [item?.id]);

  // Teclado: flechas para navegar, Escape para cerrar.
  useEffect(() => {
    if (!item || total === 0) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') setIndex((i) => (i + 1) % total);
      if (event.key === 'ArrowLeft') setIndex((i) => (i - 1 + total) % total);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [item, total, onClose]);

  if (!item || total === 0) return null;

  const safeIndex = Math.min(index, total - 1);
  const photo = photos[safeIndex];
  const go = (direction: -1 | 1) => {
    setIsZoomed(false);
    setIndex((i) => (i + direction + total) % total);
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center animate-fade-in-up"
      role="dialog"
      aria-modal="true"
      aria-label={item.title ? `Galería: ${item.title}` : 'Galería de imágenes'}
      onClick={onClose}
    >
      {/* Contador */}
      {total > 1 && (
        <div className="absolute top-6 left-6 z-50 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
          {safeIndex + 1} / {total}
        </div>
      )}

      <button
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-50"
      >
        <span className="material-symbols-outlined text-3xl">close</span>
      </button>

      {/* Flechas */}
      {total > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); go(-1); }}
            aria-label="Foto anterior"
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-50 flex size-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/25 transition"
          >
            <span className="material-symbols-outlined text-3xl">chevron_left</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); go(1); }}
            aria-label="Foto siguiente"
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-50 flex size-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/25 transition"
          >
            <span className="material-symbols-outlined text-3xl">chevron_right</span>
          </button>
        </>
      )}

      {/* Imagen */}
      <div
        className="relative w-full h-full p-4 md:p-16 flex items-center justify-center overflow-hidden"
        onClick={(e) => { e.stopPropagation(); setIsZoomed((z) => !z); }}
      >
        <img
          key={photo.image}
          src={photo.image}
          alt={photo.alt || photo.title || item.title || 'Imagen de la galería'}
          className={`max-w-full max-h-full object-contain transition-all duration-300 animate-fade-in-up cursor-zoom-in ${
            isZoomed ? 'scale-[1.8] cursor-zoom-out' : 'scale-100'
          }`}
        />
      </div>

      {/* Pie: título, descripción y enlace de la foto */}
      {!isZoomed && (
        <div
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent px-6 pb-6 pt-16"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mx-auto max-w-3xl text-center">
            {item.category && (
              <p className="text-gold text-[11px] font-bold uppercase tracking-widest">{item.category}</p>
            )}
            <h3 className="mt-1 text-xl md:text-2xl font-bold text-white">
              {photo.title || item.title || 'Galería'}
            </h3>
            {photo.description && (
              <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-gray-300">
                {photo.description}
              </p>
            )}
            {photo.link && (
              <a
                href={photo.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-black hover:bg-gold transition-colors"
              >
                Ver más
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              </a>
            )}

            {/* Puntos */}
            {total > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                {photos.map((p, i) => (
                  <button
                    key={p.id || p.image}
                    onClick={() => { setIsZoomed(false); setIndex(i); }}
                    aria-label={`Ir a la foto ${i + 1}`}
                    aria-current={i === safeIndex}
                    className={`h-2 rounded-full transition-all ${
                      i === safeIndex ? 'w-6 bg-gold' : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Gallery: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('Todo');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Carga desde la base de datos (o contenido base si aún no hay fotos subidas)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await listGallery(true);
        if (active) setItems(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Likes: se guarda qué fotos marcó ESTE visitante para poder deshacer
  const [userLikedIds, setUserLikedIds] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem('user_liked_ids');
      return saved ? new Set<number>(JSON.parse(saved)) : new Set<number>();
    } catch {
      return new Set<number>();
    }
  });

  const handleToggleLike = async (id: number) => {
    const isLiked = userLikedIds.has(id);
    const nextLiked = new Set(userLikedIds);

    if (isLiked) {
      nextLiked.delete(id);
      // No se resta en la base (evita manipulación): solo se actualiza la vista
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, likes: Math.max(0, (item.likes || 0) - 1) } : item
        )
      );
    } else {
      nextLiked.add(id);
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, likes: (item.likes || 0) + 1 } : item))
      );
      try {
        await likeGalleryItem(id);
      } catch (err) {
        console.error(err);
        // Si el servidor rechaza, se revierte para no mostrar un número falso
        setItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, likes: Math.max(0, (item.likes || 0) - 1) } : item
          )
        );
        nextLiked.delete(id);
      }
    }

    setUserLikedIds(nextLiked);
    try {
      localStorage.setItem('user_liked_ids', JSON.stringify(Array.from(nextLiked)));
    } catch {
      /* almacenamiento no disponible */
    }
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
          style={{ backgroundImage: `url('/images/oxy/img-903bf12d1b34.webp')` }}
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
              <span className="block text-xl md:text-2xl font-bold text-white">
                {items.reduce((sum, i) => sum + (i.photos?.length || 1), 0)}
              </span>
              <span className="text-[10px] md:text-xs uppercase tracking-wider opacity-60">Fotos</span>
            </div>
            <div className="text-center">
              <span className="block text-xl md:text-2xl font-bold text-white">{SPACES.length}</span>
              <span className="text-[10px] md:text-xs uppercase tracking-wider opacity-60">Espacios</span>
            </div>
            <div className="text-center">
              <span className="block text-xl md:text-2xl font-bold text-white">
                {new Set(items.map((i) => i.category).filter(Boolean)).size}
              </span>
              <span className="text-[10px] md:text-xs uppercase tracking-wider opacity-60">Categorías</span>
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
              <h2 className="text-xl md:text-2xl font-bold text-white mb-1">¿Te inspiraste con lo que ves?</h2>
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
              <h2 className="text-xl font-bold text-white">Sin resultados</h2>
              <p className="text-gray-400 mt-2">No hay imágenes disponibles en la categoría <span className="text-gold font-bold">"{activeFilter}"</span>.</p>
              <button onClick={() => setActiveFilter('Todo')} className="mt-6 text-sm font-bold text-gold hover:underline">Ver todas las imágenes</button>
            </div>
          )}
        </div>
      </div>

      {/* Cargando */}
      {loading && (
        <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
          <span className="material-symbols-outlined animate-spin text-3xl text-gold">progress_activity</span>
          Cargando galería…
        </div>
      )}

    </div>
  );
};

export default Gallery;