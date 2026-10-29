# Mantenimiento — base de datos y almacenamiento

El plan gratuito de Supabase **no es infinito** y **no incluye respaldos automáticos**.
Este documento es el runbook: qué se llena, cuándo, y qué hacer.

---

## 1. Los límites reales (plan Free)

| Recurso | Límite | Qué pasa al llegar |
|---|---|---|
| Base de datos | **500 MB** | Se bloquean las escrituras hasta liberar espacio |
| Storage (fotos) | **1 GB** | No se pueden subir más archivos |
| Transferencia (egress) | 5 GB/mes | El sitio deja de responder hasta el siguiente ciclo |
| Usuarios | 50.000 | — |
| Respaldos automáticos | **No incluidos** | Si borras algo, no hay botón de deshacer |
| Inactividad | 7 días | El proyecto se **pausa** (se reactiva a mano) |

---

## 2. Qué consume qué (y qué no es problema)

| Dato | Peso aprox. | Volumen realista | Consumo |
|---|---|---|---|
| Solicitud (`inquiries`) | 0,6 – 2 KB | 50/mes | ~1 MB/año |
| Visita (`page_views`) | ~100 B | 5.000/mes | 6 MB/año **sin purga** |
| Movimiento (`transactions`) | 0,2 KB | 40/mes | despreciable |
| Fecha de agenda | 0,2 KB | 30/mes | despreciable |
| **Foto sin comprimir** | **3 – 8 MB** | — | **150 fotos = 1 GB** |
| **Foto optimizada** | **200 – 400 KB** | — | **≈ 3.000 fotos = 1 GB** |

**Conclusión:** el riesgo no son las solicitudes, son las fotos y las visitas acumuladas.
Una foto de teléfono sin comprimir ocupa lo mismo que 40 solicitudes.

---

## 3. Lo que ya está resuelto en el código

| Medida | Dónde | Efecto |
|---|---|---|
| Compresión en el navegador | `src/lib/image.ts` | 4–8 MB → 200–400 KB antes de subir (10–30× menos) |
| Borrado del archivo al eliminar la foto | `deleteGalleryItem` en `src/lib/store.ts` | Evita archivos huérfanos que consumen cuota para siempre |
| Límite de 5 MB y tipos MIME en el bucket | `0001_init.sql` | Nada entra sin control, ni siquiera por API |
| Purga automática de visitas (90 días) | `0002_maintenance.sql` + `pg_cron` | `page_views` no crece sin límite |
| Purga de solicitudes cerradas (3 años) | `0002_maintenance.sql` | Conserva el historial comercial, descarta lo cerrado sin valor |
| Visor de consumo | `storage_usage()` y `db_health()` | Sabes cuánto ocupas sin salir del SQL Editor |

---

## 4. Instalación (una sola vez)

En el **SQL Editor** de Supabase, ejecutar en orden:

1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_maintenance.sql`

Verificar que la limpieza automática quedó programada:

```sql
select jobname, schedule, active from cron.job;
```

Si `pg_cron` no está disponible, la función `purge_old_data()` sigue existiendo y se
puede ejecutar a mano cada mes:

```sql
select * from public.purge_old_data();  -- 90 días de visitas, 3 años de solicitudes
```

---

## 5. Rutina mensual (10 minutos)

1. **Consumo** — SQL Editor:

```sql
select * from public.db_health();
select * from public.storage_usage();
select pg_size_pretty(pg_database_size(current_database())) as base_completa;
```

2. **Umbral de alerta:** si `storage_usage().porcentaje_de_1gb` supera **70 %** o la base
   pasa de **350 MB**, revisar antes de que bloquee.

3. **Respaldos** (ver sección 6). Como mínimo, una vez al mes.

4. **Archivos huérfanos** (fotos borradas de la tabla pero que siguen en Storage):

```sql
select o.name as archivo_sin_uso
from storage.objects o
where o.bucket_id = 'gallery'
  and not exists (
    select 1 from public.gallery_items g where g.image_url like '%' || o.name
  );
```

Si aparecen, se borran desde **Storage → gallery** en el panel, o con:

```sql
delete from storage.objects
where bucket_id = 'gallery'
  and name in ( /* pegar los nombres listados arriba */ );
```

5. **Accesos** — revisar en **Authentication → Users** que no haya cuentas que ya no
   correspondan, y en la tabla `admins` que solo estén las personas activas:

```sql
select a.email, a.full_name, a.created_at from public.admins a;
```

---

## 6. Respaldos (lo más importante)

**El plan gratuito no hace respaldos.** Si alguien borra una solicitud o se corrompe una
tabla, no hay forma de recuperarla salvo que tú tengas una copia.

### Opción A — Script incluido (recomendada)

```powershell
$env:SUPABASE_URL="https://xxxx.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="eyJ..."
npm run backup
```

Genera `backups/<fecha>/` con un JSON por tabla y un `manifest.json` con el conteo de filas.
Guarda esa carpeta **fuera del equipo** (Drive, correo, disco externo).

> La `service_role` key salta todas las reglas de seguridad: solo en tu máquina, nunca en
> el sitio ni en Vercel. `backups/` ya está en `.gitignore`.

### Opción B — Exportar desde el panel

**Table Editor → tabla → Export → CSV**. Sirve para una tabla puntual o para entregar
datos al cliente. No sirve como respaldo completo.

### Opción C — `pg_dump` (respaldo completo y restaurable)

Requiere el cliente de PostgreSQL instalado:

```bash
pg_dump "postgresql://postgres.[REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres" \
  --no-owner --no-privileges -f oxysalon-$(date +%F).sql
```

Es el único formato que restaura la base completa con índices, funciones y políticas.

### Frecuencia sugerida

| Momento | Qué hacer |
|---|---|
| Semanal (automático o recordatorio) | `npm run backup` |
| Antes de cada cambio grande | `pg_dump` |
| Fin de mes | Copiar `backups/` a la nube |
| Al entregar el proyecto al cliente | Respaldo completo + entrega de credenciales |

### Cómo restaurar

1. Tablas desde JSON: importar el archivo en **Table Editor → Import** respetando el orden
   `admins → inquiries → gallery_items → transactions → calendar_events`.
2. Respaldo completo: `psql "postgresql://..." -f oxysalon-2026-10-29.sql`.

---

## 7. Cuando el proyecto se pausa (7 días sin actividad)

Es lo más común en un negocio de temporada. **No se pierden datos.**

1. Entrar a supabase.com → el proyecto aparece como *Paused*.
2. *Restore project* → esperar 1–2 minutos.
3. El sitio vuelve a funcionar sin tocar nada más.

**Prevención gratis:** crear un monitor en **UptimeRobot** que abra el sitio cada 3 días.
Cada visita cuenta como actividad y mantiene el proyecto despierto.

---

## 8. Cuándo pasar al plan Pro (25 USD/mes)

No antes de que ocurra una de estas:

| Señal | Umbral |
|---|---|
| Storage | más de 700 MB usados (≈ 3.500 fotos) |
| Base de datos | más de 350 MB |
| Egreso | avisos de límite mensual dos meses seguidos |
| Necesidad real de respaldo diario | cuando el negocio dependa del histórico |

Mientras el salón suba 10–20 fotos al mes, el plan gratuito dura años. Lo que sí conviene
antes de crecer es **tener el respaldo manual al día**, que es gratis.

---

## 9. Resumen de una línea

> Las solicitudes no llenan nada; las fotos sí. Ya se comprimen al subir y se borran del
> Storage al eliminarlas. Lo único que exige disciplina es el **respaldo mensual**, porque
> el plan gratuito no lo hace solo.
