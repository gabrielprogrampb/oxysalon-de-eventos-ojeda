import React, { useState } from 'react';
import { CalendarEvent } from '../types';

interface CalendarProps {
  events: CalendarEvent[];
  onDateClick?: (date: string) => void;
  isAdmin?: boolean;
}

const Calendar: React.FC<CalendarProps> = ({ events, onDateClick, isAdmin = false }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month); // 0 = Sunday

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Helper to format date as YYYY-MM-DD for comparison
  const formatDate = (y: number, m: number, d: number) => {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  const getEventForDate = (dateStr: string) => events.find(e => e.date === dateStr);

  const renderDays = () => {
    const days = [];
    const blanks = firstDay;

    // Blank cells for previous month
    for (let i = 0; i < blanks; i++) {
      days.push(<div key={`blank-${i}`} className="h-24 md:h-32 bg-white/5 opacity-30 rounded-xl border border-white/5"></div>);
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = formatDate(year, month, d);
      const event = getEventForDate(dateStr);
      const isPast = new Date(dateStr) < new Date(new Date().setHours(0,0,0,0));
      
      let statusColor = "bg-white/5 hover:bg-white/10";
      let statusText = "";
      
      if (event?.status === 'booked') {
        statusColor = "bg-red-900/40 border-red-500/30 hover:bg-red-900/60";
        statusText = "Ocupado";
      } else if (event?.status === 'maintenance') {
        statusColor = "bg-gray-700/40 border-gray-500/30";
        statusText = "Mantenimiento";
      } else if (!isPast) {
         statusColor = "bg-green-900/20 border-green-500/20 hover:bg-green-900/40 cursor-pointer";
         statusText = "Disponible";
      }

      days.push(
        <div 
          key={d} 
          onClick={() => onDateClick && onDateClick(dateStr)}
          className={`relative h-24 md:h-32 rounded-xl border border-white/10 p-2 transition-all duration-300 group flex flex-col justify-between ${statusColor} ${isAdmin ? 'cursor-pointer' : ''}`}
        >
          <div className="flex justify-between items-start">
             <span className={`text-lg font-bold ${event ? 'text-white' : 'text-gray-400'}`}>{d}</span>
             {event && (
                <span className={`w-3 h-3 rounded-full ${event.status === 'booked' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]' : 'bg-gray-400'}`}></span>
             )}
          </div>
          
          <div className="mt-auto">
             {event ? (
               <>
                 <span className={`text-[10px] uppercase font-bold tracking-wider block ${event.status === 'booked' ? 'text-red-300' : 'text-gray-300'}`}>
                    {event.title || statusText}
                 </span>
                 {event.timeStart && (
                    <span className="text-[10px] text-white/70 block mt-0.5 font-mono">
                       {event.timeStart} - {event.timeEnd}
                    </span>
                 )}
               </>
             ) : (
                !isPast && <span className="text-[10px] text-green-400/50 uppercase font-bold tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">Libre</span>
             )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-8 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
        <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <h2 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-widest">
          {months[month]} <span className="text-gold">{year}</span>
        </h2>
        <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-2 md:gap-4 mb-4 text-center">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className="text-gray-500 font-bold text-xs uppercase tracking-wider py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-2 md:gap-4">
        {renderDays()}
      </div>
    </div>
  );
};

export default Calendar;