import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GALLERY_ITEMS } from '../constants';
import { GalleryItem } from '../types';

const CATEGORIES = ["Bodas", "Corporativo", "Decoración", "Tecnología", "Bebidas", "Salones", "Exterior", "Otros"];

const DashboardGallery: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = id && id !== 'new';

  const [imageForm, setImageForm] = useState({ 
    id: 0,
    url: '', 
    title: '', 
    category: 'Bodas', 
    type: 'wide' as 'wide' | 'tall' | 'square', 
    likes: 0 
  });

  // Load existing data if editing
  useEffect(() => {
    if (isEditing) {
        const savedItems = JSON.parse(localStorage.getItem('gallery_items') || '[]');
        const existing = savedItems.find((i: GalleryItem) => i.id === parseInt(id!));
        if (existing) {
            setImageForm({
                id: existing.id,
                url: existing.image,
                title: existing.title || '',
                category: existing.category || 'Otros',
                type: existing.type,
                likes: existing.likes || 0
            });
        } else {
            // Fallback to constants if not in local storage yet (though Dashboard usually initializes LS)
            const constantItem = GALLERY_ITEMS.find(i => i.id === parseInt(id!));
            if (constantItem) {
                setImageForm({
                    id: constantItem.id,
                    url: constantItem.image,
                    title: constantItem.title || '',
                    category: constantItem.category || 'Otros',
                    type: constantItem.type,
                    likes: constantItem.likes || 0
                });
            }
        }
    }
  }, [id, isEditing]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageForm({ ...imageForm, url: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageForm.url) return;

    const savedItems: GalleryItem[] = JSON.parse(localStorage.getItem('gallery_items') || JSON.stringify(GALLERY_ITEMS));
    
    let newItems;
    if (isEditing) {
        newItems = savedItems.map(item => item.id === imageForm.id ? {
            ...item,
            image: imageForm.url,
            title: imageForm.title,
            category: imageForm.category,
            type: imageForm.type,
            likes: imageForm.likes
        } : item);
    } else {
        const newItem: GalleryItem = {
            id: Date.now(),
            image: imageForm.url,
            title: imageForm.title,
            category: imageForm.category,
            type: imageForm.type,
            likes: imageForm.likes
        };
        newItems = [newItem, ...savedItems];
    }

    localStorage.setItem('gallery_items', JSON.stringify(newItems));
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background-dark font-display text-white relative flex flex-col items-center justify-center p-4 overflow-hidden">
        {/* Ambient Background */}
        <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-0 left-0 w-full h-full bg-noise opacity-30 mix-blend-soft-light"></div>
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] animate-float"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-gold/10 rounded-full blur-[150px] animate-pulse-slow"></div>
        </div>

        <div className="w-full max-w-2xl relative z-10 animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </div>
                    <span className="font-bold text-sm uppercase tracking-wider">Volver</span>
                </button>
                <h1 className="text-2xl font-bold text-white text-right">{isEditing ? 'Editar Imagen' : 'Nueva Imagen'}</h1>
            </div>

            {/* Glass Card */}
            <div className="bg-[#151120] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500"></div>
                
                <form onSubmit={handleSave} className="space-y-6">
                    {/* Image Preview & Upload */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative group cursor-pointer border-2 border-dashed border-white/20 rounded-2xl h-64 flex flex-col items-center justify-center hover:border-gold hover:bg-white/5 transition-all overflow-hidden bg-black/20">
                            <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 z-20 cursor-pointer" />
                            {imageForm.url ? (
                                <img src={imageForm.url} className="w-full h-full object-cover" alt="Vista previa" />
                            ) : (
                                <div className="text-center p-4">
                                    <span className="material-symbols-outlined text-4xl text-gray-500 mb-2 group-hover:text-gold transition-colors">cloud_upload</span>
                                    <p className="text-xs text-gray-400 font-bold uppercase">Arrastra o Clic</p>
                                </div>
                            )}
                            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur-md pointer-events-none">
                                {imageForm.type.toUpperCase()}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 font-bold uppercase mb-2 block">URL Directa (Opcional)</label>
                                <input type="text" value={imageForm.url} onChange={e => setImageForm({...imageForm, url: e.target.value})} placeholder="https://..." className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-gold focus:ring-0 transition-colors" />
                            </div>
                            
                            <div>
                                <label className="text-xs text-gray-500 font-bold uppercase mb-2 block">Título</label>
                                <input type="text" value={imageForm.title} onChange={e => setImageForm({...imageForm, title: e.target.value})} placeholder="Ej. Boda Civil" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-gold focus:ring-0" />
                            </div>

                            <div>
                                <label className="text-xs text-gray-500 font-bold uppercase mb-2 block">Categoría</label>
                                <select value={imageForm.category} onChange={e => setImageForm({...imageForm, category: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-gold focus:ring-0">
                                    {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#151120]">{c}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Footer Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                        <div>
                            <label className="text-xs text-gray-500 font-bold uppercase mb-2 block">Formato Visual</label>
                            <div className="flex bg-black/40 rounded-xl p-1 border border-white/5">
                                {['wide', 'tall', 'square'].map((t: any) => (
                                    <button key={t} type="button" onClick={() => setImageForm({...imageForm, type: t})} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${imageForm.type === t ? 'bg-white text-black shadow' : 'text-gray-500 hover:text-white'}`}>{t}</button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 font-bold uppercase mb-2 block">Contador de Likes (Manual)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500 material-symbols-outlined text-sm">favorite</span>
                                <input type="number" value={imageForm.likes} onChange={e => setImageForm({...imageForm, likes: parseInt(e.target.value) || 0})} className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-sm text-white focus:border-gold focus:ring-0 font-mono" />
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={!imageForm.url} className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
                        <span className="material-symbols-outlined">save</span>
                        Guardar Cambios
                    </button>
                </form>
            </div>
        </div>
    </div>
  );
};

export default DashboardGallery;