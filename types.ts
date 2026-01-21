
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

export interface GalleryItem {
  id: number;
  image: string;
  title?: string;
  category?: string; // New field for filtering
  subtitle?: string;
  featured?: boolean;
  likes: number; // Changed from boolean to number for counter
  type: 'wide' | 'tall' | 'square';
}

export interface Inquiry {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  instagram?: string;
  telegram?: string;
  company?: string;
  avatar?: string;
  initials?: string;
  initialsColor?: string;
  type: string;
  message: string;
  spaceOfInterest?: string; // New field for selected space
  time: string;
  status?: 'New' | 'Replied' | 'Booked';
  statusColor?: string;
  value?: number; // New field for financial management (Quote amount)
}

export interface Transaction {
  id: number;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  status: 'completed' | 'pending';
}

export interface Testimonial {
  id: number;
  text: string;
  author: string;
  event: string;
  rating: number;
  image: string;
}

export interface CalendarEvent {
  id: string;
  date: string; // ISO string YYYY-MM-DD
  status: 'booked' | 'maintenance' | 'hold';
  title?: string;
  timeStart?: string;
  timeEnd?: string;
}
