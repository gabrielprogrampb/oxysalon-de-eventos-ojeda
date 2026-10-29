/**
 * backup-db.mjs — Respaldo manual de la base de datos
 *
 * El plan gratuito de Supabase NO incluye respaldos automáticos. Este script
 * exporta las tablas de negocio a JSON en `backups/<fecha>/`.
 *
 * Uso (PowerShell):
 *   $env:SUPABASE_URL="https://xxxx.supabase.co"
 *   $env:SUPABASE_SERVICE_ROLE_KEY="eyJ..."
 *   npm run backup
 *
 * ⚠️ La service_role key salta TODAS las políticas de seguridad.
 *    - Solo en tu máquina, nunca en el navegador ni en Vercel.
 *    - Nunca la subas al repositorio (`backups/` y `.env*` están ignorados).
 *
 * Para restaurar: los JSON se pueden importar desde el panel de Supabase
 * (Table Editor → Import) o con un script que haga upsert por `id`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const URL_BASE = (process.env.SUPABASE_URL ?? '').replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

const TABLES = ['inquiries', 'gallery_items', 'transactions', 'calendar_events', 'admins'];

if (!URL_BASE || !KEY) {
  console.error(
    '\n❌ Faltan credenciales.\n' +
      '   Define SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en el entorno.\n' +
      '   (Project Settings → API → service_role). Nunca las guardes en el repo.\n'
  );
  process.exit(1);
}

if (!URL_BASE.startsWith('https://') || KEY.length < 100) {
  console.error('❌ Valores con formato inválido. Revisa la URL y la clave.');
  process.exit(1);
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const outDir = path.join(ROOT, 'backups', stamp);
fs.mkdirSync(outDir, { recursive: true });

async function fetchTable(table) {
  const res = await fetch(`${URL_BASE}/rest/v1/${table}?select=*&order=id.asc`, {
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      Accept: 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error(`${table}: HTTP ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function main() {
  console.log(`Respaldo en: ${outDir}\n`);
  const manifest = { created_at: new Date().toISOString(), project: URL_BASE, tables: {} };
  let total = 0;

  for (const table of TABLES) {
    try {
      const rows = await fetchTable(table);
      fs.writeFileSync(path.join(outDir, `${table}.json`), JSON.stringify(rows, null, 2), 'utf8');
      manifest.tables[table] = rows.length;
      total += rows.length;
      console.log(`  ✓ ${table.padEnd(18)} ${rows.length} filas`);
    } catch (error) {
      manifest.tables[table] = `ERROR: ${error.message}`;
      console.error(`  ✗ ${table}: ${error.message}`);
    }
  }

  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`\n${total} filas respaldadas.`);
  console.log('Guarda esta carpeta fuera del equipo (Drive, correo, disco externo).');
}

main().catch((error) => {
  console.error('Error inesperado:', error.message);
  process.exit(1);
});
