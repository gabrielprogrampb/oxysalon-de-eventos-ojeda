/**
 * set-site-url.mjs
 * Cambia el dominio público del sitio en todos los archivos que lo necesitan.
 *
 * Uso:
 *   node scripts/set-site-url.mjs https://oxysalon-de-eventos-ojeda.pages.dev
 *   node scripts/set-site-url.mjs https://oxysalon.com
 *
 * Por qué existe: el dominio aparece en el canonical, en las etiquetas Open Graph,
 * en el JSON-LD, en robots.txt y en las 9 URLs del sitemap. Editarlo a mano es
 * fácil de olvidar en alguno, y un canonical equivocado le dice a Google que la
 * página "real" está en otro sitio.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MARKER = path.join(ROOT, '.site-url');

const TARGETS = [
  'index.html',
  'public/robots.txt',
  'public/sitemap.xml',
];

/** Dominios de hosting que reconocemos cuando no hay marcador previo. */
const HOST_RE = /https:\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:vercel\.app|pages\.dev|netlify\.app)/gi;

function fail(message) {
  console.error(`\n  Error: ${message}\n`);
  process.exit(1);
}

const raw = process.argv[2];

if (!raw) {
  fail('Falta la URL. Ejemplo:\n    node scripts/set-site-url.mjs https://oxysalon.com');
}

const next = raw.trim().replace(/\/+$/, '');

if (!/^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(next)) {
  fail(`"${raw}" no parece una URL válida. Debe empezar por https:// y no llevar ruta al final.`);
}

const previous = fs.existsSync(MARKER) ? fs.readFileSync(MARKER, 'utf8').trim() : null;

if (previous === next) {
  console.log(`\n  El sitio ya apunta a ${next}. No hay nada que cambiar.\n`);
  process.exit(0);
}

let touched = 0;
let replacements = 0;

for (const relative of TARGETS) {
  const file = path.join(ROOT, relative);
  if (!fs.existsSync(file)) {
    console.warn(`  ! No existe ${relative}, se omite.`);
    continue;
  }

  const before = fs.readFileSync(file, 'utf8');

  let after = before;
  if (previous) {
    // Se reemplaza exactamente el dominio anterior, sin tocar nada más.
    after = after.split(previous).join(next);
  } else {
    // Primera ejecución: se detectan los dominios de hosting conocidos.
    after = after.replace(HOST_RE, next);
  }

  if (after !== before) {
    const count = previous
      ? before.split(previous).length - 1
      : (before.match(HOST_RE) ?? []).length;
    fs.writeFileSync(file, after, 'utf8');
    touched += 1;
    replacements += Math.max(count, 1);
    console.log(`  ✓ ${relative}`);
  }
}

fs.writeFileSync(MARKER, `${next}\n`, 'utf8');

console.log(`\n  Dominio del sitio: ${next}`);
console.log(`  Archivos modificados: ${touched}  ·  Reemplazos: ${replacements}`);
console.log('\n  Recuerda volver a compilar y desplegar (git push).\n');
