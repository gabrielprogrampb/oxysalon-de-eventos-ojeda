/**
 * check-env.mjs
 * Verifica que las variables de Supabase estén definidas ANTES de desplegar.
 * Evita el error más peligroso: publicar el sitio en "modo demostración"
 * sin darse cuenta (las reservas no se guardarían en ningún lado).
 *
 * Uso:  npm run check:env
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function readEnvFile(file) {
  if (!fs.existsSync(file)) return {};
  const out = {};
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    out[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return out;
}

const fileEnv = {
  ...readEnvFile(path.join(ROOT, '.env')),
  ...readEnvFile(path.join(ROOT, '.env.local')),
};
const env = { ...fileEnv, ...process.env };

const url = (env.VITE_SUPABASE_URL ?? '').trim();
const key = (env.VITE_SUPABASE_ANON_KEY ?? '').trim();

const problems = [];

if (!url || !url.startsWith('https://')) {
  problems.push('VITE_SUPABASE_URL falta o no es una URL https válida.');
} else if (url.includes('TU-PROYECTO')) {
  problems.push('VITE_SUPABASE_URL sigue teniendo el valor de ejemplo.');
}

if (!key || key.length < 100) {
  problems.push('VITE_SUPABASE_ANON_KEY falta o parece incompleta.');
} else if (key.includes('TU-ANON-KEY')) {
  problems.push('VITE_SUPABASE_ANON_KEY sigue teniendo el valor de ejemplo.');
} else {
  try {
    const payload = JSON.parse(Buffer.from(key.split('.')[1], 'base64').toString('utf8'));
    if (payload.role === 'service_role') {
      problems.push('¡Estás usando la service_role key! Usa la anon public key.');
    }
  } catch {
    problems.push('VITE_SUPABASE_ANON_KEY no parece un JWT válido.');
  }
}

if (problems.length > 0) {
  console.error('\n❌ Configuración incompleta:\n');
  for (const p of problems) console.error(`   · ${p}`);
  console.error('\n   El sitio se publicaría en MODO DEMOSTRACIÓN (sin guardar reservas).');
  console.error('   Revisa .env.local o las variables de entorno de Vercel.\n');
  process.exit(1);
}

console.log('✅ Variables de Supabase correctas. Listo para desplegar.');
