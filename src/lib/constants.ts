import type { GalleryType, InquiryStatus } from '../../types';

export const GALLERY_CATEGORIES = [
  'Bodas',
  'Corporativo',
  'Decoración',
  'Tecnología',
  'Bebidas',
  'Salones',
  'Exterior',
  'Otros',
] as const;

export const GALLERY_TYPES: { value: GalleryType; label: string }[] = [
  { value: 'wide', label: 'Horizontal' },
  { value: 'tall', label: 'Vertical' },
  { value: 'square', label: 'Cuadrado' },
];

export const TRANS_CATEGORIES = [
  'General',
  'Reservas',
  'Eventos',
  'Materiales',
  'Mantenimiento',
  'Personal',
] as const;

export const INQUIRY_STATUSES: InquiryStatus[] = ['new', 'contacted', 'quoted', 'booked', 'lost'];

export const EVENT_TYPES = [
  'Boda',
  '15 Años',
  'Corporativo',
  'Cumpleaños',
  'Bautizo / Primera Comunión',
  'Otro',
] as const;

export const GUESTS_RANGES = [
  'Menos de 50',
  '50 - 100',
  '100 - 150',
  '150 - 250',
  'Más de 250',
] as const;
