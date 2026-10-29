/**
 * Optimización de imágenes en el navegador, antes de subirlas.
 *
 * Sin esto, una foto de teléfono de 4–8 MB se guarda tal cual en Storage y el
 * plan gratuito (1 GB) se llena con ~150 fotos. Comprimida a WebP de 1600 px
 * queda en 200–400 KB: caben miles en el mismo espacio.
 *
 * No usa servidor ni librerías externas: canvas + WebP nativo del navegador.
 */

export interface OptimizeOptions {
  /** Ancho máximo en píxeles (no amplía imágenes más pequeñas). */
  maxWidth?: number;
  /** Calidad WebP, 0–1. */
  quality?: number;
  /** Si la imagen ya pesa menos que esto, se sube sin tocar. */
  skipBelowBytes?: number;
}

const DEFAULTS: Required<OptimizeOptions> = {
  maxWidth: 1600,
  quality: 0.82,
  skipBelowBytes: 180 * 1024,
};

/** Formatos que no se recomprimen (animación o vector). */
const SKIP_TYPES = new Set(['image/gif', 'image/svg+xml']);

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Devuelve un archivo nuevo en WebP, redimensionado y comprimido.
 * Si algo falla o el resultado no mejora el original, devuelve el original.
 */
export async function optimizeImage(
  file: File,
  options: OptimizeOptions = {}
): Promise<File> {
  const opts = { ...DEFAULTS, ...options };

  if (!file.type.startsWith('image/') || SKIP_TYPES.has(file.type)) return file;
  if (file.size <= opts.skipBelowBytes) return file;
  if (typeof document === 'undefined') return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, opts.maxWidth / bitmap.width);
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', opts.quality)
    );
    if (!blob) return file;

    // Si comprimir no aporta nada (PNG plano, ya optimizado), se deja igual
    if (blob.size >= file.size * 0.95) return file;

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'imagen';
    return new File([blob], `${baseName}.webp`, {
      type: 'image/webp',
      lastModified: Date.now(),
    });
  } catch (error) {
    console.warn('[image] no se pudo optimizar, se sube el original:', error);
    return file;
  }
}
