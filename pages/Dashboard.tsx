import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CalendarEvent, GalleryItem, Inquiry, Transaction } from '../types';
import Calendar from '../components/Calendar';
import { useAuth } from '../src/lib/auth';
import {
  deleteCalendarEvent,
  deleteGalleryItem,
  deleteTransaction,
  getVisitCount,
  isDemo,
  listCalendarEvents,
  listGallery,
  listInquiries,
  listTransactions,
  upsertCalendarEvent,
} from '../src/lib/store';
import {
  STATUS_META,
  avatarColor,
  formatCurrency,
  formatDate,
  formatRelative,
  initials,
} from '../src/lib/format';

type Tab = 'overview' | 'gallery' | 'inquiries' | 'finance' | 'calendar';

const TRANS_CATEGORIES = ['General', 'Reservas', 'Eventos', 'Materiales', 'Mantenimiento', 'Personal'];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { signOut, email } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [siteVisits, setSiteVisits] = useState(0);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);

  const [transactionFilter, setTransactionFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [transCategoryFilter, setTransCategoryFilter] = useState<string>('all');

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [inq, gal, trx, cal, visits] = await Promise.all([
        listInquiries(),
        listGallery(),
        listTransactions(),
        listCalendarEvents(),
        getVisitCount(),
      ]);
      setInquiries(inq);
      setGalleryItems(gal);
      setTransactions(trx);
      setCalendarEvents(cal);
      setSiteVisits(visits);
    } catch (err) {
      setError('No se pudieron cargar los datos. Revisa tu conexión e inténtalo de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  // --- Métricas ---
  const newInquiries = inquiries.filter((i) => i.status === 'new').length;
  const upcomingEvents = calendarEvents.filter(
    (e) => e.status !== 'maintenance' && new Date(`${e.date}T23:59:59`) >= new Date()
  ).length;
  const bookedRevenue = inquiries
    .filter((i) => i.status === 'booked')
    .reduce((acc, i) => acc + (i.value || 0), 0);
  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const filteredTransactions = useMemo(
    () =>
      transactions.filter((t) => {
        const matchesType = transactionFilter === 'all' || t.type === transactionFilter;
        const matchesCategory = transCategoryFilter === 'all' || t.category === transCategoryFilter;
        return matchesType && matchesCategory;
      }),
    [transactions, transactionFilter, transCategoryFilter]
  );

  // --- Acciones ---
  const confirmDeleteImage = async () => {
    if (itemToDelete === null) return;
    try {
      await deleteGalleryItem(itemToDelete);
      setGalleryItems((items) => items.filter((i) => i.id !== itemToDelete));
    } catch {
      setError('No se pudo eliminar la imagen.');
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    try {
      await deleteTransaction(id);
      setTransactions((items) => items.filter((t) => t.id !== id));
    } catch {
      setError('No se pudo eliminar el movimiento.');
    }
  };

  const handleFreeDate = async () => {
    if (!selectedDate) return;
    try {
      await deleteCalendarEvent(selectedDate);
      setCalendarEvents((events) => events.filter((e) => e.date !== selectedDate));
    } catch {
      setError('No se pudo liberar la fecha.');
    } finally {
      setCalendarModalOpen(false);
    }
  };

  const handleBlockDate = async (details: { title: string; start: string; end: string }) => {
    if (!selectedDate) return;
    try {
      await upsertCalendarEvent({
        date: selectedDate,
        status: 'booked',
        title: details.title,
        timeStart: details.start,
        timeEnd: details.end,
      });
      setCalendarEvents((events) => {
        const rest = events.filter((e) => e.date !== selectedDate);
        return [
          ...rest,
          {
            id: selectedDate,
            date: selectedDate,
            status: 'booked',
            title: details.title,
            timeStart: details.start,
            timeEnd: details.end,
          },
        ];
      });
    } catch {
      setError('No se pudo bloquear la fecha.');
    } finally {
      setCalendarModalOpen(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Resumen', icon: 'dashboard' },
    { id: 'calendar', label: 'Agenda', icon: 'calendar_month' },
    { id: 'finance', label: 'Finanzas', icon: 'account_balance_wallet' },
    { id: 'gallery', label: 'Galería', icon: 'collections' },
    { id: 'inquiries', label: 'Buzón', icon: 'mail' },
  ];

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden bg-background-dark font-display text-white selection:bg-gold/30 selection:text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-noise opacity-30 mix-blend-soft-light"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-primary/20 rounded-full blur-[180px] animate-float opacity-40"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-gold/10 rounded-full blur-[150px] animate-pulse-slow opacity-30"></div>
      </div>

      {/* Modal eliminar imagen */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-[#1a1625] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4 text-red-500">
                <span className="material-symbols-outlined text-3xl">delete</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">¿Eliminar imagen?</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Esta acción no se puede deshacer. La imagen se eliminará de la galería pública.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteImage}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors shadow-lg shadow-red-900/20 text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal gestión de fecha */}
      {calendarModalOpen && selectedDate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-[#1a1625] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-1">Gestionar fecha</h3>
            <p className="text-gold font-mono mb-6">{selectedDate}</p>

            <div className="space-y-4">
              <button
                onClick={handleFreeDate}
                className="w-full py-4 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 font-bold flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">check_circle</span> Marcar como disponible
              </button>

              <div className="h-px bg-white/10 my-4"></div>

              <p className="text-xs text-gray-400 uppercase font-bold">O bloquear fecha:</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  handleBlockDate({
                    title: (form.elements.namedItem('title') as HTMLInputElement).value || 'Reservado',
                    start: (form.elements.namedItem('start') as HTMLInputElement).value || '09:00',
                    end: (form.elements.namedItem('end') as HTMLInputElement).value || '23:00',
                  });
                }}
                className="space-y-3"
              >
                <input
                  name="title"
                  placeholder="Título (Ej. Boda privada)"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    name="start"
                    type="time"
                    defaultValue="09:00"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white [color-scheme:dark]"
                  />
                  <input
                    name="end"
                    type="time"
                    defaultValue="23:59"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white [color-scheme:dark]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-900/20"
                >
                  Bloquear fecha
                </button>
              </form>
            </div>
            <button
              onClick={() => setCalendarModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              aria-label="Cerrar"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Barra superior */}
      <header className="sticky top-0 z-30 bg-background-dark/80 backdrop-blur-xl border-b border-white/5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-purple-700 flex items-center justify-center shadow-lg shadow-primary/20 shrink-0 border border-white/10">
              <span className="material-symbols-outlined text-white">admin_panel_settings</span>
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-white">
                OXYSALON <span className="text-gold font-light">Manager</span>
              </h1>
              <p className="text-[11px] text-gray-500">{email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="p-2 text-gray-400 hover:text-gold hover:bg-white/5 rounded-full transition-colors"
              title="Ver sitio"
            >
              <span className="material-symbols-outlined">open_in_new</span>
            </button>
            <button
              onClick={() => void signOut().then(() => navigate('/login'))}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
              title="Cerrar sesión"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-4">
          <div className="flex gap-2 p-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/25'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${activeTab === tab.id ? 'fill-current' : ''}`}>
                  {tab.icon}
                </span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full flex-1 p-4 md:p-6 relative z-10">
        {isDemo && (
          <div className="mb-6 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs p-3 rounded-xl">
            <strong>Modo demostración.</strong> Supabase no está configurado: los cambios se guardan
            solo en este navegador. Configura las variables de entorno para guardar en la nube.
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-300 text-sm p-3 rounded-xl flex items-center justify-between gap-3">
            <span>{error}</span>
            <button onClick={() => void loadAll()} className="text-xs font-bold underline whitespace-nowrap">
              Reintentar
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-gray-400">
            <span className="material-symbols-outlined text-4xl text-gold animate-spin">progress_activity</span>
            <p className="text-xs uppercase tracking-widest">Cargando panel…</p>
          </div>
        ) : (
          <>
            {/* RESUMEN */}
            {activeTab === 'overview' && (
              <div className="animate-fade-in-up space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      title: 'Solicitudes nuevas',
                      val: newInquiries,
                      icon: 'inbox',
                      color: 'text-gold',
                      sub: 'Pendientes de respuesta',
                      action: () => setActiveTab('inquiries'),
                    },
                    {
                      title: 'Próximos eventos',
                      val: upcomingEvents,
                      icon: 'event',
                      color: 'text-blue-400',
                      sub: 'En agenda',
                      action: () => setActiveTab('calendar'),
                    },
                    {
                      title: 'Visitas del sitio',
                      val: siteVisits.toLocaleString('es-VE'),
                      icon: 'visibility',
                      color: 'text-purple-400',
                      sub: 'Visitas registradas',
                    },
                    {
                      title: 'Reservas cerradas',
                      val: formatCurrency(bookedRevenue),
                      icon: 'payments',
                      color: 'text-green-400',
                      sub: 'Valor confirmado',
                      action: () => setActiveTab('finance'),
                    },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      onClick={stat.action}
                      className={`p-6 rounded-3xl bg-[#1a1625]/80 backdrop-blur-md border border-white/10 shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 ${
                        stat.action ? 'cursor-pointer hover:border-gold/30' : ''
                      }`}
                    >
                      <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <span className={`material-symbols-outlined text-8xl ${stat.color}`}>{stat.icon}</span>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                        <span className={`material-symbols-outlined text-2xl ${stat.color}`}>{stat.icon}</span>
                      </div>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.title}</p>
                      <h3 className="text-3xl font-extrabold text-white">{stat.val}</h3>
                      <p className="text-xs text-white/40 mt-2">{stat.sub}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-[#1a1625]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-gold">notifications_active</span> Actividad
                      reciente
                    </h3>
                    <button
                      onClick={() => setActiveTab('inquiries')}
                      className="text-sm text-gold hover:text-white transition-colors font-bold"
                    >
                      Ver todo
                    </button>
                  </div>
                  <div className="space-y-3">
                    {inquiries.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer border border-white/5 group"
                        onClick={() => navigate(`/dashboard/inquiry/${item.id}`)}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div
                            className={`h-3 w-3 rounded-full shrink-0 ${
                              item.status === 'new' ? 'bg-green-500 animate-pulse' : 'bg-gray-600'
                            }`}
                          ></div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-white group-hover:text-gold transition-colors truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {item.eventType || 'Consulta'} • {formatRelative(item.createdAt)}
                            </p>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-gray-500 group-hover:translate-x-1 transition-transform">
                          chevron_right
                        </span>
                      </div>
                    ))}
                    {inquiries.length === 0 && (
                      <p className="text-center text-sm text-gray-500 py-8">Todavía no hay solicitudes.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* AGENDA */}
            {activeTab === 'calendar' && (
              <section className="animate-fade-in-up">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">Gestión de agenda</h2>
                  <p className="text-gray-400">Selecciona una fecha para bloquearla o liberarla.</p>
                </div>
                <div className="bg-[#1a1625] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                  <Calendar
                    events={calendarEvents}
                    onDateClick={(date) => {
                      setSelectedDate(date);
                      setCalendarModalOpen(true);
                    }}
                    isAdmin
                  />
                </div>
              </section>
            )}

            {/* FINANZAS */}
            {activeTab === 'finance' && (
              <section className="animate-fade-in-up space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Resumen financiero</h2>
                    <p className="text-gray-400">Balance general de ingresos y egresos.</p>
                  </div>
                  <button
                    onClick={() => navigate('/dashboard/finance/new')}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-green-900/20 hover:scale-105 active:scale-95 transition-all w-full md:w-auto justify-center"
                  >
                    <span className="material-symbols-outlined">add</span> Nueva transacción
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-[#2a2438] to-[#151120] rounded-[2rem] p-8 border border-white/10 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-16 -mt-16"></div>
                    <div className="relative z-10 flex flex-col justify-between h-full min-h-[180px]">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-1">
                            Balance neto
                          </p>
                          <h3 className={`text-5xl font-extrabold ${netBalance >= 0 ? 'text-white' : 'text-red-400'}`}>
                            {formatCurrency(netBalance)}
                          </h3>
                        </div>
                        <span className="material-symbols-outlined text-4xl text-white/20">
                          account_balance_wallet
                        </span>
                      </div>
                      <div className="mt-6 flex flex-wrap gap-8">
                        <div>
                          <p className="text-xs text-green-400 flex items-center gap-1 mb-1">
                            <span className="material-symbols-outlined text-sm">arrow_upward</span> Ingresos
                          </p>
                          <p className="text-xl font-bold text-white">{formatCurrency(totalIncome)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-red-400 flex items-center gap-1 mb-1">
                            <span className="material-symbols-outlined text-sm">arrow_downward</span> Gastos
                          </p>
                          <p className="text-xl font-bold text-white">{formatCurrency(totalExpense)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1a1625] rounded-[2rem] p-8 border border-white/10 flex flex-col justify-between">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Movimientos</p>
                    <div className="mt-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Registrados</span>
                        <span className="text-white font-bold">{transactions.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Ingresos</span>
                        <span className="text-green-400 font-bold">
                          {transactions.filter((t) => t.type === 'income').length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Gastos</span>
                        <span className="text-red-400 font-bold">
                          {transactions.filter((t) => t.type === 'expense').length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1a1625]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden shadow-xl">
                  <div className="p-6 border-b border-white/10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-gold">history</span>
                      <h3 className="font-bold text-white">Historial reciente</h3>
                      <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] text-gray-400 font-mono">
                        {filteredTransactions.length}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                      <select
                        value={transCategoryFilter}
                        onChange={(e) => setTransCategoryFilter(e.target.value)}
                        className="w-full sm:w-48 bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs font-bold uppercase text-gray-300 focus:border-gold focus:ring-0 appearance-none cursor-pointer"
                      >
                        <option value="all" className="bg-[#1a1625]">
                          Categoría: todas
                        </option>
                        {TRANS_CATEGORIES.map((c) => (
                          <option key={c} value={c} className="bg-[#1a1625]">
                            {c}
                          </option>
                        ))}
                      </select>

                      <div className="flex bg-black/40 rounded-xl p-1 border border-white/5 overflow-x-auto no-scrollbar">
                        {(
                          [
                            { id: 'all', label: 'Todos' },
                            { id: 'income', label: 'Ingresos' },
                            { id: 'expense', label: 'Gastos' },
                          ] as const
                        ).map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => setTransactionFilter(opt.id)}
                            className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap ${
                              transactionFilter === opt.id
                                ? 'bg-white text-black shadow-lg'
                                : 'text-gray-500 hover:text-white'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-black/20 text-gray-400 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="p-5 font-bold whitespace-nowrap">Concepto</th>
                          <th className="p-5 font-bold whitespace-nowrap">Categoría</th>
                          <th className="p-5 font-bold whitespace-nowrap">Fecha</th>
                          <th className="p-5 font-bold text-right whitespace-nowrap">Monto</th>
                          <th className="p-5"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredTransactions.length > 0 ? (
                          filteredTransactions.map((t) => (
                            <tr key={t.id} className="hover:bg-white/5 transition-colors group">
                              <td className="p-5">
                                <div className="font-bold text-white group-hover:text-gold transition-colors">
                                  {t.title}
                                </div>
                                <div className="text-xs text-gray-500 uppercase font-bold mt-1 inline-block px-2 py-0.5 rounded bg-white/5">
                                  {t.type === 'income' ? 'Ingreso' : 'Gasto'}
                                </div>
                              </td>
                              <td className="p-5 text-sm text-gray-300">{t.category}</td>
                              <td className="p-5 text-sm text-gray-500 font-mono">{formatDate(t.date)}</td>
                              <td
                                className={`p-5 font-bold text-right text-lg ${
                                  t.type === 'income' ? 'text-green-400' : 'text-red-400'
                                }`}
                              >
                                {t.type === 'expense' ? '-' : '+'}
                                {formatCurrency(t.amount)}
                              </td>
                              <td className="p-5 text-right">
                                <button
                                  onClick={() => void handleDeleteTransaction(t.id)}
                                  className="text-gray-500 hover:text-red-400 transition-colors"
                                  title="Eliminar"
                                >
                                  <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="p-12 text-center">
                              <div className="flex flex-col items-center justify-center opacity-40">
                                <span className="material-symbols-outlined text-4xl mb-2">
                                  content_paste_off
                                </span>
                                <p className="text-sm font-bold uppercase">No hay movimientos</p>
                                <button
                                  onClick={() => {
                                    setTransactionFilter('all');
                                    setTransCategoryFilter('all');
                                  }}
                                  className="text-gold text-xs font-bold mt-2 hover:underline"
                                >
                                  Limpiar filtros
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {/* GALERÍA */}
            {activeTab === 'gallery' && (
              <section className="animate-fade-in-up">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Galería visual</h2>
                    <p className="text-sm text-gray-400">Gestiona el portafolio que ven tus clientes.</p>
                  </div>
                  <button
                    onClick={() => navigate('/dashboard/gallery/new')}
                    className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all"
                  >
                    <span className="material-symbols-outlined">add_photo_alternate</span>
                    Subir imagen
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-20">
                  {galleryItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => navigate(`/dashboard/gallery/${item.id}`)}
                      className="relative aspect-square group rounded-3xl overflow-hidden bg-black border border-white/10 cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
                    >
                      <img
                        src={item.image}
                        alt={item.title || 'Imagen de galería'}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                      />

                      {item.published === false && (
                        <span className="absolute top-2 left-2 bg-black/70 text-[10px] font-bold px-2 py-1 rounded uppercase">
                          Oculta
                        </span>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                        <div className="flex justify-end gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/dashboard/gallery/${item.id}`);
                            }}
                            className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white hover:text-black transition-colors"
                            title="Editar"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setItemToDelete(item.id);
                              setDeleteModalOpen(true);
                            }}
                            className="w-8 h-8 rounded-full bg-red-500/20 backdrop-blur-md flex items-center justify-center hover:bg-red-500 text-white transition-colors"
                            title="Eliminar"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                        <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          <p className="text-xs text-gold font-bold uppercase tracking-wider mb-1">
                            {item.category || 'Sin categoría'}
                          </p>
                          <p className="text-white text-sm font-bold truncate">{item.title}</p>
                          <div className="flex items-center gap-1 mt-2 text-xs text-gray-300">
                            <span className="material-symbols-outlined text-xs text-red-500 fill-current">
                              favorite
                            </span>{' '}
                            {item.likes}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {galleryItems.length === 0 && (
                    <p className="col-span-full text-center text-sm text-gray-500 py-16">
                      No hay imágenes todavía. Sube la primera.
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* BUZÓN */}
            {activeTab === 'inquiries' && (
              <section className="animate-fade-in-up h-[calc(100vh-140px)] flex flex-col">
                <div className="bg-[#1a1625] border border-white/5 rounded-3xl flex-1 overflow-hidden flex flex-col shadow-2xl relative">
                  <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-[#1a1625] to-transparent z-10 pointer-events-none"></div>

                  <div className="overflow-auto flex-1 custom-scrollbar p-2">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 z-20">
                        <tr>
                          {['Cliente', 'Evento', 'Fecha evento', 'Valor', 'Estado', ''].map((h, i) => (
                            <th
                              key={i}
                              className="bg-[#151120] p-4 text-xs font-bold text-gray-500 uppercase tracking-wider first:rounded-l-xl last:rounded-r-xl"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {inquiries.map((inquiry) => {
                          const meta = STATUS_META[inquiry.status] ?? STATUS_META.new;
                          return (
                            <tr
                              key={inquiry.id}
                              onClick={() => navigate(`/dashboard/inquiry/${inquiry.id}`)}
                              className="hover:bg-white/5 transition-colors cursor-pointer group"
                            >
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`h-10 w-10 rounded-full ${avatarColor(
                                      inquiry.name
                                    )} flex items-center justify-center border border-white/10 font-bold text-xs shadow-lg shrink-0`}
                                  >
                                    {initials(inquiry.name)}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-white font-bold text-sm group-hover:text-gold transition-colors truncate">
                                      {inquiry.name}
                                    </p>
                                    <p className="text-gray-500 text-xs truncate">{formatRelative(inquiry.createdAt)}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-sm text-gray-300">{inquiry.eventType || '—'}</td>
                              <td className="p-4 text-sm text-gray-400 font-mono">{formatDate(inquiry.eventDate)}</td>
                              <td className="p-4 text-sm font-mono text-white/80">
                                {inquiry.value ? formatCurrency(inquiry.value) : '—'}
                              </td>
                              <td className="p-4">
                                <span
                                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${meta.badge}`}
                                >
                                  {meta.label}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <span className="material-symbols-outlined text-lg text-gray-400 group-hover:text-white">
                                  chevron_right
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                        {inquiries.length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-16 text-center text-sm text-gray-500">
                              El buzón está vacío.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
