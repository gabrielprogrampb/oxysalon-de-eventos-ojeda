import React, { useRef, useState, useEffect } from 'react';

interface CarouselProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  fadeEdges?: boolean;
  autoPlay?: boolean; // New prop
  interval?: number; // New prop
}

const Carousel: React.FC<CarouselProps> = ({ 
  children, 
  className = '', 
  containerClassName = '',
  fadeEdges = true,
  autoPlay = false,
  interval = 3000
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 10);
      setShowRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [children]);

  // Auto Play Logic
  useEffect(() => {
    if (!autoPlay || isPaused) return;

    const timer = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        // If we reached the end, scroll back to start, else scroll next
        if (Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 10) {
           scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
           scroll('right');
        }
      }
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, isPaused, interval]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      let scrollAmount = container.clientWidth * 0.75; 
      
      const firstCard = container.querySelector('.snap-center') as HTMLElement || container.firstElementChild as HTMLElement;
      if (firstCard) {
         const style = window.getComputedStyle(container);
         const gap = parseFloat(style.columnGap) || 16;
         scrollAmount = firstCard.offsetWidth + gap;
      }

      const directionMultiplier = direction === 'left' ? -1 : 1;
      
      container.scrollBy({ 
        left: scrollAmount * directionMultiplier, 
        behavior: 'smooth' 
      });
    }
  };

  return (
    <div 
      className={`relative group w-full ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Navigation Buttons */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-24 z-20 flex items-center justify-center transition-opacity duration-300">
        <button 
          onClick={() => scroll('left')}
          className={`pointer-events-auto w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-300 shadow-xl hover:scale-110 active:scale-95 ${
            showLeft ? 'opacity-100 translate-x-4' : 'opacity-0 -translate-x-full'
          } hidden md:flex`}
          aria-label="Scroll left"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
      </div>

      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-24 z-20 flex items-center justify-center transition-opacity duration-300">
        <button 
          onClick={() => scroll('right')}
          className={`pointer-events-auto w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-300 shadow-xl hover:scale-110 active:scale-95 ${
            showRight ? 'opacity-100 -translate-x-4' : 'opacity-0 translate-x-full'
          } hidden md:flex`}
          aria-label="Scroll right"
        >
          <span className="material-symbols-outlined text-2xl">arrow_forward</span>
        </button>
      </div>

      {/* Scroll Container */}
      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        className={`flex overflow-x-auto gap-4 md:gap-6 px-6 md:px-12 pb-8 pt-4 no-scrollbar snap-x snap-mandatory scroll-smooth w-full ${containerClassName}`}
        style={fadeEdges ? {
           maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
           WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)'
        } : undefined}
      >
        {children}
      </div>
    </div>
  );
};

export default Carousel;