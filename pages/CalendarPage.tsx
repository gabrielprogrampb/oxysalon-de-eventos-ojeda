import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from '../components/Calendar';
import type { CalendarEvent } from '../types';
import { listPublicCalendar } from '../src/lib/store';
import { SITE } from '../src/config/site';

const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await listPublicCalendar();
        if (active) setEvents(data);
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

  return (
    <div className="min-h-screen bg-background-dark font-display text-white relative flex flex-col overflow-x-hidden">
      <div className="relative w-full h-[50vh] min-h-[400px] flex items-end">
        <div
          className="absolute inset-0 parallax-bg"
          style={{ backgroundImage: `url('/images/oxy/img-928e542805f9.webp')` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/60 to-black/30"></div>

        <div className="absolute top-0 w-full p-6 flex justify-between items-center z-50">
          <button
            onClick={() => navigate('/')}
            className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
            aria-label="Volver al inicio"
          >
            <span className="material-symbols-outlined text-white">arrow_back</span>
          </button>
          <button
            onClick={() => navigate('/booking')}
            className="px-6 py-2 bg-gold text-black font-bold rounded-full shadow-lg shadow-gold/20 hover:scale-105 transition-transform"
          >
            Reservar fecha
          </button>
        </div>

        <div className="relative z-10 px-6 pb-16 max-w-7xl mx-auto w-full animate-fade-in-up">
          <span className="text-gold text-xs font-bold uppercase tracking-widest mb-4 block">
            Agenda {new Date().getFullYear()} - {new Date().getFullYear() + 1}
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-none tracking-tight mb-4">
            Disponibilidad <br /> de{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500">
              Fechas
            </span>
          </h1>
          <p className="text-gray-300 text-lg max-w-xl font-light">
            Consulta nuestros días libres y asegura tu celebración con anticipación. Los días marcados en
            rojo ya están reservados.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 md:px-6 py-12 relative z-10 -mt-10">
        <div className="bg-[#1a1625] border border-gold/30 rounded-3xl p-8 mb-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-[80px]"></div>

          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
              <span className="material-symbols-outlined text-3xl">schedule</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Horario de atención y eventos</h2>
              <p className="text-gray-400 text-sm">
                Estamos disponibles para realizar tu evento en estos bloques:
              </p>
            </div>
          </div>

          <div className="text-center md:text-right relative z-10">
            <p className="text-gold font-bold text-lg uppercase tracking-wider">Lunes - Domingo</p>
            <p className="text-2xl md:text-3xl font-extrabold text-white">
              9:00 AM <span className="text-gray-600 text-xl mx-1">-</span> 12:00 AM
            </p>
            <p className="text-xs text-gray-500 mt-1">{SITE.city}, {SITE.state}</p>
          </div>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-[2rem] p-4 md:p-8 backdrop-blur-xl">
          {loading ? (
            <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
              <span className="material-symbols-outlined animate-spin text-3xl text-gold">
                progress_activity
              </span>
              Consultando agenda…
            </div>
          ) : (
            <Calendar events={events} />
          )}

          <div className="flex flex-wrap gap-6 mt-8 justify-center">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-900/40 border border-green-500/40"></span>
              <span className="text-sm text-gray-400 uppercase font-bold">Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
              <span className="text-sm text-gray-400 uppercase font-bold">Ocupado</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500/70"></span>
              <span className="text-sm text-gray-400 uppercase font-bold">Pre-reserva</span>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-gray-400 mb-4">
            ¿Ya tienes tu fecha? Cuéntanos los detalles y te enviamos la cotización.
          </p>
          <button
            onClick={() => navigate('/booking')}
            className="bg-white text-black font-bold px-8 py-4 rounded-full hover:bg-gold transition-colors"
          >
            Solicitar cotización
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
