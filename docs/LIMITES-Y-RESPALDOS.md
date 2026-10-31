# Límites de la base de datos y respaldos

¿Se va a llenar? ¿Sirve Google Drive? Respuestas con números, no con suposiciones.

---

## 1. Qué se llena y qué no

El plan gratuito de Supabase da **500 MB de base de datos** y **1 GB de archivos** (las fotos).

Lo primero que hay que entender: **la base de datos no guarda fotos**. Guarda texto.
Y el texto pesa muy poco.

| Tabla | Qué guarda | Cuánto crece | En 5 años |
|---|---|---|---|
| `inquiries` | Solicitudes de cotización | ~60/mes × 1 KB | **~3.5 MB** |
| `transactions` | Ingresos y gastos | ~20/mes × 0.2 KB | ~0.3 MB |
| `calendar_events` | Fechas bloqueadas | ~10/mes | ~0.2 MB |
| `audit_logs` | Quién cambió qué | ~100/mes × 0.5 KB | ~3 MB |
| `page_views` | Visitas | **se borra a los 90 días** | ~5 MB fijos |
| `gallery_items` + `gallery_photos` | Solo las direcciones de las fotos | despreciable | <1 MB |
| `admins` | 1–3 personas | nada | <1 KB |

**Total realista a 5 años: entre 10 y 15 MB de 500 MB (≈3 %).**

Las visitas (`page_views`) son la tabla que más crece, y ya está resuelta: la función
`purge_old_data()` borra las de más de 90 días, y `pg_cron` la ejecuta a diario. Nunca
crece sin control.

### Las fotos son lo único que pesa

Van al **almacenamiento**, no a la base. Y el panel las comprime a WebP antes de subirlas:

| Fotos | Peso aproximado | % del 1 GB |
|---|---|---|
| 60 (un salón completo) | ~18 MB | 2 % |
| 200 | ~60 MB | 6 % |
| 500 | ~150 MB | 15 % |

Para llegar al 1 GB necesitarías **más de 3.000 fotos**. No va a pasar.

---

## 2. Lo que sí puede fallar (y no es el espacio)

### a) El proyecto se pausa por inactividad

En el plan gratis, si un proyecto de Supabase no recibe actividad durante **7 días**, se
pausa. El sitio deja de funcionar hasta que lo reactivas desde el panel (un clic, y los
datos están intactos).

Con un salón que revisa el panel casi todos los días, no debería pasar. Pero si se van de
vacaciones dos semanas, el sitio se cae. **Esto es el riesgo real, no el disco lleno.**

Mitigación: entrar al panel una vez por semana, o programar un ping semanal.

### b) Transferencia mensual (5 GB)

Las fotos de la galería se sirven desde Supabase. Si la galería pesa 18 MB y tiene 300
visitantes al mes que la abren completa, eso son 5,4 GB.

En la práctica no se abre completa (las imágenes cargan a medida que bajas), y el navegador
las guarda en caché. Con el tráfico de un salón local estás lejos del límite.

Si algún día se acerca: comprime más las fotos (a 150 KB), o muévelas a Cloudflare R2
(10 GB gratis y sin costo de salida).

---

## 3. Cómo vigilarlo sin complicarte

**Desde el panel:** `/admin/configuracion` → pestaña **Sistema** → *Lista de verificación*.
Ahí se ve el tamaño real de la base y del almacenamiento (lo calcula `admin_health()`).

**Desde Supabase:** *Project Settings → Usage*. Muestra base, almacenamiento, transferencia
y peticiones del mes.

**Rutina:** una vez al mes, mira los dos números. Si la base pasa de 400 MB o el
almacenamiento de 800 MB (no va a pasar), ahí sí se piensa en el plan pago.

---

## 4. Google Drive: no sirve como base de datos

Drive es un **disco**, no una base de datos. No puede hacer lo que hace Supabase:

| Necesitas | Supabase | Google Drive |
|---|---|---|
| Que dos personas escriban a la vez sin pisarse | Sí | No |
| Consultar "solicitudes de diciembre sin contactar" | Sí, en milisegundos | Habría que bajar el archivo y recorrerlo |
| Que el público solo pueda **insertar** y no leer lo de otros | Sí (RLS) | No existe el concepto |
| Login con contraseña y roles | Sí, incluido | No |
| Que un archivo de 20 MB no se descargue en cada visita | Sí | Sí se descarga |

Además Drive tiene cuotas de API, y para usarlo desde el navegador habría que exponer
credenciales de una cuenta de Google. **Sería más frágil, más lento y menos seguro.**

Existe el truco de usar una hoja de Google Sheets como base (con Apps Script), pero:
cualquiera con el enlace ve todos los datos de los clientes, no aguanta escrituras
simultáneas, y se vuelve lento a partir de unos cientos de filas. No es una opción seria
para datos de personas.

### Para lo que sí sirve Drive

**Respaldos.** Tienes un script que exporta todo a JSON:

```bash
SUPABASE_URL=https://tu-proyecto.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=tu-clave \
npm run backup
```

Genera una carpeta `backups/` con un archivo por tabla. Esos archivos los subes a Drive
(o a donde quieras) una vez al mes. Eso te da una copia fuera de Supabase, que es
exactamente el uso correcto de Drive.

> La clave `service_role` se usa **solo en tu computadora**. Nunca en el sitio publicado.

---

## 5. Si algún día crece de verdad

| Situación | Opción | Costo |
|---|---|---|
| Necesitas más espacio o quitar la pausa | Supabase Pro | 25 USD/mes (8 GB base, 100 GB archivos) |
| Quieres archivos sin costo de salida | Cloudflare R2 para las fotos | 10 GB gratis |
| Quieres salir de Supabase | Exportas a JSON y lo cargas en otro Postgres | 0 |
| Todo gratis y con control total | Autoalojar Supabase en un VPS | ~5 USD/mes + tu tiempo |

Ninguna de estas decisiones hay que tomarlas hoy. La única que importa: **el día que
quieras moverte, puedes**, porque todo se exporta a archivos abiertos (JSON y Postgres).

---

## 6. Lo que sí conviene hacer desde ahora

1. **Respaldo mensual** a Drive con `npm run backup` (5 minutos).
2. **Entrar al panel una vez por semana** para que el proyecto no se pause.
3. **No subir fotos de 8 MB.** El panel ya las comprime, pero si subes 200 fotos de golpe,
   revisa el peso en *Sistema*.
4. **Una prueba de restauración al año**: cargar un respaldo en un proyecto de prueba.
   Un respaldo que nunca se restauró es una esperanza, no un respaldo.

---

> Resumen: **no se va a llenar.** El texto ocupa megabytes, no gigabytes, y las fotos se
> comprimen antes de subir. El riesgo real es la pausa por inactividad, y se evita entrando
> al panel una vez por semana.
