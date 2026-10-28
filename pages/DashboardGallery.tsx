import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { GalleryItem, GalleryType } from '../types';
import { createGalleryItem, getGalleryItem, updateGalleryItem, uploadGalleryImage } from '../src/lib/store';
import { GALLERY_CATEGORIES, GALLERY_TYPES } from '../src/lib/constants';

const DashboardGallery: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id && id !== 'new');

  const [form, setForm] = useState({
    image: '',
    title: '',
    category: 'Bodas',
    type: 'wide' as GalleryType,
    featured: false,
    published: true,
  });
  const [loading, setLoading] = useState(isEditing);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEditing) return;
    let active = true;
    (async () => {
      try {
        const existing = await getGalleryItem(Number(id));
        if (!active) return;
        if (existing) {
          setForm({
            image: existing.image,
            title: existing.title ?? '',
            category: existing.category ?? 'Bodas',
            type: existing.type,
            featured: Boolean(existing.featured),
            published: existing.published !== false,
          });
        } else {
          setError('No encontramos esa imagen.');
        }
      } catch (err) {
        console.error(err);
        if (active) setError('No se pudo cargar la imagen.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, isEditing]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const url = await uploadGalleryImage(file);
      setForm((f) => ({ ...f, image: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo subir la imagen.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.image) {
      setError('Selecciona una imagen o pega una URL.');
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await updateGalleryItem(Number(id), {
          image: form.image,
          title: form.title.trim(),
          category: form.category,
          type: form.type,
          featured: form.featured,
          published: form.published,
        });
      } else {
        await createGalleryItem({
          image: form.image,
          title: form.title.trim(),
          category: form.category,
          type: form.type,
          featured: form.featured,
          published: form.published,
        });
      }
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('No se pudo guardar. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-dark font-display text-white relative flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-noise opacity-30 mix-blend-soft-light"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] animate-float"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-gold/10 rounded-full blur-[150px] animate-pulse-slow"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10 animate-fade-in-up py-10">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10">
              <span className="material-symbols-outlined">arrow_back</span>
            </div>
            <span className="font-bold text-sm uppercase tracking-wider">Volver</span>
          </button>
          <h1 className="text-2xl font-bold text-white text-right">
            {isEditing ? 'Editar imagen' : 'Nueva imagen'}
          </h1>
        </div>

        <div className="bg-[#151120] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500"></div>

          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
              <span className="material-symbols-outlined animate-spin text-3xl text-gold">progress_activity</span>
              Cargando…
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative group border-2 border-dashed border-white/20 rounded-2xl h-64 flex flex-col items-center justify-center hover:border-gold hover:bg-white/5 transition-all overflow-hidden bg-black/20">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    onChange={handleFile}
                    className="absolute inset-0 opacity-0 z-20 cursor-pointer"
                    aria-label="Seleccionar imagen"
                  />
                  {form.image ? (
                    <img src={form.image} className="w-full h-full object-cover" alt="Vista previa" />
                  ) : (
                    <div className="text-center p-4">
                      <span className="material-symbols-outlined text-4xl text-gray-500 mb-2 group-hover:text-gold transition-colors">
                        cloud_upload
                      </span>
                      <p className="text-xs text-gray-400 font-bold uppercase">Arrastra o haz clic</p>
                      <p className="text-[10px] text-gray-600 mt-1">JPG, PNG o WEBP · máx. 5 MB</p>
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 z-30">
                      <span className="material-symbols-outlined animate-spin text-3xl text-gold">
                        progress_activity
                      </span>
                      <span className="text-xs uppercase font-bold text-gray-300">Subiendo…</span>
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur-md pointer-events-none z-30">
                    {form.type.toUpperCase()}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="imageUrl" className="text-xs text-gray-500 font-bold uppercase mb-2 block">
                      URL directa (opcional)
                    </label>
                    <input
                      id="imageUrl"
                      type="url"
                      value={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                      placeholder="https://…"
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-gold focus:ring-0 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="title" className="text-xs text-gray-500 font-bold uppercase mb-2 block">
                      Título
                    </label>
                    <input
                      id="title"
                      type="text"
                      maxLength={120}
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="Ej. Boda civil"
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-gold focus:ring-0"
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="text-xs text-gray-500 font-bold uppercase mb-2 block">
                      Categoría
                    </label>
                    <select
                      id="category"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-gold focus:ring-0 appearance-none cursor-pointer"
                    >
                      {GALLERY_CATEGORIES.map((c) => (
                        <option key={c} value={c} className="bg-[#151120]">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                <div>
                  <label className="text-xs text-gray-500 font-bold uppercase mb-2 block">Formato visual</label>
                  <div className="flex bg-black/40 rounded-xl p-1 border border-white/5">
                    {GALLERY_TYPES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setForm({ ...form, type: t.value })}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${
                          form.type === t.value ? 'bg-white text-black shadow' : 'text-gray-500 hover:text-white'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20 bg-black/30 text-primary focus:ring-0"
                    />
                    <span className="text-xs font-bold uppercase text-gray-400">Destacar en portada</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.published}
                      onChange={(e) => setForm({ ...form, published: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20 bg-black/30 text-primary focus:ring-0"
                    />
                    <span className="text-xs font-bold uppercase text-gray-400">Visible en el sitio</span>
                  </label>
                </div>
              </div>

              {error && (
                <div role="alert" className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!form.image || saving || uploading}
                className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined">save</span>
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardGallery;
