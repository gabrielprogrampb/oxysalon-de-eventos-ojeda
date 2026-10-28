# Puesta en marcha — de cero a producción en ~45 minutos

Guía operativa. Todo lo de aquí es **gratis** (planes free de Supabase y Vercel).

---

## Resumen de tareas

| # | Tarea | Quién | Tiempo |
|---|-------|-------|--------|
| 1 | Crear proyecto en Supabase y ejecutar el SQL | Tú | 10 min |
| 2 | Crear el usuario administrador | Tú | 3 min |
| 3 | Conectar el proyecto local (`.env.local`) | Tú | 2 min |
| 4 | Publicar en Vercel | Tú | 10 min |
| 5 | Completar datos de contacto y redes | Tú + cliente | 5 min |
| 6 | Reemplazar fotos de referencia por fotos reales | Cliente | — |
| 7 | (Opcional) Aviso por correo de cada solicitud | Tú | 15 min |
| 8 | Checklist final antes de entregar | Tú | 5 min |

---

## PARTE 1 — Supabase (base de datos, login y almacenamiento)

### 1.1 Crear la cuenta

1. Entra a **https://supabase.com** → *Start your project*.
2. Regístrate con el correo exclusivo que creaste para este proyecto.
3. Confirma el correo.

> Usa una contraseña larga y guárdala en el gestor de contraseñas. Ese correo será el
> dueño de la base de datos del cliente: no lo compartas con terceros.

### 1.2 Crear el proyecto

1. *New project*.
2. **Name:** `oxysalon`
3. **Database Password:** genera una fuerte → **cópiala y guárdala** (no se vuelve a mostrar).
4. **Region:** `East US (North Virginia)` — la más estable para Venezuela.
5. **Plan:** Free.
6. *Create new project* → espera 2 minutos.

### 1.3 Crear las tablas, permisos y storage

1. Menú lateral → **SQL Editor** → *New query*.
2. Abre el archivo `supabase/migrations/0001_init.sql` de este proyecto, copia **todo** y pégalo.
3. *Run* (o `Ctrl+Enter`).
4. Debe decir **Success**. Verifica en **Table Editor** que existan:
   `admins`, `inquiries`, `gallery_items`, `transactions`, `calendar_events`, `page_views`.

> El script es idempotente: si algo falla, se puede volver a ejecutar sin romper nada.

### 1.4 Crear el usuario administrador

1. Menú lateral → **Authentication** → **Users** → *Add user* → *Create new user*.
2. **Email:** el correo del salón o el que vayas a usar para entrar al panel.
3. **Password:** una contraseña fuerte.
4. Marca **Auto Confirm User** (si no, el login fallará pidiendo confirmación).
5. *Create user*.
6. Copia el **UID** del usuario recién creado (columna `UID`, formato `xxxxxxxx-xxxx-...`).
7. Vuelve al **SQL Editor** y ejecuta, reemplazando el UUID y el correo:

```sql
insert into public.admins (user_id, email, full_name)
values ('PEGA-AQUI-EL-UID', 'correo@dominio.com', 'Nombre del administrador')
on conflict (user_id) do nothing;
```

✅ Sin este paso el panel **no abre** (por diseño: tener cuenta no es suficiente).

### 1.5 Copiar las credenciales

1. Menú lateral → **Project Settings** (engranaje) → **API**.
2. Copia:
   - **Project URL** → `https://xxxxx.supabase.co`
   - **anon public** (en *Project API keys*)
3. ⚠️ **Nunca** copies la `service_role`: esa salta todas las reglas de seguridad.

---

## PARTE 2 — Conectar el proyecto en tu PC

En la carpeta del proyecto:

```bash
cp .env.example .env.local
```

Edita `.env.local` y pega los dos valores:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Luego:

```bash
npm install
npm run dev
```

Prueba:
1. `http://localhost:3000/booking` → envía una solicitud de prueba.
2. `http://localhost:3000/login` → entra con el usuario administrador.
3. En el panel → pestaña **Buzón**: debe aparecer la solicitud.
4. En Supabase → **Table Editor** → `inquiries`: la fila debe estar ahí.

Si aparece el aviso amarillo “Modo demostración”, las variables no se leyeron:
revisa que el archivo se llame exactamente `.env.local` y reinicia `npm run dev`.

---

## PARTE 3 — Publicar en Vercel

El repositorio ya existe: `github.com/gabrielprogrampb/oxysalon-de-eventos-ojeda`.

1. Entra a **https://vercel.com** → regístrate con GitHub (mismo correo exclusivo).
2. *Add New…* → *Project* → importa `oxysalon-de-eventos-ojeda`.
3. Framework: **Vite** (se detecta solo). Build: `npm run build`. Output: `dist`.
4. Antes de *Deploy*, abre **Environment Variables** y agrega:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   (marca Production, Preview y Development)
5. *Deploy* → en ~1 minuto tendrás `https://oxysalon-de-eventos-ojeda.vercel.app`.

### 3.1 Verificar el dominio en Supabase

**Authentication** → **URL Configuration**:
- *Site URL:* `https://oxysalon-de-eventos-ojeda.vercel.app`
- *Redirect URLs:* agrega `https://oxysalon-de-eventos-ojeda.vercel.app/**`

(Sin esto, el enlace de “olvidé mi contraseña” no funciona en producción).

### 3.2 Dominio propio (opcional, no es gratis)

Si el cliente quiere `oxysalon.com`: se compra en Namecheap/Porkbun (~10–12 USD/año) y se
agrega en Vercel → *Settings* → *Domains*. Después hay que actualizar:
- `public/robots.txt` y `public/sitemap.xml` (dominio)
- `index.html` (canonical / OG, si se agrega)

---

## PARTE 4 — Datos que debes completar (5 minutos)

Abre `src/config/site.ts` y llena:

| Campo | Ejemplo | De dónde sale |
|-------|---------|---------------|
| `phone` | `+58 424-1234567` | Cliente |
| `whatsapp` | `584241234567` (solo dígitos) | Cliente |
| `email` | `reservas@oxysalon.com` | Cliente |
| `instagram` | `oxysalon` (sin @) | Cliente / Instagram |
| `facebook` | URL completa del perfil | Cliente |
| `tiktok` | `oxysalon` (sin @) | Cliente |
| `address` | dirección exacta | Cliente |

**Importante:** si un campo queda vacío, la interfaz lo oculta. No se publica nada falso.

---

## PARTE 5 — Fotos reales (lo que pide el cliente)

Las imágenes actuales son **de referencia** (generadas, 512 px). Para un salón real hay que
reemplazarlas:

1. Pedir al cliente 15–20 fotos: salón montado, decoración, barra, iluminación, exterior.
2. Mínimo **1600 px de ancho**, formato JPG o WEBP.
3. Subirlas desde el panel: **Galería → Subir imagen** (se guardan en Supabase Storage).
4. Para las imágenes de fondo (hero, login, portada de servicios): reemplazar los archivos en
   `public/images/oxy/` manteniendo el mismo nombre, o cambiar la ruta en el código.

> Con fotos reales el sitio sube de nivel inmediatamente. Es lo primero que va a mirar el cliente.

---

## PARTE 6 — Aviso por correo de cada solicitud (opcional, recomendado)

Sin esto, las solicitudes solo se ven al entrar al panel.

1. Crea cuenta en **https://resend.com** (free: 100 correos/día).
2. *API Keys* → crea una → copia `re_...`.
3. En Supabase → **Edge Functions** → **Secrets**, agrega:
   - `RESEND_API_KEY` = `re_...`
   - `NOTIFY_TO` = correo donde quieres recibir los avisos
   - `NOTIFY_FROM` = `onboarding@resend.dev` (funciona sin dominio propio)
   - `WEBHOOK_SECRET` = una cadena larga aleatoria (obligatoria; genera una con
     `openssl rand -hex 32` o cualquier generador de contraseñas)
4. Despliega la función (requiere Supabase CLI):

```bash
npm i -g supabase
supabase login
supabase link --project-ref TU-PROJECT-REF
supabase functions deploy notify-inquiry --no-verify-jwt
```

5. Supabase → **Database** → **Webhooks** → *Create a new hook*:
   - Table: `inquiries` · Events: `INSERT`
   - Type: *Supabase Edge Function* → `notify-inquiry`
   - **HTTP Headers:** `x-webhook-secret` = el mismo valor de `WEBHOOK_SECRET`

   ⚠️ Sin ese header la función responde 401 y no envía nada (así nadie puede usar
   tu función para mandar correos a tu costa).

Prueba enviando una solicitud desde el sitio: debe llegar el correo en segundos.

---

## PARTE 7 — Checklist antes de entregar

- [ ] `npm run check:env` responde ✅ (si falla, el sitio se publicaría en modo demostración).
- [ ] `npm run build` sin errores.
- [ ] Envío de prueba desde `/booking` → aparece en el panel y (si aplica) llega el correo.
- [ ] Login correcto con el usuario admin; una cuenta sin fila en `admins` **no** entra.
- [ ] `/dashboard` sin sesión redirige a `/login`.
- [ ] Agenda: bloquear y liberar una fecha funciona; en `/calendar` se refleja sin mostrar títulos.
- [ ] Galería: subir una foto, ocultarla y volver a mostrarla.
- [ ] Finanzas: registrar un ingreso y un gasto; el balance cuadra.
- [ ] Datos de contacto y redes visibles y correctos.
- [ ] Probar en móvil real (no solo en el navegador con responsive).
- [ ] Compartir el enlace por WhatsApp: debe mostrar la vista previa con imagen.
- [ ] `robots.txt` y `sitemap.xml` con el dominio correcto.
- [ ] Guardar las credenciales (Supabase, Vercel, correo) en un lugar seguro y entregarlas
      al cliente solo si el contrato lo contempla.

---

## PARTE 8 — Límites del plan gratis (para que no haya sorpresas)

| Recurso | Límite free | Suficiente para |
|---------|-------------|-----------------|
| Supabase base de datos | 500 MB | Miles de solicitudes |
| Supabase Storage | 1 GB | ~200 fotos optimizadas |
| Supabase usuarios | 50.000 | De sobra |
| Vercel ancho de banda | 100 GB/mes | ~100.000 visitas |
| Resend | 100 correos/día | Avisos de solicitudes |

**Advertencia importante:** Supabase **pausa** los proyectos gratuitos tras **7 días sin
actividad**. Para un sitio con poco tráfico puede pasar. Solución gratis: crear un monitor en
**https://uptimerobot.com** que abra el sitio cada 3 días. Si se pausa, se reactiva desde el
panel de Supabase en un clic (los datos no se pierden).

---

## PARTE 9 — Mantenimiento mensual (10 minutos)

1. Entrar al panel y revisar el buzón (solicitudes sin responder).
2. Verificar que el sitio abra (o revisar el monitor).
3. Subir fotos nuevas de eventos recientes (SEO + confianza).
4. Actualizar la agenda: liberar fechas pasadas.
5. Revisar **Supabase → Reports** para confirmar que no se acerca al límite.
