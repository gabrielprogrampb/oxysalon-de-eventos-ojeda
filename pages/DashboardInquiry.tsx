import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { INQUIRIES } from '../constants';
import { Inquiry } from '../types';

// Icons
const WhatsAppIcon = () => (<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.881-2.032-.981-.272-.102-.471-.152-.668.148-.199.299-.767.979-.941 1.178-.173.199-.346.225-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" /></svg>);
const TelegramIcon = () => (<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>);
const InstagramIcon = () => (<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M18,5A1,1 0 0,1 19,6A1,1 0 0,1 18,7A1,1 0 0,1 17,6A1,1 0 0,1 18,5Z" /></svg>);

const DashboardInquiry: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);

  useEffect(() => {
    const savedInquiries = JSON.parse(localStorage.getItem('inquiries') || JSON.stringify(INQUIRIES));
    const found = savedInquiries.find((i: Inquiry) => i.id === parseInt(id || '0'));
    setInquiry(found || null);
  }, [id]);

  const handleUpdate = (updates: Partial<Inquiry>) => {
    if (!inquiry) return;
    
    const updatedInquiry = { ...inquiry, ...updates };
    
    // Update color based on status if status changed
    if (updates.status) {
        let color = "bg-primary/20 text-primary";
        if (updates.status === 'Replied') color = "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300";
        if (updates.status === 'Booked') color = "bg-green-500/10 text-green-500";
        updatedInquiry.statusColor = color;
    }

    setInquiry(updatedInquiry);

    const savedInquiries: Inquiry[] = JSON.parse(localStorage.getItem('inquiries') || '[]');
    const newInquiries = savedInquiries.map(i => i.id === inquiry.id ? updatedInquiry : i);
    localStorage.setItem('inquiries', JSON.stringify(newInquiries));
  };

  const handleDelete = () => {
    if (window.confirm('¿Eliminar esta solicitud permanentemente?')) {
        const savedInquiries: Inquiry[] = JSON.parse(localStorage.getItem('inquiries') || '[]');
        const newInquiries = savedInquiries.filter(i => i.id !== inquiry?.id);
        localStorage.setItem('inquiries', JSON.stringify(newInquiries));
        navigate('/dashboard');
    }
  };

  if (!inquiry) return <div>Cargando...</div>;

  return (
    <div className="min-h-screen bg-background-dark font-display text-white relative flex flex-col items-center justify-center p-4">
        {/* Ambient Background */}
        <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-0 left-0 w-full h-full bg-noise opacity-30 mix-blend-soft-light"></div>
            <div className="absolute top-[-10%] right-[20%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[150px] animate-float"></div>
        </div>

        <div className="w-full max-w-3xl relative z-10 animate-fade-in-up">
            {/* Header Navigation */}
            <div className="flex items-center justify-between mb-8">
                <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </div>
                    <span className="font-bold text-sm uppercase tracking-wider">Volver al Panel</span>
                </button>
                <div className="flex gap-2">
                    <button onClick={handleDelete} className="w-10 h-10 rounded-full border border-red-500/30 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg hover:shadow-red-500/20" title="Eliminar">
                        <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                </div>
            </div>

            {/* Main Card */}
            <div className="bg-[#151120] border border-white/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden backdrop-blur-xl">
               
               {/* Hero Header of Card */}
               <div className="relative p-8 md:p-10 border-b border-white/5 bg-gradient-to-r from-gray-900 to-[#1a1625]">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
                  
                  <div className="flex flex-col md:flex-row gap-6 relative z-10 items-start md:items-center">
                      <div className={`h-20 w-20 rounded-3xl ${inquiry.avatar ? 'bg-cover' : inquiry.initialsColor + ' flex items-center justify-center'} border-2 border-white/10 shadow-xl shrink-0`} style={inquiry.avatar ? {backgroundImage: `url('${inquiry.avatar}')`} : {}}>
                          {!inquiry.avatar && <span className="text-3xl font-bold">{inquiry.initials}</span>}
                      </div>
                      <div className="flex-1">
                          <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-2">{inquiry.name}</h1>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                              {inquiry.company && <span className="text-gold font-bold uppercase tracking-wider">{inquiry.company}</span>}
                              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">event</span> {inquiry.time}</span>
                              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">mail</span> {inquiry.email || 'N/A'}</span>
                          </div>
                      </div>
                      <div className="flex bg-black/30 rounded-xl p-1 border border-white/5 self-start md:self-center">
                          {['New', 'Replied', 'Booked'].map(s => (
                              <button key={s} onClick={() => handleUpdate({status: s as any})} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${inquiry.status === s ? 'bg-white text-black shadow' : 'text-gray-500 hover:text-white'}`}>
                                  {s === 'New' ? 'Nuevo' : s === 'Booked' ? 'Reserva' : 'Resp'}
                              </button>
                          ))}
                      </div>
                  </div>
               </div>

               <div className="p-8 md:p-10 space-y-8">
                  
                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-black/20 rounded-2xl p-5 border border-white/5 flex flex-col">
                          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Valor de Cotización</span>
                          <div className="flex items-center gap-2 mt-auto">
                              <span className="text-gold font-bold text-lg">$</span>
                              <input 
                                type="number" 
                                value={inquiry.value || ''} 
                                onChange={(e) => handleUpdate({value: parseFloat(e.target.value) || 0})}
                                className="bg-transparent border-none text-2xl font-mono text-white font-bold p-0 focus:ring-0 w-full"
                                placeholder="0.00"
                              />
                          </div>
                      </div>
                      <div className="bg-black/20 rounded-2xl p-5 border border-white/5">
                          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2 block">Interés Principal</span>
                          <div className="flex items-center gap-3 mt-2 text-purple-300">
                              <span className="material-symbols-outlined text-2xl">domain</span>
                              <span className="text-lg font-bold text-white">{inquiry.spaceOfInterest || 'General'}</span>
                          </div>
                      </div>
                  </div>

                  {/* Message Body */}
                  <div>
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <span className="material-symbols-outlined text-gray-500">chat_bubble</span> Mensaje del Cliente
                      </h3>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 leading-relaxed text-gray-300 relative">
                          <span className="absolute top-4 left-4 text-6xl text-white/5 font-serif">“</span>
                          <p className="relative z-10 whitespace-pre-wrap">{inquiry.message}</p>
                      </div>
                  </div>

                  {/* Actions Area */}
                  <div>
                      <h3 className="text-lg font-bold text-white mb-4">Contactar Ahora</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         <a href={`tel:${inquiry.phone}`} className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-green-500/50 hover:bg-green-500/10 transition-all group ${!inquiry.phone ? 'opacity-50 pointer-events-none' : ''}`}>
                             <span className="material-symbols-outlined text-3xl text-gray-400 group-hover:text-green-500 transition-colors">call</span>
                             <span className="text-xs font-bold uppercase text-gray-500 group-hover:text-white">Llamar</span>
                         </a>
                         <button onClick={() => window.open(`https://wa.me/${inquiry.phone?.replace(/\D/g,'')}`, '_blank')} className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-[#25D366]/50 hover:bg-[#25D366]/10 transition-all group ${!inquiry.phone ? 'opacity-50 pointer-events-none' : ''}`}>
                             <div className="text-gray-400 group-hover:text-[#25D366] transition-colors"><WhatsAppIcon/></div>
                             <span className="text-xs font-bold uppercase text-gray-500 group-hover:text-white">WhatsApp</span>
                         </button>
                         <button onClick={() => window.open(`https://t.me/${inquiry.telegram?.replace('+','')}`, '_blank')} className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-[#0088cc]/50 hover:bg-[#0088cc]/10 transition-all group ${!inquiry.telegram ? 'opacity-50 pointer-events-none' : ''}`}>
                             <div className="text-gray-400 group-hover:text-[#0088cc] transition-colors"><TelegramIcon/></div>
                             <span className="text-xs font-bold uppercase text-gray-500 group-hover:text-white">Telegram</span>
                         </button>
                         <button onClick={() => window.open(`https://instagram.com/${inquiry.instagram?.replace('@','')}`, '_blank')} className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-pink-500/50 hover:bg-pink-500/10 transition-all group ${!inquiry.instagram ? 'opacity-50 pointer-events-none' : ''}`}>
                             <div className="text-gray-400 group-hover:text-pink-500 transition-colors"><InstagramIcon/></div>
                             <span className="text-xs font-bold uppercase text-gray-500 group-hover:text-white">Instagram</span>
                         </button>
                      </div>
                  </div>

               </div>
            </div>
        </div>
    </div>
  );
};

export default DashboardInquiry;