
import { Space, GalleryItem, Inquiry, Transaction, Testimonial } from './types';

// Service Content Configuration
export const SERVICE_DETAILS = {
  decor: {
    title: "Diseño & Decoración",
    subtitle: "Atmósferas que cuentan historias",
    heroImage: "/images/oxy/img-31000bf958a9.webp",
    description: "Creemos que cada evento es una obra de arte viva. Nuestro equipo de diseñadores florales y arquitectos de interiores transforma espacios vacíos en universos visuales inmersivos, curando cada textura, color y punto de luz para evocar emociones profundas.",
    features: [
      { title: "Diseño Floral", desc: "Arreglos esculturales con flores importadas." },
      { title: "Mobiliario Avant-Garde", desc: "Piezas exclusivas de diseño contemporáneo." },
      { title: "Renderizado 3D", desc: "Visualiza tu evento antes de que suceda." },
      { title: "Table Styling", desc: "Vajilla, cristalería y mantelería de lujo." }
    ],
    gallery: [
      "/images/oxy/img-20dd57a02f43.webp",
      "/images/oxy/img-369b9401311e.webp",
      "/images/oxy/img-31000bf958a9.webp"
    ]
  },
  tech: {
    title: "Producción Técnica",
    subtitle: "Impacto sensorial de alto nivel",
    heroImage: "/images/oxy/img-507d9b401ccc.webp",
    description: "La tecnología al servicio de la emoción. Nuestra infraestructura audiovisual es la columna vertebral de eventos inolvidables, combinando ingeniería de sonido de precisión con diseño de iluminación arquitectónica y robótica para crear momentos climáticos perfectos.",
    features: [
      { title: "Sonido Line Array", desc: "Acústica perfecta en cualquier punto del salón." },
      { title: "Iluminación Robótica", desc: "Diseño de atmósferas dinámicas y shows de luces." },
      { title: "Pantallas LED P2", desc: "Resolución ultra alta para contenido visual nítido." },
      { title: "Efectos Especiales", desc: "Humo bajo, pirotecnia fría y láseres." }
    ],
    gallery: [
      "/images/oxy/img-f54ceb1e4977.webp",
      "/images/oxy/img-507d9b401ccc.webp",
      "/images/oxy/img-d8408533df3e.webp"
    ]
  },
  bar: {
    title: "Barra Libre Premium",
    subtitle: "El arte de la mixología",
    heroImage: "/images/oxy/img-e44d09aa75df.webp",
    description: "Elevamos el estándar de la hospitalidad. Nuestros mixólogos expertos no solo sirven bebidas; crean experiencias líquidas. Con una selección curada de licores top-shelf e ingredientes frescos y exóticos, nuestra barra se convierte en el centro social de tu celebración.",
    features: [
      { title: "Mixología de Autor", desc: "Cócteles diseñados exclusivamente para tu evento." },
      { title: "Licores Importados", desc: "Whisky 12+ años, Vodkas Premium, Ginebras Botánicas." },
      { title: "Glassware de Cristal", desc: "La copa perfecta para cada tipo de bebida." },
      { title: "Show Bartending", desc: "Flair y servicio espectáculo opcional." }
    ],
    gallery: [
      "/images/oxy/img-e44d09aa75df.webp",
      "/images/oxy/img-aa62b78e00a6.webp",
      "/images/oxy/img-25597864f1fc.webp"
    ]
  }
};

export const SPACES: Space[] = [
  {
    id: 1,
    name: "El Gran Salón de Baile",
    image: "/images/oxy/img-903bf12d1b34.webp",
    price: "$$$",
    guests: 300,
    sqft: 5000,
    tag: "Interior",
    icon: "square_foot",
    description: "La joya de la corona de Oxysalon. Un espacio majestuoso con techos de doble altura, candelabros de cristal importado y una pista de baile de mármol pulido. Perfecto para bodas de ensueño y galas corporativas de alto impacto.",
    features: ["Techos de 6 metros", "Iluminación Inteligente", "Escenario Modular", "Camerinos Privados"]
  },
  {
    id: 4,
    name: "Salón Ejecutivo",
    image: "/images/oxy/img-d8408533df3e.webp",
    price: "$$",
    guests: 50,
    sqft: 1200,
    tag: "Privado",
    icon: "meeting_room",
    description: "Discreción y elegancia para reuniones corporativas, cenas diplomáticas o celebraciones íntimas. Equipado con tecnología audiovisual de última generación y mobiliario ergonómico de lujo.",
    features: ["Pantalla LED 4K", "Sistema de Conferencia", "Servicio de Café Premium", "Aislación Acústica"]
  }
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 1,
    image: "/images/oxy/img-31000bf958a9.webp",
    title: "Montaje de Mesa",
    category: "Bodas",
    type: "wide",
    likes: 42
  },
  {
    id: 2,
    image: "/images/oxy/img-20dd57a02f43.webp",
    title: "Cena de Gala",
    category: "Corporativo",
    likes: 128,
    type: "wide"
  },
  {
    id: 3,
    image: "/images/oxy/img-928e542805f9.webp",
    title: "Detalles Florales",
    category: "Decoración",
    featured: true,
    type: "tall",
    likes: 256
  },
  {
    id: 4,
    image: "/images/oxy/img-369b9401311e.webp",
    title: "Iluminación Escénica",
    category: "Tecnología",
    type: "wide",
    likes: 84
  },
  {
    id: 5,
    image: "/images/oxy/img-f88be43766e4.webp",
    title: "Cocktail Bar",
    category: "Bebidas",
    likes: 195,
    type: "tall"
  },
  {
    id: 6,
    image: "/images/oxy/img-f54ceb1e4977.webp",
    title: "Evento Social",
    category: "Bodas",
    type: "wide",
    likes: 67
  },
  {
    id: 7,
    image: "/images/oxy/img-aa62b78e00a6.webp",
    title: "Salón Principal",
    category: "Salones",
    type: "wide",
    likes: 15
  }
];

// Datos de ejemplo SOLO para el modo demostración (sin Supabase configurado).
// En producción estas filas viven en la tabla `inquiries`.
export const INQUIRIES: Inquiry[] = [
  {
    id: 1,
    createdAt: '2026-10-27T14:32:00.000Z',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    phone: '+58 412-1234567',
    instagram: 'sarahjenkins',
    telegram: 'sarah_events',
    eventType: 'Boda',
    eventDate: '2026-12-15',
    guestsRange: '150 - 250',
    spaceInterest: 'El Gran Salón de Baile',
    message:
      'Hola, busco reservar el gran salón para una recepción de boda el 15 de diciembre. ¿Podrían enviarme los paquetes de precios?',
    status: 'new',
    value: 4500,
    source: 'web',
  },
  {
    id: 2,
    createdAt: '2026-10-27T11:05:00.000Z',
    name: 'TechCorp Inc.',
    email: 'events@techcorp.com',
    phone: '+58 414-5550000',
    eventType: 'Corporativo',
    eventDate: '2026-11-20',
    guestsRange: '100 - 150',
    spaceInterest: 'Salón Ejecutivo',
    message:
      'Estamos interesados en organizar nuestra fiesta anual en su sede. Esperamos alrededor de 150 invitados.',
    status: 'contacted',
    value: 8200,
    source: 'web',
  },
  {
    id: 3,
    createdAt: '2026-10-26T18:40:00.000Z',
    name: 'Mike Ross',
    email: 'm.ross@law.com',
    phone: '+58 424-9991122',
    instagram: 'mikeross',
    eventType: 'Corporativo',
    eventDate: '2026-11-05',
    guestsRange: '50 - 100',
    spaceInterest: 'El Gran Salón de Baile',
    message: 'Solo confirmando la fecha para el lanzamiento del producto. El contrato ha sido firmado.',
    status: 'booked',
    value: 12500,
    source: 'web',
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    text: "La sede fue impresionante y el personal absolutamente increíble. Hicieron que nuestra noche especial fuera verdaderamente mágica. Cada detalle fue perfecto.",
    author: "Sarah Jenkins",
    event: "Boda, Oct 2023",
    rating: 5,
    image: "/images/oxy/img-4c3093b10c97.webp"
  },
  {
    id: 2,
    text: "Organizamos nuestra gala corporativa aquí y superó todas las expectativas. La tecnología AV, el catering y el servicio fueron impecables de principio a fin.",
    author: "David Chen",
    event: "Gala TechCorp, Dic 2023",
    rating: 5,
    image: "/images/oxy/img-25597864f1fc.webp"
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 1, title: 'Pago Inicial Boda S.J.', amount: 4500, type: 'income', category: 'Reservas', date: '2026-05-15', status: 'completed' },
  { id: 2, title: 'Compra Flores Importadas', amount: 1200, type: 'expense', category: 'Materiales', date: '2026-05-14', status: 'completed' },
  { id: 3, title: 'Mantenimiento Luces', amount: 350, type: 'expense', category: 'Mantenimiento', date: '2026-05-12', status: 'completed' },
  { id: 4, title: 'Evento Corp. TechCorp', amount: 8200, type: 'income', category: 'Eventos', date: '2026-05-10', status: 'completed' }
];
