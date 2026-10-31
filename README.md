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
| Panel administrativo | ✅ Login real, agenda, finanzas, galería por temas, buzón, analítica, actividad y configuración |
| Galería | ✅ Temas con varias fotos, título, descripción, alt y enlace; carrusel en el sitio |
| Base de datos y permisos (RLS) | ✅ Listo (`supabase/migrations/0001_init.sql`) |
| Auditoría de cambios | ✅ Listo (`0003_console.sql`: quién cambió qué) |
| Seguridad (CSP, headers, auth) | ✅ Listo (`vercel.json`) |
| SEO técnico (meta, OG, JSON-LD, sitemap) | ✅ Listo |
| Imágenes | ✅ Locales y optimizadas en WebP |
| Pruebas automatizadas | ✅ 32 pruebas unitarias (`npm test`) |
| Integración continua | ✅ GitHub Actions (`.github/workflows/ci.yml`) |
| Datos de contacto y redes | ⚠️ Pendiente: completar `src/config/site.ts` |
| Fotos reales del salón | ⚠️ Pendiente: reemplazar las de referencia |

> Detalle de cada pendiente en [`docs/PUESTA-EN-MARCHA.md`](docs/PUESTA-EN-MARCHA.md).
> Despliegue, reversión, respaldos e incidentes en [`docs/OPERACION.md`](docs/OPERACION.md).

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
| `npm run typecheck` | Verifica tipos (modo estricto) sin compilar |
| `npm run lint` | Revisa errores reales de código (ESLint) |
| `npm run test` | Ejecuta las pruebas unitarias (Vitest) |
| `npm run test:e2e` | Compila y ejecuta las pruebas end-to-end (Playwright) |
| `npm run test:e2e:report` | Abre el reporte HTML del último run E2E |
| `npm run verify` | **Puerta de salida:** tipos + lint + pruebas + build |
| `npm run check:env` | Comprueba que las claves de Supabase existan antes de desplegar |
| `npm run capturas` | Regenera todas las capturas en `docs/capturas/` (requiere `npm run preview` activo) |
| `npm run images` | Re-descarga y optimiza imágenes externas a WebP |
| `npm run backup` | Respaldo JSON de las tablas a `backups/` (requiere service_role) |

Antes de publicar, `npm run verify` debe pasar completo. Es el mismo comando que
ejecuta la integración continua en cada push.

## Estructura

```
├── index.html                 Meta, OG, JSON-LD, fuentes
├── App.tsx                    Rutas, rutas protegidas, tracking de visitas
├── pages/                     Vistas públicas + login
├── components/                Nav, footer, calendario, carrusel
├── constants.ts               Contenido base (espacios, servicios, testimonios)
├── src/
│   ├── config/site.ts         ⭐ Datos del negocio (único archivo a editar)
│   ├── ui/                    Sistema de diseño: botones, campos, tablas, gráficas
│   ├── admin/
│   │   ├── AdminLayout.tsx    Barra lateral, encabezados, tarjetas de métrica
│   │   └── pages/             Resumen, solicitudes, agenda, finanzas, galería,
│   │                          analítica, actividad, configuración
│   ├── lib/
│   │   ├── supabase.ts        Cliente Supabase (o null en modo demo)
│   │   ├── store.ts           Capa de datos: toda la app pasa por aquí
│   │   ├── admin.ts           Consultas paginadas, analítica, auditoría, salud
│   │   ├── auth.tsx           Sesión + verificación de rol admin
│   │   ├── theme.tsx          Modo claro / oscuro / sistema
│   │   ├── app-errors.tsx     ErrorBoundary + aviso de sin conexión
│   │   ├── validation.ts      Reglas del formulario (probadas)
│   │   ├── useAsync.ts        Carga con estados loading / error / vacío
│   │   └── format.ts          Moneda, fechas, estados
│   └── index.css              Tailwind + estilos base
├── supabase/
│   ├── migrations/0001_init.sql      Tablas, RLS, storage, RPC
│   ├── migrations/0002_maintenance.sql
│   ├── migrations/0003_console.sql   Roles, auditoría, métricas, salud
│   ├── migrations/0004_profile_gallery.sql  Perfil editable + fotos por tema
│   ├── migrations/0005_venue.sql     Sede del evento (tres sedes)
│   └── functions/notify-inquiry/     Aviso por correo (opcional)
├── e2e/                       Pruebas end-to-end (Playwright)
├── .github/workflows/ci.yml   Tipos + lint + unitarias + build + E2E
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

## Documentación y material comercial

| Archivo | Contenido |
|---------|-----------|
| `docs/GUIA-LANZAMIENTO.md` | **Paso a paso clic por clic** para publicar (Supabase, Vercel, datos y fotos) |
| `docs/DESPLIEGUE.md` | **Qué plataforma elegir** (Cloudflare, Netlify, Vercel) y cómo publicar |
| `docs/OPERACION.md` | Despliegue, reversión, respaldos, incidentes y checklist de lanzamiento |
| `docs/PUESTA-EN-MARCHA.md` | Paso a paso para crear las cuentas gratis y publicar |
| `docs/LIMITES-Y-RESPALDOS.md` | **¿Se llena la base?** Números reales, Google Drive y qué hacer si crece |
| `docs/MANTENIMIENTO.md` | Límites del plan gratis, respaldos y rutina mensual |
| `docs/PROPUESTA-COMERCIAL.md` | Mensajes de venta, cómo presentar las capturas y objeciones |
| `docs/PRECIOS-Y-CIERRE.md` | Precios para el mercado local, formas de pago y guion de cierre |
| `docs/MENSAJE-OXY.md` | Versiones cortas del mensaje (WhatsApp, Instagram, correo) |
| `docs/presentacion.html` | Presentación navegable (abrir en el navegador o guardar como PDF) |
| `docs/capturas/` | 31 capturas del build de producción (escritorio y móvil) |

## Calidad y verificación

| Comprobación | Herramienta | Estado |
|--------------|-------------|--------|
| Tipos en modo estricto | `tsc --noEmit` | ✅ 0 errores |
| Lint | ESLint 9 + TypeScript | ✅ 0 errores, 0 advertencias |
| Pruebas unitarias | Vitest (32 pruebas) | ✅ Validación del formulario, formato y sesión anónima |
| Pruebas end-to-end | Playwright (42 escritorio + 30 móvil) | ✅ Cotización, panel, perfil, galería con carrusel, 404/403/500 |
| Accesibilidad automatizada | Playwright | ✅ Idioma, alt, nombres accesibles, orden de encabezados, foco visible |
| Build de producción | Vite 7 | ✅ Code-splitting por ruta |
| Integración continua | GitHub Actions | ✅ Tipos + lint + unitarias + build + E2E en cada push y PR |

Las pruebas cubren la lógica que puede fallar en silencio: reglas de validación,
formato de fechas y moneda, deduplicación de sesión y anti-bot. Lo visual se
revisa con las capturas de `docs/capturas/`, generadas desde el build real.

**Deuda técnica conocida:** no hay pruebas de carga ni auditoría con lector de
pantalla real (NVDA/VoiceOver). La accesibilidad se verifica con reglas
automatizadas; el contraste medido y la navegación con lector quedan como
revisión manual antes de cada cambio grande de diseño.

## Licencia

Código propietario. Preparado para entrega al cliente con cesión de uso según contrato.
