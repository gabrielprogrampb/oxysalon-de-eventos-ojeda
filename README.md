# Oxysalon de Eventos Ojeda — Sitio web + Panel de reservas

Sitio web para el salón de eventos, con formulario de cotización real, agenda de
disponibilidad pública y panel administrativo protegido.

**Stack:** React 19 + Vite 6 + TypeScript + Tailwind CSS 3 · Supabase (Postgres + Auth + Storage) · Vercel.

**Costo de operación:** 0 USD/mes (planes gratuitos de Supabase y Vercel).

---

## Estado actual

| Área | Estado |
|------|--------|
| Diseño y responsive | ✅ Listo |
| Formulario de cotización | ✅ Funcional (guarda en base de datos) |
| Panel administrativo | ✅ Login real, agenda, finanzas, galería, buzón |
| Base de datos y permisos (RLS) | ✅ Listo (`supabase/migrations/0001_init.sql`) |
| Seguridad (CSP, headers, auth) | ✅ Listo (`vercel.json`) |
| SEO técnico (meta, OG, JSON-LD, sitemap) | ✅ Listo |
| Imágenes | ✅ Locales y optimizadas en WebP |
| Datos de contacto y redes | ⚠️ Pendiente: completar `src/config/site.ts` |
| Fotos reales del salón | ⚠️ Pendiente: reemplazar las de referencia |

> Detalle de cada pendiente en [`docs/PUESTA-EN-MARCHA.md`](docs/PUESTA-EN-MARCHA.md).

---

## Arranque local

```bash
npm install
cp .env.example .env.local   # completar con las claves de Supabase
npm run dev                  # http://localhost:3000
```

Sin `.env.local` el sitio funciona en **modo demostración**: se ve todo, pero las reservas y
el panel guardan solo en el navegador de quien lo use. Sirve para revisar diseño, no para vender.

## Scripts

| Comando | Qué hace |
|---------|----------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build local para revisarlo |
| `node scripts/localize-images.mjs` | Re-descarga y optimiza imágenes externas a WebP |

## Estructura

```
├── index.html                 Meta, OG, JSON-LD, fuentes
├── App.tsx                    Rutas, rutas protegidas, tracking de visitas
├── pages/                     Vistas públicas + panel
├── components/                Nav, footer, calendario, carrusel
├── constants.ts               Contenido base (espacios, servicios, testimonios)
├── src/
│   ├── config/site.ts         ⭐ Datos del negocio (único archivo a editar)
│   ├── lib/supabase.ts        Cliente Supabase (o null en modo demo)
│   ├── lib/store.ts           Capa de datos: toda la app pasa por aquí
│   ├── lib/auth.tsx           Sesión + verificación de rol admin
│   ├── lib/format.ts          Moneda, fechas, estados
│   └── index.css              Tailwind + estilos base
├── supabase/
│   ├── migrations/0001_init.sql   Tablas, RLS, storage, RPC
│   └── functions/notify-inquiry/  Aviso por correo (opcional)
└── vercel.json                Headers de seguridad y rewrites
```

## Seguridad (resumen)

- **Login real** con Supabase Auth. No hay contraseñas en el código.
- **Doble verificación:** tener sesión no basta; el usuario debe existir en la tabla `admins`.
- **RLS en todas las tablas:** el público solo puede *insertar* solicitudes y *leer* contenido publicado.
- **La agenda pública no filtra datos:** se lee de la vista `calendar_public` (solo fecha y estado).
- **Subida de imágenes** validada por tipo y tamaño (máx. 5 MB), con bucket de escritura solo para admin.
- **Headers:** CSP, HSTS, Permissions-Policy, `noindex` en `/dashboard` y `/login`.
- **Anti-spam** en el formulario: honeypot + validación temporal + límites de longitud en la base.

## Licencia

Código propietario. Preparado para entrega al cliente con cesión de uso según contrato.
