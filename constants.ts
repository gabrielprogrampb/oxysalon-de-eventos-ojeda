
import { Space, GalleryItem, Inquiry, Transaction, Testimonial } from './types';

// Service Content Configuration
export const SERVICE_DETAILS = {
  decor: {
    title: "Diseño & Decoración",
    subtitle: "Atmósferas que cuentan historias",
    heroImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuCWbtWTIb1VosjmoszvhvN7WwPA7qDCRzcaLEAPZsMxVLq3MKrGEyjDaTQ5Da26F6D274qlehsa7JB9gApZSFsFe7vR8HwdETrXRk4ucLgYrNND88-ahYCAiTzNauGiZ6cjxXaTuRP8OrIXuAoy9ncy_NNRd6QM5GAI6iKwGHz_M0_6UaRT96Rk_IO0U-zbCS6hTEGrzhLVA_WBLZJxpCf3PGATVQbctQ3jaPFjhDRjFva2NLyJbUbhj9CoQjEs33jgS5FrVgSBdZI1",
    description: "Creemos que cada evento es una obra de arte viva. Nuestro equipo de diseñadores florales y arquitectos de interiores transforma espacios vacíos en universos visuales inmersivos, curando cada textura, color y punto de luz para evocar emociones profundas.",
    features: [
      { title: "Diseño Floral", desc: "Arreglos esculturales con flores importadas." },
      { title: "Mobiliario Avant-Garde", desc: "Piezas exclusivas de diseño contemporáneo." },
      { title: "Renderizado 3D", desc: "Visualiza tu evento antes de que suceda." },
      { title: "Table Styling", desc: "Vajilla, cristalería y mantelería de lujo." }
    ],
    gallery: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBK6B3DgepAzjJ2A0n0cpD-nla3U67EyaNbDbtkRhNa-23KrXB43SIm2zyBfnmXAw9PuclSf692RBrenk6-7jX2aMWoydLKj1Ox33Uf6CqWUSMp9k9DK85XmukmUgVQynSU00YzG5NiOdTfndAl2KLxnrbrv6uCdEka4SjBPlhBQW0k4QNSWG6A8L0oWml2BjjBX2CdydQFjrtnbksEOiWjn2j30NiTl4pNOxeiJUXwI3xX8lc8S3BnNnZjhSLSnjBfKxRqROran7mD",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBPaRdV4e_HKmzWZBXlxITL7TpYG13wE1wPQ7oOsjLyrn6P4JPCckGRgntUETkrB6d10GZrqkkkRbb7GKCdeUYA0zdH4DY9bz-2kg1q3XJURcNwid1QDblXw0H_vjcO5A7depT-3e2wpez7lmvf07X0usbBO11Gykrtal4Bq4BXb2cT87ht7C1qiAHZlpqXto-fjYKqelL1WCWuZI2oo01HBO2449lZNCaVcsHWK49lHqK_sGaLujK5oqXExGoMAXfHeCO2LXG3WC51",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCWbtWTIb1VosjmoszvhvN7WwPA7qDCRzcaLEAPZsMxVLq3MKrGEyjDaTQ5Da26F6D274qlehsa7JB9gApZSFsFe7vR8HwdETrXRk4ucLgYrNND88-ahYCAiTzNauGiZ6cjxXaTuRP8OrIXuAoy9ncy_NNRd6QM5GAI6iKwGHz_M0_6UaRT96Rk_IO0U-zbCS6hTEGrzhLVA_WBLZJxpCf3PGATVQbctQ3jaPFjhDRjFva2NLyJbUbhj9CoQjEs33jgS5FrVgSBdZI1"
    ]
  },
  tech: {
    title: "Producción Técnica",
    subtitle: "Impacto sensorial de alto nivel",
    heroImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuA64lWGVUXPBta19LZOBMoSswIP7fwpQfzhji2nVAeh3POwt1e6qoGrsgnMJPLd1PakYPNsTEKg9eMXER9OcDR90k6856IUrlaNxGNwuAgvZsXcz2DhHTTI3i4G9PAnMM59Kna2FOL6_SyaLxSDVaUPguYOQ8F_Oz6DQXOJQUfTQyt_guUJxsdnAVcWXIYEyRE-g1zv0AZII36M-tT9HsDJO3IjO2vZrDlUVG9w1pPdDKZZwccw0OwExn2Cj3bdcwzAHtSENApx-UhS",
    description: "La tecnología al servicio de la emoción. Nuestra infraestructura audiovisual es la columna vertebral de eventos inolvidables, combinando ingeniería de sonido de precisión con diseño de iluminación arquitectónica y robótica para crear momentos climáticos perfectos.",
    features: [
      { title: "Sonido Line Array", desc: "Acústica perfecta en cualquier punto del salón." },
      { title: "Iluminación Robótica", desc: "Diseño de atmósferas dinámicas y shows de luces." },
      { title: "Pantallas LED P2", desc: "Resolución ultra alta para contenido visual nítido." },
      { title: "Efectos Especiales", desc: "Humo bajo, pirotecnia fría y láseres." }
    ],
    gallery: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBMrgGUY5bQ7vT9AMSsVis4uNWo_qKEozr_X-icakJ35uh1UR975kNl8st8qWWZYVnZD-wIHXiUKS7SSD9XQMAB506XH17QjnDGbWnuV8f2MY4LBQSVIZBdUz3xhfKJEdWONraJHpZnixRgy9zCTljhbAISUBKipT22AYJqOlf00OQLck1zTeqGWFnaTkuEjglGoewakusLyeq3pLR9Nru0Q6Lj39VZ-Aij4-iG9uWDoqNuzT2_9OlZM3mmSjP2atke7zFdj40CkTjA",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA64lWGVUXPBta19LZOBMoSswIP7fwpQfzhji2nVAeh3POwt1e6qoGrsgnMJPLd1PakYPNsTEKg9eMXER9OcDR90k6856IUrlaNxGNwuAgvZsXcz2DhHTTI3i4G9PAnMM59Kna2FOL6_SyaLxSDVaUPguYOQ8F_Oz6DQXOJQUfTQyt_guUJxsdnAVcWXIYEyRE-g1zv0AZII36M-tT9HsDJO3IjO2vZrDlUVG9w1pPdDKZZwccw0OwExn2Cj3bdcwzAHtSENApx-UhS",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD-zXpaBHCbYl8UJYlqygJMGx3gdT0il88hrKtzg-GLoMC2MzD2xrDn1LtKR-LAp9xbNaoJ8V9tr5qNUCbn-Mm-vlzvP2z2Z_WiDqB0Rn8WHxjPTOGhjsmaUAxno-N-yV_yJ-vL5W9nvyyevRJhWSQQJQPtcccUrauG4n3FceztQ1t1obEC9jGnYMi5UN8mkwuBMY-r6XpiYoaMILz414HDQELdxa1p-DtD-ROkiIqFVCBsDprBwyuEz0B59AVAIZLjJExcQiYgv8dt"
    ]
  },
  bar: {
    title: "Barra Libre Premium",
    subtitle: "El arte de la mixología",
    heroImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuCGl2CoRsZ5-OU4NfQ9625UGylKJ5gWSH83o_27IgD0AM-QKM4Rg-silnIc0Ha3vswVyPSf6ApE2eB8Zd6P-aE7u9cMG5fZQhw60zup9pmcqcEfSpqO5bxWz72v3xqhgSexLv4w7K7vdQhCsq3PobyDDqK51SGguVaKIttQ8JHQgPpwuWVFPoizan7Fkie47_QGDYBGpTPxvnTcjzDvjZaMTzQ9wp4i5mnugwUiBW_uQB0AK0tVSCac5kAuCctTmd_mdHoeQvvV3K3-",
    description: "Elevamos el estándar de la hospitalidad. Nuestros mixólogos expertos no solo sirven bebidas; crean experiencias líquidas. Con una selección curada de licores top-shelf e ingredientes frescos y exóticos, nuestra barra se convierte en el centro social de tu celebración.",
    features: [
      { title: "Mixología de Autor", desc: "Cócteles diseñados exclusivamente para tu evento." },
      { title: "Licores Importados", desc: "Whisky 12+ años, Vodkas Premium, Ginebras Botánicas." },
      { title: "Glassware de Cristal", desc: "La copa perfecta para cada tipo de bebida." },
      { title: "Show Bartending", desc: "Flair y servicio espectáculo opcional." }
    ],
    gallery: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCGl2CoRsZ5-OU4NfQ9625UGylKJ5gWSH83o_27IgD0AM-QKM4Rg-silnIc0Ha3vswVyPSf6ApE2eB8Zd6P-aE7u9cMG5fZQhw60zup9pmcqcEfSpqO5bxWz72v3xqhgSexLv4w7K7vdQhCsq3PobyDDqK51SGguVaKIttQ8JHQgPpwuWVFPoizan7Fkie47_QGDYBGpTPxvnTcjzDvjZaMTzQ9wp4i5mnugwUiBW_uQB0AK0tVSCac5kAuCctTmd_mdHoeQvvV3K3-",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAmLe9vL2z4405_aSNMLLzxgTU1pY_7GdUnNsg5v9PTDhhryVU0oGckjTBVV0toYZ5ndXeWCYCW3WQI1lgPP_czIrc6No-EvsfPOTr1OSQOv8wBw_UteijZ9yQLYnYFbsqRX42QCwyZz036Knd1FfhEH62ozvnMZnDh1-VCGnMXwAqZF4vU44kHtMuzNxWFY8aCp7-5muwzu_BT0BGmD1Pa-2dtjKBiuIjh5D-gc3IUd9ZIJvC5k07R69H56E0OLlLtD4SK6SMsm4qV",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB0bDgtrKI_TUOe4hWGIwnlE62qmvdCJIb-jSQpQO7tBsLejPgvcvMUuqcxvXciCONgzXRqOXK6u3I_acK66lAwOIxSnQ19Uk9caRnFOOeqpZLvOFKtaVWPug2TmTQXbX62gfI42mKlbqww6NnWn1BfhAXoj6SFRoPAdn530TbmCzFioD_nJ5ccpZYZpot7tbt0wHGhi6co2quJGgO5wc0dnSuOy_EvqhvyIgDvm6v1GtsYh9tBhaHDs7-2w6uXgTZAtCZNt9c_aeyZ"
    ]
  }
};

export const SPACES: Space[] = [
  {
    id: 1,
    name: "El Gran Salón de Baile",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDwDlq3l0_l6efrFfNfvSlojfptK78NpCaP_5vYGjAYJ7ze85bgWUg0ETA8SwlqQ4YeaA40DjhgKN1pqJ2S_O83HIfgRiG2ZwavG2AyAQiH11WcCK_wt-Xtuba9zQ_bbUnrBlRsMHRpAnw_yc13YJtVEPSdH1511ATfRWriAiS2C7MRHpJGV3YiSN62Zk-UXeHG4jXQDaqrwsn_HdThmnAdyS56-tS2jQxWO7XHi388wDwwp4Srd1EWKk20UDvmuZMWgngA2rYS81eh",
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
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD-zXpaBHCbYl8UJYlqygJMGx3gdT0il88hrKtzg-GLoMC2MzD2xrDn1LtKR-LAp9xbNaoJ8V9tr5qNUCbn-Mm-vlzvP2z2Z_WiDqB0Rn8WHxjPTOGhjsmaUAxno-N-yV_yJ-vL5W9nvyyevRJhWSQQJQPtcccUrauG4n3FceztQ1t1obEC9jGnYMi5UN8mkwuBMY-r6XpiYoaMILz414HDQELdxa1p-DtD-ROkiIqFVCBsDprBwyuEz0B59AVAIZLjJExcQiYgv8dt",
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
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCWbtWTIb1VosjmoszvhvN7WwPA7qDCRzcaLEAPZsMxVLq3MKrGEyjDaTQ5Da26F6D274qlehsa7JB9gApZSFsFe7vR8HwdETrXRk4ucLgYrNND88-ahYCAiTzNauGiZ6cjxXaTuRP8OrIXuAoy9ncy_NNRd6QM5GAI6iKwGHz_M0_6UaRT96Rk_IO0U-zbCS6hTEGrzhLVA_WBLZJxpCf3PGATVQbctQ3jaPFjhDRjFva2NLyJbUbhj9CoQjEs33jgS5FrVgSBdZI1",
    title: "Montaje de Mesa",
    category: "Bodas",
    type: "wide",
    likes: 42
  },
  {
    id: 2,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBK6B3DgepAzjJ2A0n0cpD-nla3U67EyaNbDbtkRhNa-23KrXB43SIm2zyBfnmXAw9PuclSf692RBrenk6-7jX2aMWoydLKj1Ox33Uf6CqWUSMp9k9DK85XmukmUgVQynSU00YzG5NiOdTfndAl2KLxnrbrv6uCdEka4SjBPlhBQW0k4QNSWG6A8L0oWml2BjjBX2CdydQFjrtnbksEOiWjn2j30NiTl4pNOxeiJUXwI3xX8lc8S3BnNnZjhSLSnjBfKxRqROran7mD",
    title: "Cena de Gala",
    category: "Corporativo",
    likes: 128,
    type: "wide"
  },
  {
    id: 3,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCl1NzY6VUOSldPKrsuZEBg89MFr0RusTU6jMiAReDnvyqwrlw0cPVOFocbmALoig-oHijX5EuIrjJv_vpRBmcOO2L0eaFzlodxDLhstdiNzSQiGIgUbl1Czhm3FCWZsXNv74GW1o8Cv9k0tFDGrOBUFBfbx2ktG2pAymyz5IKfpsm6_pLShA8eAbPG8GrfS3LpVEz5xpZ8w0u6kaOGX043fT9MKuR5gmjtPdlewu2y3X0hIFGP9NsnlyoySAd1Z0hwKLMRF_nqU0uW",
    title: "Detalles Florales",
    category: "Decoración",
    featured: true,
    type: "tall",
    likes: 256
  },
  {
    id: 4,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBPaRdV4e_HKmzWZBXlxITL7TpYG13wE1wPQ7oOsjLyrn6P4JPCckGRgntUETkrB6d10GZrqkkkRbb7GKCdeUYA0zdH4DY9bz-2kg1q3XJURcNwid1QDblXw0H_vjcO5A7depT-3e2wpez7lmvf07X0usbBO11Gykrtal4Bq4BXb2cT87ht7C1qiAHZlpqXto-fjYKqelL1WCWuZI2oo01HBO2449lZNCaVcsHWK49lHqK_sGaLujK5oqXExGoMAXfHeCO2LXG3WC51",
    title: "Iluminación Escénica",
    category: "Tecnología",
    type: "wide",
    likes: 84
  },
  {
    id: 5,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBHQzbdraNXpAtG1QymVHGbuD1d70DwmkCTYYZKwaUKMzE-XQ2Xk-ZJqunM99P74GWm5QnXiB093fkphSJsM2OpDHCZju5TfPED5H7219p5gKUCoFYRVuRb7Si-LeOUvwCkrNPw5dm3KbiJU2RqgosRk0iJcB2BvkVYnkUJPWuSCVwqDcxjk-f9hr8VSwjDDfijRKLjHIpgBQHAe-6IDkO_OinEGmHl7B3Quf1MF4fMSd7kJpKy1E6uIzNPVrQZ8E2XXXIDukqAPaeD",
    title: "Cocktail Bar",
    category: "Bebidas",
    likes: 195,
    type: "tall"
  },
  {
    id: 6,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBMrgGUY5bQ7vT9AMSsVis4uNWo_qKEozr_X-icakJ35uh1UR975kNl8st8qWWZYVnZD-wIHXiUKS7SSD9XQMAB506XH17QjnDGbWnuV8f2MY4LBQSVIZBdUz3xhfKJEdWONraJHpZnixRgy9zCTljhbAISUBKipT22AYJqOlf00OQLck1zTeqGWFnaTkuEjglGoewakusLyeq3pLR9Nru0Q6Lj39VZ-Aij4-iG9uWDoqNuzT2_9OlZM3mmSjP2atke7zFdj40CkTjA",
    title: "Evento Social",
    category: "Bodas",
    type: "wide",
    likes: 67
  },
  {
    id: 7,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAmLe9vL2z4405_aSNMLLzxgTU1pY_7GdUnNsg5v9PTDhhryVU0oGckjTBVV0toYZ5ndXeWCYCW3WQI1lgPP_czIrc6No-EvsfPOTr1OSQOv8wBw_UteijZ9yQLYnYFbsqRX42QCwyZz036Knd1FfhEH62ozvnMZnDh1-VCGnMXwAqZF4vU44kHtMuzNxWFY8aCp7-5muwzu_BT0BGmD1Pa-2dtjKBiuIjh5D-gc3IUd9ZIJvC5k07R69H56E0OLlLtD4SK6SMsm4qV",
    title: "Salón Principal",
    category: "Salones",
    type: "wide",
    likes: 15
  }
];

export const INQUIRIES: Inquiry[] = [
  {
    id: 1,
    name: "Sarah Jenkins",
    email: "sarah.j@example.com",
    phone: "584121234567",
    instagram: "sarahjenkins",
    telegram: "sarah_events",
    initials: "SJ",
    initialsColor: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    type: "Cotización de Boda",
    message: "Hola, busco reservar el gran salón para una recepción de boda el 15 de junio. ¿Podrían enviarme los paquetes de precios?",
    spaceOfInterest: "El Gran Salón de Baile",
    time: "hace 2 min",
    status: "New",
    statusColor: "bg-primary/20 text-primary",
    value: 4500
  },
  {
    id: 2,
    name: "TechCorp Inc.",
    email: "events@techcorp.com",
    phone: "584145550000",
    company: "Fiesta Corporativa",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB0bDgtrKI_TUOe4hWGIwnlE62qmvdCJIb-jSQpQO7tBsLejPgvcvMUuqcxvXciCONgzXRqOXK6u3I_acK66lAwOIxSnQ19Uk9caRnFOOeqpZLvOFKtaVWPug2TmTQXbX62gfI42mKlbqww6NnWn1BfhAXoj6SFRoPAdn530TbmCzFioD_nJ5ccpZYZpot7tbt0wHGhi6co2quJGgO5wc0dnSuOy_EvqhvyIgDvm6v1GtsYh9tBhaHDs7-2w6uXgTZAtCZNt9c_aeyZ",
    type: "Fiesta Navideña",
    message: "Estamos interesados en organizar nuestra fiesta anual en su sede. Esperamos alrededor de 150 invitados.",
    spaceOfInterest: "Salón Ejecutivo",
    time: "hace 1 h",
    status: "Replied",
    statusColor: "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300",
    value: 8200
  },
  {
    id: 3,
    name: "Mike Ross",
    email: "m.ross@law.com",
    phone: "584249991122",
    instagram: "mikeross",
    telegram: "+584249991122",
    initials: "MR",
    initialsColor: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    type: "Consulta Disponibilidad",
    message: "Solo confirmando la fecha para el lanzamiento del producto. El contrato ha sido firmado.",
    time: "hace 1 día",
    status: "Booked",
    statusColor: "bg-green-500/10 text-green-500",
    value: 12500
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    text: "La sede fue impresionante y el personal absolutamente increíble. Hicieron que nuestra noche especial fuera verdaderamente mágica. Cada detalle fue perfecto.",
    author: "Sarah Jenkins",
    event: "Boda, Oct 2023",
    rating: 5,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCnt4aOss6OtpEcyJqTDlpq9rBo4MxTa_PrkbhePtxD97RIAsaHW4Y-NuMSpb4IW4LW0eJkTRLr5d3ro-qkVnHZR2_QreFDeRAFOfY3zNRJP331JcOB0dLNd3aFzq8xITGy6DTkLTEFZiqG2j-Zz7zKeSkjJZohCf_r7QK0iK-Zh6QOE6tj7ecB3tRzXslhNpSKKp1YPv2sBIGWXZC5jNk78rpRZ82pxk_JAmClpHqQXwNdYPPCTuNeVI2LdGhNbNz-T0-01muPPa41"
  },
  {
    id: 2,
    text: "Organizamos nuestra gala corporativa aquí y superó todas las expectativas. La tecnología AV, el catering y el servicio fueron impecables de principio a fin.",
    author: "David Chen",
    event: "Gala TechCorp, Dic 2023",
    rating: 5,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB0bDgtrKI_TUOe4hWGIwnlE62qmvdCJIb-jSQpQO7tBsLejPgvcvMUuqcxvXciCONgzXRqOXK6u3I_acK66lAwOIxSnQ19Uk9caRnFOOeqpZLvOFKtaVWPug2TmTQXbX62gfI42mKlbqww6NnWn1BfhAXoj6SFRoPAdn530TbmCzFioD_nJ5ccpZYZpot7tbt0wHGhi6co2quJGgO5wc0dnSuOy_EvqhvyIgDvm6v1GtsYh9tBhaHDs7-2w6uXgTZAtCZNt9c_aeyZ"
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 1, title: 'Pago Inicial Boda S.J.', amount: 4500, type: 'income', category: 'Reservas', date: '2026-05-15', status: 'completed' },
  { id: 2, title: 'Compra Flores Importadas', amount: 1200, type: 'expense', category: 'Materiales', date: '2026-05-14', status: 'completed' },
  { id: 3, title: 'Mantenimiento Luces', amount: 350, type: 'expense', category: 'Mantenimiento', date: '2026-05-12', status: 'completed' },
  { id: 4, title: 'Evento Corp. TechCorp', amount: 8200, type: 'income', category: 'Eventos', date: '2026-05-10', status: 'completed' }
];
