/**
 * Galería del panel: temas con varias fotos.
 *
 * Un "tema" es un conjunto (Bodas, 15 años, Corporativo…) con su propio
 * carrusel en el sitio público. Cada foto dentro del tema tiene título,
 * descripción, texto alternativo y enlace propios.
 *
 * Las imágenes se comprimen en el navegador antes de subir (src/lib/image.ts)
 * para no agotar el 1 GB del plan gratuito de Storage.
 */
import React, { useMemo, useRef, useState } from 'react';
import { PageHeader } from '../AdminLayout';
import {
  createGalleryItem,
  createGalleryPhoto,
  deleteGalleryItem,
  deleteGalleryPhoto,
  listGallery,
  reorderGalleryPhotos,
  updateGalleryItem,
  updateGalleryPhoto,
  uploadGalleryImage,
} from '../../lib/store';
import { useAsyncData } from '../../lib/useAsync';
import type { GalleryItem } from '../../../types';
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Field,
  Glyph,
  Input,
  Modal,
  Select,
  Skeleton,
  Textarea,
  useToast,
} from '../../ui';

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_INPUT_BYTES = 12 * 1024 * 1024;

let seq = 0;
const newKey = () => `d${Date.now()}-${seq++}`;

/** Foto en edición: puede ser una ya guardada (id) o un archivo nuevo (file). */
interface DraftPhoto {
  key: string;
  id?: number;
  image: string;
  file?: File;
  title: string;
  description: string;
  alt: string;
  link: string;
}

interface DraftItem {
  title: string;
  category: string;
  type: GalleryItem['type'];
  published: boolean;
}

const EMPTY_ITEM: DraftItem = {
  title: '',
  category: 'Bodas',
  type: 'wide',
  published: true,
};

export const Gallery: React.FC = () => {
  const { push } = useToast();
  const { data, error, loading, initial, reload } = useAsyncData(() => listGallery(), []);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [item, setItem] = useState<DraftItem>(EMPTY_ITEM);
  const [drafts, setDrafts] = useState<DraftPhoto[]>([]);
  const [removed, setRemoved] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [toDelete, setToDelete] = useState<GalleryItem | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const items = data ?? [];
  const visible = items.filter((i) => i.published !== false).length;

  const categories = useMemo(() => {
    const set = new Set((data ?? []).map((i) => i.category).filter(Boolean) as string[]);
    return [...set].sort();
  }, [data]);

  // ---------------------------------------------------------------- apertura
  const openCreate = () => {
    setEditing(null);
    setItem(EMPTY_ITEM);
    setDrafts([]);
    setRemoved([]);
    setFormError('');
    setOpen(true);
  };

  const openEdit = (target: GalleryItem) => {
    setEditing(target);
    setItem({
      title: target.title ?? '',
      category: target.category ?? 'Bodas',
      type: target.type,
      published: target.published !== false,
    });
    setDrafts(
      (target.photos ?? []).map((p) => ({
        key: newKey(),
        id: p.id,
        image: p.image,
        title: p.title ?? '',
        description: p.description ?? '',
        alt: p.alt ?? '',
        link: p.link ?? '',
      }))
    );
    setRemoved([]);
    setFormError('');
    setOpen(true);
  };

  const close = () => {
    if (saving) return;
    setOpen(false);
    setEditing(null);
    setDrafts([]);
    setRemoved([]);
    setProgress(null);
  };

  // ------------------------------------------------------------------ fotos
  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const accepted: DraftPhoto[] = [];
    for (const file of Array.from(files)) {
      if (!ACCEPTED.includes(file.type)) {
        push({ tone: 'danger', title: 'Formato no permitido', description: `${file.name}: usa JPG, PNG, WEBP o AVIF.` });
        continue;
      }
      if (file.size > MAX_INPUT_BYTES) {
        push({ tone: 'danger', title: 'Archivo muy grande', description: `${file.name}: máximo 12 MB antes de comprimir.` });
        continue;
      }
      accepted.push({
        key: newKey(),
        image: URL.createObjectURL(file),
        file,
        title: '',
        description: '',
        alt: '',
        link: '',
      });
    }

    if (accepted.length > 0) {
      setDrafts((prev) => [...prev, ...accepted]);
      setFormError('');
    }
    // Permite volver a elegir el mismo archivo si se borra.
    if (fileInput.current) fileInput.current.value = '';
  };

  const patchDraft = (key: string, patch: Partial<DraftPhoto>) => {
    setDrafts((prev) => prev.map((d) => (d.key === key ? { ...d, ...patch } : d)));
  };

  const removeDraft = (key: string) => {
    setDrafts((prev) => {
      const target = prev.find((d) => d.key === key);
      if (target?.id) setRemoved((r) => [...r, target.id as number]);
      return prev.filter((d) => d.key !== key);
    });
  };

  const moveDraft = (key: string, direction: -1 | 1) => {
    setDrafts((prev) => {
      const index = prev.findIndex((d) => d.key === key);
      const next = index + direction;
      if (index < 0 || next < 0 || next >= prev.length) return prev;
      const copy = [...prev];
      [copy[index], copy[next]] = [copy[next], copy[index]];
      return copy;
    });
  };

  // ------------------------------------------------------------------ guardar
  const save = async () => {
    setFormError('');

    if (item.title.trim().length < 2) {
      setFormError('Ponle un nombre al tema (mínimo 2 caracteres).');
      return;
    }
    if (drafts.length === 0) {
      setFormError('Agrega al menos una foto.');
      return;
    }

    setSaving(true);
    try {
      // 1. Subir las fotos nuevas, de una en una para no saturar la conexión.
      const uploaded: DraftPhoto[] = [];
      for (let i = 0; i < drafts.length; i++) {
        const draft = drafts[i];
        if (draft.file) {
          setProgress(`Subiendo foto ${i + 1} de ${drafts.length}…`);
          const url = await uploadGalleryImage(draft.file);
          uploaded.push({ ...draft, image: url, file: undefined });
        } else {
          uploaded.push(draft);
        }
      }

      setProgress('Guardando…');

      if (editing) {
        await updateGalleryItem(editing.id, {
          title: item.title.trim(),
          category: item.category.trim() || undefined,
          type: item.type,
          published: item.published,
          image: uploaded[0]?.image ?? editing.image,
        });

        // Fotos quitadas
        for (const id of removed) await deleteGalleryPhoto(id);

        // Metadatos de las que ya existían
        for (const draft of uploaded) {
          if (!draft.id) continue;
          await updateGalleryPhoto(draft.id, {
            title: draft.title.trim(),
            description: draft.description.trim(),
            alt: draft.alt.trim(),
            link: draft.link.trim(),
          });
        }

        // Fotos nuevas, en el orden en que quedaron
        const orderedIds: number[] = [];
        for (const draft of uploaded) {
          if (draft.id) {
            orderedIds.push(draft.id);
          } else {
            const id = await createGalleryPhoto(editing.id, {
              image: draft.image,
              title: draft.title.trim(),
              description: draft.description.trim(),
              alt: draft.alt.trim(),
              link: draft.link.trim(),
            });
            if (id) orderedIds.push(id);
          }
        }
        if (orderedIds.length > 0) await reorderGalleryPhotos(editing.id, orderedIds);
      } else {
        await createGalleryItem(
          {
            image: uploaded[0]?.image ?? '',
            title: item.title.trim(),
            category: item.category.trim() || undefined,
            type: item.type,
            published: item.published,
          },
          uploaded.map((d) => ({
            image: d.image,
            title: d.title.trim() || undefined,
            description: d.description.trim() || undefined,
            alt: d.alt.trim() || undefined,
            link: d.link.trim() || undefined,
          }))
        );
      }

      push({
        tone: 'ok',
        title: editing ? 'Tema actualizado' : 'Tema creado',
        description: item.published
          ? `Con ${uploaded.length} foto${uploaded.length === 1 ? '' : 's'}, ya visible en el sitio.`
          : 'Guardado como oculto.',
      });

      setOpen(false);
      setEditing(null);
      setDrafts([]);
      setRemoved([]);
      reload();
    } catch (err) {
      push({
        tone: 'danger',
        title: 'No se pudo guardar',
        description: err instanceof Error ? err.message : 'Inténtalo de nuevo.',
      });
    } finally {
      setSaving(false);
      setProgress(null);
    }
  };

  const togglePublished = async (target: GalleryItem) => {
    try {
      await updateGalleryItem(target.id, { published: target.published === false });
      reload();
    } catch (err) {
      push({ tone: 'danger', title: 'No se pudo cambiar la visibilidad', description: err instanceof Error ? err.message : '' });
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    try {
      await deleteGalleryItem(toDelete.id);
      push({ tone: 'ok', title: 'Tema eliminado', description: 'También se borraron sus fotos del almacenamiento.' });
      setToDelete(null);
      reload();
    } catch (err) {
      push({ tone: 'danger', title: 'No se pudo eliminar', description: err instanceof Error ? err.message : '' });
    }
  };

  const totalPhotos = items.reduce((sum, i) => sum + (i.photos?.length ?? 0), 0);

  return (
    <div>
      <PageHeader
        title="Galería"
        description={`${items.length} tema${items.length === 1 ? '' : 's'} · ${totalPhotos} foto${
          totalPhotos === 1 ? '' : 's'
        } · ${visible} visible${visible === 1 ? '' : 's'} en el sitio.`}
        breadcrumb={['Panel', 'Galería']}
        actions={
          <Button variant="primary" size="sm" icon={<Glyph name="add_photo_alternate" />} onClick={openCreate}>
            Nuevo tema
          </Button>
        }
      />

      {error ? (
        <div className="panel">
          <ErrorState onRetry={reload} retrying={loading} />
        </div>
      ) : initial ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon="photo_library"
            title="Todavía no hay temas"
            description="Crea un tema (por ejemplo “Bodas”) y súbele varias fotos. Cada tema tendrá su propio carrusel en el sitio."
            action={
              <Button size="sm" variant="primary" onClick={openCreate}>
                Crear el primero
              </Button>
            }
          />
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((target) => {
            const photos = target.photos ?? [];
            const cover = photos[0]?.image ?? target.image;
            return (
              <li key={target.id} className="overflow-hidden rounded-xl border border-line bg-surface">
                <div className="relative">
                  <img
                    src={cover}
                    alt={photos[0]?.alt || target.title || 'Portada del tema'}
                    loading="lazy"
                    className="aspect-video w-full object-cover"
                  />
                  <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2">
                    <Badge tone={target.published === false ? 'neutral' : 'ok'}>
                      {target.published === false ? 'Oculto' : 'Visible'}
                    </Badge>
                    <Badge tone="accent">
                      {photos.length} foto{photos.length === 1 ? '' : 's'}
                    </Badge>
                  </div>
                </div>

                <div className="p-3">
                  <p className="truncate text-sm font-semibold text-fg">{target.title || 'Sin título'}</p>
                  <p className="truncate text-2xs text-muted">{target.category || 'Sin categoría'}</p>

                  {photos.length > 1 && (
                    <div className="mt-2 flex gap-1 overflow-hidden">
                      {photos.slice(1, 5).map((p) => (
                        <img
                          key={p.id || p.image}
                          src={p.image}
                          alt=""
                          loading="lazy"
                          className="size-10 shrink-0 rounded object-cover"
                        />
                      ))}
                      {photos.length > 5 && (
                        <span className="flex size-10 shrink-0 items-center justify-center rounded bg-elevated text-2xs text-muted">
                          +{photos.length - 5}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Button size="sm" variant="secondary" icon={<Glyph name="edit" />} onClick={() => openEdit(target)}>
                      Editar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => togglePublished(target)}>
                      {target.published === false ? 'Publicar' : 'Ocultar'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-auto text-danger"
                      aria-label={`Eliminar ${target.title || 'tema'}`}
                      onClick={() => setToDelete(target)}
                    >
                      <Glyph name="delete" />
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Modal
        open={open}
        onClose={close}
        title={editing ? 'Editar tema' : 'Nuevo tema'}
        description="Cada foto puede tener su propio título, descripción, texto alternativo y enlace."
        size="xl"
        footer={
          <>
            <Button variant="ghost" onClick={close} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="primary" loading={saving} onClick={save} disabled={saving}>
              {editing ? 'Guardar cambios' : 'Crear tema'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Nombre del tema" htmlFor="t-title" required hint="Ej. “Bodas”, “15 años”, “Corporativo”.">
              <Input
                id="t-title"
                value={item.title}
                onChange={(e) => setItem((v) => ({ ...v, title: e.target.value }))}
                maxLength={120}
                placeholder="Bodas"
              />
            </Field>
            <Field label="Categoría" htmlFor="t-cat" hint="Agrupa temas parecidos en el sitio.">
              <Input
                id="t-cat"
                value={item.category}
                onChange={(e) => setItem((v) => ({ ...v, category: e.target.value }))}
                maxLength={60}
                list="gallery-categories"
              />
              <datalist id="gallery-categories">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Formato en el sitio" htmlFor="t-type">
              <Select
                id="t-type"
                value={item.type}
                onChange={(e) => setItem((v) => ({ ...v, type: e.target.value as GalleryItem['type'] }))}
              >
                <option value="wide">Horizontal</option>
                <option value="tall">Vertical</option>
                <option value="square">Cuadrada</option>
              </Select>
            </Field>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-xs text-fg">
                <input
                  type="checkbox"
                  checked={item.published}
                  onChange={(e) => setItem((v) => ({ ...v, published: e.target.checked }))}
                  className="size-4 accent-[rgb(var(--accent))]"
                />
                Visible en el sitio
              </label>
            </div>
          </div>

          {/* Zona de carga */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              addFiles(e.dataTransfer.files);
            }}
            className="rounded-xl border border-dashed border-line bg-bg p-4 text-center"
          >
            <p className="text-2xs text-muted">
              Arrastra varias fotos aquí o elige archivos. Se comprimen a WebP antes de subir.
            </p>
            <input
              ref={fileInput}
              type="file"
              multiple
              accept={ACCEPTED.join(',')}
              className="sr-only"
              onChange={(e) => addFiles(e.target.files)}
            />
            <Button size="sm" variant="secondary" className="mt-2" onClick={() => fileInput.current?.click()}>
              Elegir fotos
            </Button>
          </div>

          {formError && (
            <p role="alert" className="text-2xs font-medium text-danger">
              {formError}
            </p>
          )}

          {/* Lista de fotos del tema */}
          {drafts.length > 0 && (
            <ul className="space-y-2">
              {drafts.map((draft, index) => (
                <li key={draft.key} className="rounded-xl border border-line bg-surface p-3">
                  <div className="flex gap-3">
                    <img
                      src={draft.image}
                      alt=""
                      className="size-20 shrink-0 rounded-lg object-cover"
                    />

                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-1">
                        <span className="text-2xs font-semibold text-muted">Foto {index + 1}</span>
                        {draft.file && <Badge tone="warn">Nueva</Badge>}
                        <div className="ml-auto flex gap-1">
                          <button
                            type="button"
                            onClick={() => moveDraft(draft.key, -1)}
                            disabled={index === 0}
                            aria-label={`Subir la foto ${index + 1}`}
                            className="focus-ring rounded-md border border-line p-1 text-muted hover:text-fg disabled:opacity-40"
                          >
                            <Glyph name="arrow_upward" className="text-[14px]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveDraft(draft.key, 1)}
                            disabled={index === drafts.length - 1}
                            aria-label={`Bajar la foto ${index + 1}`}
                            className="focus-ring rounded-md border border-line p-1 text-muted hover:text-fg disabled:opacity-40"
                          >
                            <Glyph name="arrow_downward" className="text-[14px]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeDraft(draft.key)}
                            aria-label={`Quitar la foto ${index + 1}`}
                            className="focus-ring rounded-md border border-line p-1 text-danger hover:bg-danger/10"
                          >
                            <Glyph name="delete" className="text-[14px]" />
                          </button>
                        </div>
                      </div>

                      <Input
                        aria-label={`Título de la foto ${index + 1}`}
                        value={draft.title}
                        onChange={(e) => patchDraft(draft.key, { title: e.target.value })}
                        maxLength={120}
                        placeholder="Título (ej. Mesa principal)"
                      />

                      <Textarea
                        aria-label={`Descripción de la foto ${index + 1}`}
                        value={draft.description}
                        onChange={(e) => patchDraft(draft.key, { description: e.target.value })}
                        rows={2}
                        maxLength={400}
                        placeholder="Descripción breve de lo que se ve"
                      />

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <Input
                          aria-label={`Texto alternativo de la foto ${index + 1}`}
                          value={draft.alt}
                          onChange={(e) => patchDraft(draft.key, { alt: e.target.value })}
                          maxLength={160}
                          placeholder="Texto alternativo (accesibilidad)"
                        />
                        <Input
                          aria-label={`Enlace de la foto ${index + 1}`}
                          value={draft.link}
                          onChange={(e) => patchDraft(draft.key, { link: e.target.value })}
                          maxLength={500}
                          placeholder="Enlace opcional (https://…)"
                          inputMode="url"
                        />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {progress && (
            <p role="status" className="text-2xs font-medium text-accent">
              {progress}
            </p>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        title="¿Eliminar el tema?"
        description="Se borran todas sus fotos del sitio y del almacenamiento. No se puede deshacer."
        confirmLabel="Eliminar"
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
};
