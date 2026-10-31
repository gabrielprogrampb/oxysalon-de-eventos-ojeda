# Operación y puesta en producción

Documento para quien mantiene el sistema, no para el visitante.

> ¿Es la primera vez y necesitas hacerlo tú mismo, clic por clic? Usa
> **[`GUIA-LANZAMIENTO.md`](GUIA-LANZAMIENTO.md)**. Este documento es la referencia
> técnica para después.
Responde a: cómo se despliega, cómo se revierte, cómo se respalda y qué hacer
cuando algo falla en producción.

---

## 1. Entornos

| Entorno | Dónde vive | Datos | Para qué |
|---------|-----------|-------|----------|
| Local | `npm run dev` (puerto 3000) | Sin Supabase: modo demostración en `localStorage` | Diseño y desarrollo |
| Producción | Vercel + Supabase | Datos reales | Cliente y visitantes |

No hay entorno de *staging* separado. Si en el futuro se necesita, se crea un
segundo proyecto de Supabase y una *preview deployment* de Vercel apuntando a él.

### Variables de entorno

Solo dos, ambas públicas (van al navegador por diseño):

```
VITE_SUPABASE_URL=https://<proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<clave anon pública>
```

La `service_role` **nunca** se usa en el frontend ni se guarda en Vercel.
Solo se usa localmente para el script de respaldo.

Si faltan, el sitio arranca en modo demostración: se ve todo, pero nada se guarda
en la nube. Es un modo de revisión, no de venta.

---

## 2. Despliegue

### Primera vez

1. Crear proyecto en Supabase (plan gratuito).
2. Ejecutar en el SQL Editor, **en orden**:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_maintenance.sql`
   - `supabase/migrations/0003_console.sql`
   - `supabase/migrations/0004_profile_gallery.sql`
   - `supabase/migrations/0005_venue.sql`
3. Crear el usuario administrador en **Authentication → Users**.
4. Registrar ese usuario en la tabla `admins`:
   ```sql
   insert into public.admins (user_id, email)
   values ('<uuid-del-usuario>', '<correo>');
   ```
   El primero queda automáticamente con rol `owner`.
5. Conectar el repositorio a Vercel y cargar las dos variables de entorno.
6. Desplegar.

### Cambios posteriores

`git push` a `main` → Vercel construye y publica. El CI de GitHub Actions corre
tipos, lint, pruebas y build antes; si falla, no se debe publicar.

### Migraciones de base de datos

Las migraciones son archivos SQL numerados y **idempotentes** (`if not exists`,
`create or replace`). Se aplican a mano en el SQL Editor y se versionan en el repo.

Regla: una migración aplicada no se edita. Si hay un error, se crea la siguiente
(`0004_...sql`) que lo corrige. Así la base de producción siempre se puede
reconstruir leyendo los archivos en orden.

---

## 3. Reversión (rollback)

### Código

Vercel guarda cada despliegue. Para volver atrás:

1. Vercel → Deployments.
2. Elegir el despliegue anterior que funcionaba.
3. **Promote to Production**.

Tarda segundos y no toca la base de datos.

### Base de datos

Las migraciones **no** se revierten automáticamente. Si una migración rompe algo:

1. Detener los despliegues (no publicar más cambios).
2. Aplicar una migración correctiva (`0004_fix_....sql`).
3. Si el daño es de datos, restaurar el respaldo más reciente (sección 4).

Las migraciones de este proyecto solo **agregan** columnas, tablas y funciones.
No borran datos existentes, lo que hace la reversión de esquema poco frecuente.

---

## 4. Respaldos y restauración

### Respaldo manual

```bash
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run backup
```

Genera un JSON por tabla en `backups/` con fecha. Requiere la clave
`service_role` **solo en la máquina local**, nunca en el repositorio.

### Respaldo automático

El plan gratuito de Supabase incluye respaldos diarios con retención corta.
Para un negocio de este tamaño es suficiente; si se contrata el plan pago,
la retención sube y se puede activar *Point in Time Recovery*.

### Restauración

1. Crear un proyecto Supabase nuevo (o vacío).
2. Aplicar las migraciones en orden.
3. Cargar los JSON de `backups/` con el script de importación o desde el panel
   de Supabase (Table Editor → Import).
4. Actualizar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en Vercel.
5. Volver a desplegar.

**Probar la restauración una vez al año.** Un respaldo que nunca se restauró
no es un respaldo: es una esperanza.

---

## 5. Rutina operativa

| Frecuencia | Tarea |
|-----------|-------|
| Diaria | Revisar el buzón de solicitudes y la agenda |
| Semanal | Revisar `/admin/actividad` (quién cambió qué) y `/admin/analitica` |
| Mensual | Respaldo manual, revisar consumo de Supabase y Storage |
| Trimestral | Actualizar dependencias (`npm outdated`), correr `npm run verify` y `npm run test:e2e` |
| Anual | Probar una restauración completa en un proyecto de prueba |

### Límites del plan gratuito

| Recurso | Límite | Qué pasa al llegar |
|---------|--------|--------------------|
| Base de datos | 500 MB | Se bloquea la escritura |
| Storage | 1 GB | No se pueden subir imágenes |
| Ancho de banda | 5 GB/mes | El sitio deja de servirse |
| Proyecto inactivo | 7 días sin uso | Se pausa (se reactiva solo) |

Para este negocio los límites son holgados, pero conviene revisar
`/admin/configuracion` → Sistema, que muestra el tamaño real de la base y de Storage.

---

## 6. Qué hacer cuando algo falla

### El sitio no carga

1. Verificar el estado de Vercel y de Supabase (páginas de status públicas).
2. Revisar el último despliegue en Vercel: ¿falló el build?
3. Si el build falló, revertir al despliegue anterior.
4. Si el build está bien pero la página queda en blanco, abrir la consola del
   navegador: el `ErrorBoundary` muestra el mensaje y registra la traza.

### No se pueden enviar solicitudes

1. Revisar `/admin/configuracion` → Lista de verificación.
2. En Supabase → Logs, buscar errores de la tabla `inquiries`.
3. Causas típicas: base llena (500 MB), RLS mal aplicado tras una migración,
   o proyecto pausado por inactividad.

### No se puede entrar al panel

1. ¿El usuario existe en **Authentication → Users**?
2. ¿Está registrado en la tabla `admins`? Sin eso, el sistema cierra la sesión
   a propósito.
3. ¿Olvidó la contraseña? Usar `/reset-password` o restablecerla desde Supabase.

### Se perdieron datos

1. Detener los cambios (no seguir escribiendo).
2. Identificar la tabla y el momento.
3. Restaurar desde el respaldo más reciente o desde el respaldo diario de Supabase.
4. Revisar `audit_logs`: ahí está el registro de quién borró o modificó qué,
   con fecha y diferencias.

---

## 7. Lista de verificación antes de publicar

- [ ] `npm run verify` pasa (tipos, lint, pruebas, build).
- [ ] `npm run test:e2e` pasa (flujo de cotización, panel, 404/403/500, accesibilidad).
- [ ] Las cinco migraciones están aplicadas en producción.
- [ ] Existe al menos un usuario en `admins` y puede entrar al panel.
- [ ] `src/config/site.ts` tiene teléfono, WhatsApp, correo y redes reales.
- [ ] El formulario de cotización llega a la base (probar un envío real y borrarlo).
- [ ] El correo de aviso (`supabase/functions/notify-inquiry`) está configurado o
      se decidió no usarlo.
- [ ] Las imágenes del salón son las reales, no las de referencia.
- [ ] Los headers de seguridad están activos (`vercel.json`).
- [ ] Hay un respaldo reciente y se sabe dónde está.

## 8. Después de publicar

- [ ] Enviar una solicitud de prueba desde un teléfono real y confirmar que aparece
      en `/admin/solicitudes`.
- [ ] Confirmar que el enlace de WhatsApp abre con el número correcto.
- [ ] Revisar `/admin/analitica` al día siguiente: deben aparecer visitas.
- [ ] Confirmar que `/admin` no aparece en Google (`noindex`).
