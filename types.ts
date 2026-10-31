// =============================================================================
// Tipos de dominio (camelCase). La base de datos usa snake_case y la capa
// src/lib/store.ts hace la conversión. No cambiar sin actualizar el store.
// =============================================================================

export interface Space {
  id: number;
  name: string;
  image: string;
  price: string;
  guests: number;
  sqft?: number;
  tag: string;
  icon: string;
  description?: string;
  features?: string[];
}

export type GalleryType = 'wide' | 'tall' | 'square';

/**
 * Una foto dentro de un tema de la galería.
 * Cada foto lleva su propio título, descripción, texto alternativo y enlace,
 * porque dentro de un mismo tema las imágenes cuentan cosas distintas.
 */
export interface GalleryPhoto {
  id: number;
  itemId: number;
  image: string;
  title?: string;
  description?: string;
  /** Texto alternativo para lectores de pantalla y SEO. */
  alt?: string;
  /** Enlace opcional al pulsar la foto. */
  link?: string;
  sortOrder: number;
}

export interface GalleryItem {
  id: number;
  createdAt?: string;
  image: string;
  title?: string;
  category?: string;
  type: GalleryType;
  likes: number;
  featured?: boolean;
  published?: boolean;
  /** Fotos del tema, en orden. Si viene vacío se usa `image`. */
  photos?: GalleryPhoto[];
}

export type InquiryStatus = 'new' | 'contacted' | 'quoted' | 'booked' | 'lost';

export interface Inquiry {
  id: number;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  instagram?: string | null;
  telegram?: string | null;
  eventType?: string | null;
  eventDate?: string | null;
  guestsRange?: string | null;
  spaceInterest?: string | null;
  message?: string | null;
  status: InquiryStatus;
  value?: number | null;
  notes?: string | null;
  source?: string;
}

/** Datos que envía el formulario público. */
export interface InquiryInput {
  name: string;
  email: string;
  phone: string;
  instagram?: string;
  telegram?: string;
  eventType?: string;
  eventDate?: string;
  guestsRange?: string;
  spaceInterest?: string;
  message?: string;
}

export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'completed' | 'pending';

export interface Transaction {
  id: number;
  createdAt?: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  status: TransactionStatus;
  inquiryId?: number | null;
}

export interface Testimonial {
  id: number;
  text: string;
  author: string;
  event: string;
  rating: number;
  image: string;
}

export type CalendarStatus = 'booked' | 'hold' | 'maintenance';

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  status: CalendarStatus;
  title?: string;
  timeStart?: string;
  timeEnd?: string;
}
