import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_TRANSACTIONS } from '../constants';
import { Transaction } from '../types';

const DashboardFinance: React.FC = () => {
  const navigate = useNavigate();
  const [newTransForm, setNewTransForm] = useState({ title: '', amount: '', type: 'income', category: 'General' });

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransForm.title || !newTransForm.amount) return;

    // Get existing
    const savedTransactions: Transaction[] = JSON.parse(localStorage.getItem('transactions') || JSON.stringify(MOCK_TRANSACTIONS));
    
    const newTransaction: Transaction = {
        id: Date.now(),
        title: newTransForm.title,
        amount: parseFloat(newTransForm.amount),
        type: newTransForm.type as 'income' | 'expense',
        category: newTransForm.category,
        date: new Date().toISOString().split('T')[0],
        status: 'completed'
    };

    const updatedList = [newTransaction, ...savedTransactions];
    localStorage.setItem('transactions', JSON.stringify(updatedList));
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background-dark font-display text-white relative flex flex-col items-center justify-center p-4 overflow-hidden">
        {/* Ambient Background */}
        <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-0 left-0 w-full h-full bg-noise opacity-30 mix-blend-soft-light"></div>
            <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[150px] animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[150px] animate-float"></div>
        </div>

        <div className="w-full max-w-md relative z-10 animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </div>
                    <span className="font-bold text-sm uppercase tracking-wider">Cancelar</span>
                </button>
            </div>

            <div className="bg-[#151120] border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                 <h1 className="text-2xl font-bold text-white mb-6 text-center">Registrar Movimiento</h1>
                 
                 <form onSubmit={handleAddTransaction} className="space-y-6">
                     <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Tipo de Transacción</label>
                        <div className="flex bg-black/40 rounded-xl p-1.5 border border-white/5">
                           <button type="button" onClick={() => setNewTransForm({...newTransForm, type: 'income'})} className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all ${newTransForm.type === 'income' ? 'bg-green-500/20 text-green-400 border border-green-500/50 shadow-lg shadow-green-500/10' : 'text-gray-500 hover:text-white'}`}>
                               <span className="material-symbols-outlined text-sm">arrow_upward</span> Ingreso
                           </button>
                           <button type="button" onClick={() => setNewTransForm({...newTransForm, type: 'expense'})} className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all ${newTransForm.type === 'expense' ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-lg shadow-red-500/10' : 'text-gray-500 hover:text-white'}`}>
                               <span className="material-symbols-outlined text-sm">arrow_downward</span> Gasto
                           </button>
                        </div>
                     </div>

                     <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Monto</label>
                        <div className="relative group">
                           <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold text-lg transition-colors ${newTransForm.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>$</span>
                           <input type="number" required value={newTransForm.amount} onChange={e => setNewTransForm({...newTransForm, amount: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-8 text-white focus:border-gold focus:ring-0 font-mono text-xl font-bold transition-all group-focus-within:border-gold/50" placeholder="0.00" />
                        </div>
                     </div>

                     <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Concepto</label>
                        <input type="text" required value={newTransForm.title} onChange={e => setNewTransForm({...newTransForm, title: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-gold focus:ring-0 text-sm" placeholder="Ej. Depósito Boda X" />
                     </div>

                     <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Categoría</label>
                        <select value={newTransForm.category} onChange={e => setNewTransForm({...newTransForm, category: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-gold focus:ring-0 text-sm appearance-none cursor-pointer">
                           {['General', 'Reservas', 'Eventos', 'Materiales', 'Mantenimiento', 'Personal'].map(c => <option key={c} value={c} className="bg-[#151120]">{c}</option>)}
                        </select>
                     </div>

                     <button type="submit" className="w-full py-4 rounded-xl bg-white text-black font-bold hover:bg-gold transition-colors shadow-lg mt-4 flex items-center justify-center gap-2">
                        <span>Confirmar Transacción</span>
                        <span className="material-symbols-outlined">check</span>
                     </button>
                 </form>
            </div>
        </div>
    </div>
  );
};

export default DashboardFinance;