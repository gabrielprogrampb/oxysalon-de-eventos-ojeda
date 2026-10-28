import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SITE, hasEmail, hasPhone, mailLink, socialLinks, telLink } from '../src/config/site';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const socials = socialLinks();

  const footerLinks = [
    { label: 'Inicio', path: '/' },
    { label: 'Nuestros espacios', path: '/spaces' },
    { label: 'Servicios', path: '/services' },
    { label: 'Galería', path: '/gallery' },
    { label: 'Agenda y disponibilidad', path: '/calendar' },
    { label: 'Reservar', path: '/booking' },
  ];

  return (
    <footer className="bg-[#050408] pt-20 pb-12 px-6 border-t border-white/5 w-full relative overflow-hidden z-20">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 text-center md:text-left">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold tracking-tight text-white mb-6">
              OXYSALON <span className="text-gold font-light">DE EVENTOS OJEDA</span>
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-sm mx-auto md:mx-0">
              Redefiniendo el arte de celebrar. Creamos escenarios donde la elegancia y la perfección se
              encuentran.
            </p>
            {socials.length > 0 && (
              <div className="flex gap-3 justify-center md:justify-start">
                {socials.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white text-xs font-bold hover:bg-gold hover:text-black hover:border-gold transition-all"
                  >
                    {social.name}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-2">Explora</h3>
            <div className="flex flex-col gap-2">
              {footerLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="text-gray-400 text-sm hover:text-gold transition-colors text-left"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-2">Contacto</h3>
            <p className="text-gray-400 text-sm">
              {SITE.city}, {SITE.state}
            </p>
            {hasPhone() && telLink() && (
              <a href={telLink()!} className="block text-gray-400 text-sm hover:text-gold transition-colors">
                {SITE.phone}
              </a>
            )}
            {hasEmail() && mailLink() && (
              <a
                href={mailLink()!}
                className="block text-gray-400 text-sm hover:text-gold transition-colors break-all"
              >
                {SITE.email}
              </a>
            )}
            <a
              href={SITE.mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-gold text-xs font-bold uppercase tracking-wider hover:underline"
            >
              <span className="material-symbols-outlined text-sm">location_on</span> Cómo llegar
            </a>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} Oxysalon de Eventos Ojeda. Todos los derechos reservados.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="text-gray-700 hover:text-gray-500 text-[11px] transition-colors"
          >
            Acceso administrativo
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
