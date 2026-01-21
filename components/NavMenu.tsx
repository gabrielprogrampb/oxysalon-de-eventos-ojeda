import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const NavMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Inicio', path: '/' },
    { label: 'Espacios', path: '/spaces' },
    { label: 'Galería', path: '/gallery' },
    { label: 'Servicios', path: '/services' },
    { label: 'Agenda & Disponibilidad', path: '/calendar' }, // Added Calendar
    { label: 'Reservar', path: '/booking' },
    { label: 'Administración', path: '/dashboard' },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Menu Trigger (Visible if no specific header button is used in the view, or as a global override) */}
      <div className="fixed bottom-6 left-6 z-[60]">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center w-12 h-12 bg-black/80 text-gold rounded-full shadow-lg border border-gold/30 hover:scale-110 transition-transform backdrop-blur-md"
        >
          <span className="material-symbols-outlined">{isOpen ? 'close' : 'menu_open'}</span>
        </button>
      </div>

      {/* Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[55] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center animate-fade-in-up">
           <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-8 text-center px-4">
              OXYSALON <span className="text-gold font-light block text-lg md:text-xl md:inline">DE EVENTOS OJEDA</span>
          </h2>
          <div className="flex flex-col gap-6 text-center">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`text-2xl font-display font-bold transition-colors ${
                  location.pathname === item.path 
                    ? 'text-primary' 
                    : 'text-white hover:text-gold'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default NavMenu;