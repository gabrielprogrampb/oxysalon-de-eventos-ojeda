import React from 'react';
import { useNavigate } from 'react-router-dom';

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

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const footerLinks = [
    { label: 'Inicio', path: '/' },
    { label: 'Nuestros Espacios', path: '/spaces' },
    { label: 'Servicios', path: '/services' },
    { label: 'Galería', path: '/gallery' },
    { label: 'Agenda & Disponibilidad', path: '/calendar' },
    { label: 'Reservar', path: '/booking' }
  ];

  return (
    <footer className="bg-[#050408] pt-20 pb-12 px-6 border-t border-white/5 w-full relative overflow-hidden z-20">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 text-center md:text-left">
          <div className="md:col-span-1">
            <h2 className="text-2xl font-bold tracking-tight text-white mb-6">
              OXYSALON <span className="text-gold font-light">DE EVENTOS OJEDA</span>
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Redefiniendo el arte de celebrar. Creamos escenarios donde la elegancia y la perfección se encuentran.
            </p>
            <div className="flex gap-4 justify-center md:justify-start">
              {SOCIAL_ICONS.map((social) => (
                <a
                  key={social.name}
                  href={social.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white hover:bg-gold hover:text-black hover:border-gold transition-all"
                  aria-label={social.name}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    {social.svg}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-1"></div>

          <div className="md:col-span-1 space-y-4">
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-2">Explora</h4>
            <div className="flex flex-col gap-2">
              {footerLinks.map(link => (
                <button
                  key={link.label}
                  onClick={() => navigate(link.path)}
                  className="text-gray-400 text-sm hover:text-gold transition-colors text-left"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-1 space-y-4">
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-2">Contacto</h4>
            <p className="text-gray-400 text-sm">Ciudad Ojeda, Zulia</p>
            <p className="text-gray-400 text-sm">+58 (412) 123-4567</p>
            <p className="text-gray-400 text-sm">concierge@oxyevents.com</p>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-xs">© 2026 OXYSALON. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;