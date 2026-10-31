# Guía de lanzamiento — paso a paso

Para alguien que nunca ha usado Supabase ni Vercel. Sigue el orden y no te saltes pasos.  
Cada paso tiene un **punto de control**: si no se cumple, no avances.

**Tiempo total estimado:** 1 hora la primera vez.

---

## Antes de empezar

Ten a mano:

- [ ] Un correo electrónico (puede ser el del negocio o uno personal).
- [ ] Los datos reales: teléfono, WhatsApp, correo de reservas, Instagram, dirección.
- [ ] Las fotos del salón (las que quieras publicar).
- [ ] Haber instalado Node.js (si `npm run dev` ya te funcionó, lo tienes).

---

# PARTE 1 — Supabase (la base de datos)

## Paso 1.1 — Crear la cuenta y el proyecto

1. Entra a **<https://supabase.com>** y pulsa **Start your project**.
2. Inicia sesión con GitHub o con tu correo.
3. Pulsa **New project**.
4. Rellena:
   - **Name:** `oxysalon`
   - **Database Password:** pulsa *Generate a password* y **guárdala** en un lugar seguro (la vas a necesitar solo si algún día restauras un respaldo).
   - **Region:** `East US (North Virginia)` — es la más estable para Venezuela.
5. Pulsa **Create new project** y espera 2 minutos (verás una barra de progreso).

> **Punto de control:** al terminar ves el panel del proyecto con un menú a la izquierda  
> (Table Editor, SQL Editor, Authentication…).

---

## Paso 1.2 — Crear las tablas (las 3 migraciones)

Son 5 archivos SQL. Se pegan uno por uno, **en orden**. Si te saltas el orden, falla.

Para cada archivo:

1. En el menú izquierdo pulsa **SQL Editor**.
2. Pulsa **+ New query**.
3. Abre el archivo en tu computadora con el Bloc de notas o VS Code:
   - `C:\Users\VICTUS\Documents\Proyectos code\oxysalon-de-eventos-ojeda\supabase\migrations\0001_init.sql`
4. Selecciona todo (**Ctrl + A**), copia (**Ctrl + C**).
5. Pega en la ventana de Supabase (**Ctrl + V**).
6. Pulsa **Run** (o **Ctrl + Enter**).

**Repite con los otros dos archivos, en este orden exacto:**

| Orden | Archivo                | Qué crea                                           |
| ----- | ---------------------- | -------------------------------------------------- |
| 1     | `0001_init.sql`        | Tablas, permisos (RLS), almacenamiento de imágenes |
| 2     | `0002_maintenance.sql` | Limpieza automática de datos viejos                |
| 3     | `0003_console.sql`     | Auditoría, métricas y roles del panel              |
| 4     | `0004_profile_gallery.sql` | Perfil editable y varias fotos por tema        |
| 5     | `0005_venue.sql`       | Sede del evento (Ojeda, Cabimas, Maracaibo)        |

> **Punto de control:** después de cada uno debe decir **"Success. No rows returned"**.  
> Si sale un texto en rojo con *ERROR*, **detente** y copia el mensaje completo.

> **Punto de control final:** ve a **Table Editor** (menú izquierdo). Deben aparecer  
> 9 tablas: `admins`, `inquiries`, `transactions`, `gallery_items`, `gallery_photos`,  
> `calendar_events`, `page_views`, `audit_logs`, `gallery_likes`.

---

## Paso 1.3 — Crear tu usuario para entrar al panel

1. Menú izquierdo → **Authentication**.
2. Pestaña **Users** → botón **Add user** → **Create new user**.
3. Rellena:
   - **Email:** el correo con el que vas a entrar (ej. `reservas@oxysalon.com`).
   - **Password:** una contraseña segura (mínimo 6 caracteres). Anótala.
4. **Marca la casilla "Auto Confirm User"**. Si no la marcas, el sistema no te dejará entrar  
   porque el correo queda sin confirmar.
5. Pulsa **Create user**.
6. En la lista de usuarios, busca el que acabas de crear y **copia el valor de la columna  
   `UID`** (es un texto largo tipo `a1b2c3d4-...`). Lo necesitas en el paso siguiente.

> **Punto de control:** el usuario aparece en la lista con la fecha de creación de hoy.

---

## Paso 1.4 — Darle permiso de administrador

Tener usuario **no basta**: el sistema exige que ese usuario esté en la tabla `admins`.

1. Menú izquierdo → **SQL Editor** → **+ New query**.
2. Pega esto, **cambiando los tres valores** por los tuyos:

```sql
insert into public.admins (user_id, email, full_name, role)
values (
  'PEGA-AQUI-EL-UID-DEL-PASO-1.3',
  'reservas@oxysalon.com',
  'Tu Nombre',
  'owner'
)
on conflict (user_id) do update set role = 'owner';
```

1. Pulsa **Run**.

> **Punto de control:** debe decir **"Success. 1 row"**.  
> Verifícalo con esta consulta en otra pestaña del SQL Editor:

```sql
select user_id, email, role from public.admins;
```

Debe aparecer tu correo con `role = owner`.

> ⚠️ Si aquí no aparece tu correo, el login te va a rechazar aunque la contraseña sea correcta.  
> Es el error más común. Vuelve a este paso.

---

## Paso 1.5 — Copiar las dos claves

1. Menú izquierdo → **Project Settings** (el engranaje, abajo).
2. Pulsa **API**.
3. Copia estos dos valores y pégalos en un archivo de texto temporal:
   - **Project URL** → algo como `https://abcdefgh.supabase.co`
   - **anon public** (en *Project API keys*) → un texto largo que empieza por `eyJ...`

> ⚠️ **NUNCA copies la clave `service_role`** a ningún archivo del proyecto ni a Vercel.  
> Esa clave salta todos los permisos de seguridad. Solo se usa en tu PC para respaldos.

---

# PARTE 2 — Probarlo en tu computadora

Antes de publicar, comprueba que funciona en local.

## Paso 2.1 — Crear el archivo de configuración

1. Abre la carpeta del proyecto:  
   `C:\Users\VICTUS\Documents\Proyectos code\oxysalon-de-eventos-ojeda`
2. Crea un archivo nuevo llamado exactamente **`.env.local`** (con el punto al inicio).
3. Escribe dentro, cambiando los valores por los del paso 1.5:

```
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...el-resto-de-la-clave
```

1. Guarda.

> Este archivo **no se sube a GitHub** (ya está protegido). Es solo para tu PC.

## Paso 2.2 — Arrancar y probar

1. Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
npm run dev
```

1. Abre **<http://localhost:3000>**
2. Ve a **<http://localhost:3000/login>**
3. Entra con el correo y la contraseña del **paso 1.3**.

> **Punto de control:** entras al panel y ves "Resumen" con las tarjetas de métricas.  
> Si te devuelve al login, revisa el **paso 1.4** (la tabla `admins`).

1. Ve a **<http://localhost:3000/booking>**, llena el formulario y envíalo.
2. Vuelve al panel → **Solicitudes**.

> **Punto de control:** tu solicitud de prueba aparece en la lista.  
> Ahora borra esa solicitud de prueba para no ensuciar los datos reales.

---

# PARTE 3 — Publicar en la nube

> **Lee esto antes de elegir plataforma.** El plan gratis de Vercel (Hobby) es solo para
> uso **personal y no comercial**. Un sitio para un salón que cobra es comercial, así que
> lo correcto es **Cloudflare Pages** o **Netlify**, que sí lo permiten gratis.
> Comparación completa y pasos para las tres: **[`DESPLIEGUE.md`](DESPLIEGUE.md)**.
>
> Los pasos de abajo son los de Vercel; en Cloudflare Pages y Netlify el procedimiento es
> casi idéntico (mismo comando de build, misma carpeta `dist`, mismas variables).

## Publicar en Vercel

## Paso 3.1 — Subir el código a GitHub

En la terminal, dentro de la carpeta del proyecto:

```bash
cd "C:/Users/VICTUS/Documents/Proyectos code/oxysalon-de-eventos-ojeda"
git add .
git commit -m "Version lista para produccion"
```

Luego crea el repositorio:

1. Entra a **<https://github.com/new>**
2. **Repository name:** `oxysalon`
3. Marca **Private** (es código de un cliente).
4. **No** marques "Add a README".
5. Pulsa **Create repository**.
6. GitHub te muestra unos comandos. Usa estos dos (cambiando `TU-USUARIO`):

```bash
git remote add origin https://github.com/TU-USUARIO/oxysalon.git
git push -u origin main
```

> Si `git remote add` da error porque ya existe, usa:  
> `git remote set-url origin https://github.com/TU-USUARIO/oxysalon.git`

## Paso 3.2 — Conectar Vercel

1. Entra a **<https://vercel.com>** → **Sign up** con **GitHub**.
2. Pulsa **Add New…** → **Project**.
3. Busca `oxysalon` y pulsa **Import**.
4. Vercel detecta Vite solo. **No cambies** Build Command ni Output Directory.
5. Abre **Environment Variables** y añade las dos:

| Name                     | Value                |
| ------------------------ | -------------------- |
| `VITE_SUPABASE_URL`      | tu Project URL       |
| `VITE_SUPABASE_ANON_KEY` | tu clave anon public |

1. Pulsa **Deploy** y espera 1–2 minutos.

> **Punto de control:** Vercel te da una URL tipo `https://oxysalon.vercel.app`.  
> Ábrela: debe verse la portada con las imágenes.

1. Entra a `https://TU-URL.vercel.app/login` y prueba el acceso.

---

# PARTE 4 — Poner los datos reales del negocio

Ahora mismo el sitio oculta teléfono, WhatsApp y redes porque están vacíos (a propósito:  
nunca se publica un dato inventado). Hay que llenarlos.

## Paso 4.1 — Editar el archivo

Abre: `src\config\site.ts`

Rellena solo estas líneas (están entre las líneas 29 y 37):

```ts
  phone: '+58 424-1234567',
  whatsapp: '584241234567',
  email: 'reservas@oxysalon.com',
  address: 'Calle ... , Ciudad Ojeda, Zulia',

  instagram: 'oxysalon',
  facebook: 'https://www.facebook.com/oxysalon',
  tiktok: 'oxysalon',
```

## Paso 4.2 — Reglas de cada campo

| Campo       | Cómo se escribe                                            | Ejemplo correcto                | Ejemplo INCORRECTO  |
| ----------- | ---------------------------------------------------------- | ------------------------------- | ------------------- |
| `phone`     | Como se marca, con `+58`                                   | `+58 424-1234567`               | `0424-1234567`      |
| `whatsapp`  | **Solo números**, con 58, sin `+`, sin espacios ni guiones | `584241234567`                  | `+58 424-1234567`   |
| `email`     | Correo real                                                | `reservas@oxysalon.com`         | `reservas@oxysalon` |
| `instagram` | Usuario **sin** `@`                                        | `oxysalon`                      | `@oxysalon`         |
| `facebook`  | URL **completa** que empiece por `https://`                | `https://facebook.com/oxysalon` | `oxysalon`          |
| `tiktok`    | Usuario **sin** `@`                                        | `oxysalon`                      | `@oxysalon`         |
| `address`   | Dirección exacta                                           | `Av. ... , Ciudad Ojeda`        | (dejar vacío)       |

> **Si un campo queda vacío (`''`), el botón correspondiente desaparece del sitio.**  
> Eso es correcto: mejor sin botón que con un botón que no funciona.

## Paso 4.3 — Verificar y publicar

1. Guarda el archivo.
2. En la terminal: `npm run dev`
3. Abre la portada y comprueba que aparece el botón de WhatsApp abajo a la derecha.
4. Pulsa el botón: debe abrir WhatsApp con tu número.
5. Si todo está bien, publica:

```bash
git add .
git commit -m "Datos reales del negocio"
git push
```

Vercel vuelve a publicar solo en ~1 minuto.

---

# PARTE 5 — Cambiar las fotos por las reales

El sitio trae 31 imágenes de referencia. Para reemplazarlas:

## Paso 5.1 — Preparar las fotos

- Formato: **WebP** (o JPG, se puede convertir).
- Tamaño recomendado: **1600 px** de ancho como máximo.
- Peso: **menos de 300 KB** por foto (si pesan más, el sitio se vuelve lento).

Para convertir a WebP gratis: **<https://squoosh.app>** (arrastra la foto, elige WebP, descarga).

## Paso 5.2 — Reemplazar los archivos

Cada foto tiene **dos archivos**: uno normal y otro que termina en `-480.webp` (la versión  
para celular). Hay que reemplazar **los dos**.

1. Abre la carpeta: `public\images\oxy\`
2. Mira las fotos para identificar cuál es cuál (son las mismas que se ven en el sitio).
3. Copia tu foto nueva **encima** del archivo, **conservando el mismo nombre**.
   - Ejemplo: si `img-31000bf958a9.webp` es la foto de la portada, renombra tu foto a  
     `img-31000bf958a9.webp` y sobrescríbela.
   - Haz lo mismo con `img-31000bf958a9-480.webp`.


> **Por qué conservar el nombre:** el sitio busca la foto por ese nombre. Si lo cambias,
> la imagen desaparece y hay que editar el código.

## Paso 5.3 — Publicar

```bash
git add .
git commit -m "Fotos reales del salon"
git push
```

---

# PARTE 6 — Prueba final antes de entregar

Haz esto **desde tu celular**, con datos móviles (no WiFi), sobre la URL de Vercel:

- [ ] La portada carga en menos de 4 segundos.
- [ ] El botón de WhatsApp abre el chat con tu número correcto.
- [ ] El botón de llamada marca tu teléfono.
- [ ] El formulario de cotización se envía y muestra "Solicitud recibida".
- [ ] La solicitud aparece en el panel (revísala desde la computadora).
- [ ] El panel abre en el celular y se puede navegar.
- [ ] En **Configuración → Lista de verificación** todo sale en verde.
- [ ] La galería muestra tus fotos, no las de referencia.
- [ ] Al entrar a `/admin` sin sesión, te manda al login.
- [ ] Borra la solicitud de prueba que hiciste.

---

# Si algo falla

| Síntoma | Causa más probable | Solución |
|---------|--------------------|----------|
| El login dice "Esta cuenta no tiene acceso al panel" | El usuario no está en la tabla `admins` | Repite el **paso 1.4** |
| El login dice "Debes confirmar tu correo" | No marcaste *Auto Confirm User* | Authentication → Users → menú del usuario → **Confirm email** |
| La página se ve, pero no guarda solicitudes | Faltan las variables en Vercel o están mal escritas | Revisa **paso 3.2**; deben empezar por `VITE_` |
| Vercel muestra "404" al recargar una página | Falta el `vercel.json` | Ya está en el proyecto; verifica que se subió a GitHub |
| Las fotos no cambian | Cambiaste el nombre del archivo | Usa el nombre original exacto |
| El botón de WhatsApp no aparece | `whatsapp` tiene `+`, espacios o guiones | Solo números: `584241234567` |
| El panel se ve vacío | Las migraciones no se aplicaron completas | Repite el **paso 1.2** en orden |
| Error rojo en el SQL Editor | Se ejecutó una migración fuera de orden | Empieza de nuevo desde `0001` (son idempotentes, no rompen nada) |

---

# Después del lanzamiento

- **Semanal:** revisa **Solicitudes** y **Actividad** en el panel.
- **Mensual:** en Supabase, **Project Settings → Usage**, mira que no te acerques a los
  límites del plan gratis (500 MB de base, 1 GB de imágenes).
- **Respaldo:** en tu PC, con la clave `service_role` (nunca en Vercel):

```bash
SUPABASE_URL=https://tu-proyecto.supabase.co SUPABASE_SERVICE_ROLE_KEY=tu-clave npm run backup
```

- **Trimestral:** `npm run verify` y `npm run test:e2e` para confirmar que nada se rompió.

---

> Detalle técnico de reversión, respaldos e incidentes: `docs/OPERACION.md`.
