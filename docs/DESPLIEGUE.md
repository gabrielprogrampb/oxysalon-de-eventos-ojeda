# Publicar en la nube — qué plataforma elegir y cómo hacerlo

Supabase ya está configurado. Falta poner el sitio en internet. Hay tres opciones
gratuitas y **no son equivalentes para un sitio comercial**.

---

## 1. La comparación (datos de octubre 2026)

| | **Cloudflare Pages** | **Netlify** | **Vercel** |
|---|---|---|---|
| Precio del plan gratis | 0 USD | 0 USD | 0 USD |
| **Uso comercial permitido** | **Sí** | **Sí** | **No** en Hobby |
| Ancho de banda | Sin límite | 300 créditos/mes (≈15 GB) | 100 GB |
| Builds | 500/mes | ≈20 despliegues/mes (15 créditos cada uno) | 100/día |
| Dominio propio con HTTPS | Sí, gratis | Sí, gratis | Sí, gratis |
| Configuración para este proyecto | `_headers` + `_redirects` (ya incluidos) | igual | `vercel.json` (ya incluido) |
| Plan pago si el sitio crece | 5 USD/mes | 9 USD/mes | 20 USD/mes |

### El detalle que decide

Los términos de Vercel dicen, textualmente, que el plan Hobby **"restricts users to
non-commercial, personal use only"**. Un sitio para un salón de eventos que cobra por sus
servicios **es comercial**. Publicarlo en Hobby es incumplir el contrato del servicio: en la
práctica casi nunca pasa nada, pero si algún día revisan la cuenta, el sitio se cae y el
cliente se queda sin página. Para un trabajo que vas a cobrar, no vale el riesgo.

La alternativa en Vercel es el plan Pro: 20 USD al mes. Eso rompe el argumento de
"sin mensualidad de servidor" que usaste para vender.

### Recomendación

**Cloudflare Pages**, por tres razones concretas:

1. **Permite uso comercial en el plan gratis**, sin letra pequeña.
2. **Ancho de banda sin límite.** El sitio es de fotos: un salón con 60 imágenes y visitas
   constantes puede acercarse a los 15 GB de Netlify; en Cloudflare eso no existe.
3. **500 builds al mes** alcanzan de sobra, incluso trabajando todos los días.

**Netlify** es la segunda opción y es perfectamente válida: es más sencilla de usar y la
interfaz es más clara. El límite de 300 créditos al mes es lo único que hay que vigilar.

**Vercel** queda para cuando el cliente acepte pagar Pro, o para tus proyectos personales
que no facturen.

> El proyecto ya incluye `public/_headers` y `public/_redirects`, así que funciona igual en
> Cloudflare y en Netlify sin tocar nada. En Vercel siguen mandando `vercel.json`.

---

## 2. Antes de publicar (cualquier plataforma)

```bash
npm run verify
```

Debe terminar sin errores. Luego sube el código a GitHub:

```bash
cd "C:/Users/VICTUS/Documents/Proyectos code/oxysalon-de-eventos-ojeda"
git add .
git commit -m "Version lista para publicar"
git push
```

> `.env.local` **no se sube** (está en `.gitignore`). Las claves se cargan en el panel de la
> plataforma, nunca en el repositorio.

---

## 3. Cloudflare Pages (recomendado)

1. Entra a **https://dash.cloudflare.com** y crea una cuenta (basta el correo).
2. Menú izquierdo → **Workers & Pages** → **Create** → pestaña **Pages** →
   **Connect to Git**.
3. Autoriza GitHub y elige el repositorio `oxysalon`.
4. Configuración del build:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Abre **Environment variables (advanced)** y añade:

| Variable | Valor |
|---|---|
| `VITE_SUPABASE_URL` | tu Project URL |
| `VITE_SUPABASE_ANON_KEY` | tu clave `anon public` |

6. Pulsa **Save and Deploy** y espera 1–2 minutos.

> **Punto de control:** te da una URL tipo `https://oxysalon.pages.dev`. Ábrela y entra a
> `/login`: si entras al panel, las variables quedaron bien.

**Importante:** en Cloudflare, si el proyecto tiene *Preview deployments* activos, las
variables deben estar también en el entorno **Production**. Revisa en
**Settings → Environment variables** que diga "Production".

---

## 4. Netlify (alternativa)

1. Entra a **https://app.netlify.com** → **Add new site** → **Import an existing project**.
2. Elige **GitHub** y el repositorio `oxysalon`.
3. Configuración:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. **Site configuration → Environment variables** → añade las dos variables.
5. **Deploys → Trigger deploy → Deploy site**.

> **Punto de control:** URL tipo `https://oxysalon.netlify.app`. Prueba el login.

**Ojo con los créditos:** cada despliegue de producción cuesta 15 créditos y el plan gratis
da 300 al mes. Son unos 20 despliegues: suficiente para publicar y hacer ajustes, no para
subir cambios todos los días. Durante la etapa de pruebas usa los *Deploy Previews* (no
consumen igual) o agrupa los cambios.

---

## 5. Vercel (solo si aceptas el plan Pro)

Si aun así prefieres Vercel:

1. **https://vercel.com** → **Add New…** → **Project** → importa `oxysalon`.
2. Vercel detecta Vite. No cambies nada.
3. Añade las dos variables de entorno.
4. **Deploy**.
5. Cuando el sitio sea comercial, pasa al plan **Pro** (20 USD/mes) antes de entregarlo al
   cliente.

El archivo `vercel.json` ya trae las cabeceras de seguridad y el fallback de SPA.

---

## 6. Verificación después de publicar

Hazlo desde el celular, con datos móviles:

- [ ] La portada carga con imágenes.
- [ ] `/login` deja entrar al panel con tu usuario.
- [ ] Enviar una cotización de prueba desde `/booking`.
- [ ] Aparece en **Solicitudes**.
- [ ] Recargar `/admin` directamente (F5) **no** da 404. *(Esto confirma que `_redirects`
      o `vercel.json` están funcionando.)*
- [ ] En **Configuración → Lista de verificación** todo sale en verde.
- [ ] Borrar la solicitud de prueba.

---

## 7. Dominio propio (opcional)

Si el salón tiene o compra un dominio:

- **Cloudflare:** compra el dominio en Cloudflare Registrar (a precio de costo) o añade uno
  externo en **Websites → Add a site**, y luego en el proyecto Pages →
  **Custom domains → Set up a domain**.
- **Netlify:** **Domain management → Add a domain** y sigue los registros DNS que indica.
- **Vercel:** **Settings → Domains**.

El certificado HTTPS se emite solo, sin costo, en las tres plataformas.

### Cuando cambies de dominio: un solo comando

El dominio aparece en el `canonical`, en las etiquetas Open Graph, en el JSON-LD, en
`robots.txt` y en las 9 URLs del sitemap. Editarlo a mano es fácil de olvidar en alguno,
y un `canonical` equivocado le dice a Google que la página real está en otro sitio.

```bash
npm run site:url -- https://oxysalon.com
```

Ese comando actualiza los tres archivos y guarda el dominio en `.site-url`. Después:
`git add -A && git commit -m "dominio propio" && git push`.

> El proyecto arranca apuntando a `https://oxysalon-de-eventos-ojeda.pages.dev`.
> Si usas otro hosting, corre el comando con tu URL antes de publicar.

---

## 8. Problemas comunes

| Síntoma | Causa | Solución |
|---|---|---|
| Se ve el sitio pero no guarda nada | Faltan las variables | Añadirlas y **volver a desplegar** |
| 404 al recargar `/admin` | Falta el fallback de SPA | Confirma que `public/_redirects` está en el repo y se publicó |
| El login rechaza la cuenta | El usuario no está en la tabla `admins` | Paso 1.4 de `GUIA-LANZAMIENTO.md` |
| El build falla en la plataforma | Error de tipos | `npm run verify` en tu PC |
| Netlify dice que se acabaron los créditos | Muchos despliegues | Esperar al mes siguiente o pasar a Personal (9 USD) |
| Cambios que no aparecen | Caché del navegador o build pendiente | Revisa el estado del despliegue y recarga con Ctrl+F5 |

---

## 9. Resumen para decidir

- **Cliente que paga → Cloudflare Pages.** Gratis, comercial y sin límite de tráfico.
- **Quieres la interfaz más simple y el tráfico es bajo → Netlify.**
- **Vercel solo con Pro (20 USD/mes)**, o para proyectos que no facturen.
