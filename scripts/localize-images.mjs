/**
 * localize-images.mjs
 * Descarga todas las imagenes externas (googleusercontent) usadas en el codigo,
 * las optimiza a WebP en 3 tamanos y reescribe las referencias en el codigo
 * para que apunten a archivos locales. Objetivo: cero dependencia de URLs externas.
 *
 * Uso:  node scripts/localize-images.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'images', 'oxy');
const SCAN_DIRS = ['pages', 'components', 'src', 'hooks'];
const SCAN_FILES = ['constants.ts', 'App.tsx', 'index.html'];

const URL_RE = /https:\/\/lh3\.googleusercontent\.com\/aida-public\/[A-Za-z0-9_\-]+/g;

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (/\.(tsx?|jsx?|html)$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

function collectFiles() {
  const files = [];
  for (const d of SCAN_DIRS) files.push(...walk(path.join(ROOT, d)));
  for (const f of SCAN_FILES) {
    const p = path.join(ROOT, f);
    if (fs.existsSync(p)) files.push(p);
  }
  return files;
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OxysalonBot/1.0)' } }, (res) => {
        if (res.statusCode !== 200) {
          file.close();
          fs.unlinkSync(dest);
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        res.pipe(file);
        file.on('finish', () => file.close(() => resolve(dest)));
      })
      .on('error', (err) => {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        reject(err);
      });
  });
}

const hash = (url) => crypto.createHash('md5').update(url).digest('hex').slice(0, 12);

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const files = collectFiles();
  const urls = new Set();
  const contents = new Map();

  for (const f of files) {
    const text = fs.readFileSync(f, 'utf8');
    contents.set(f, text);
    for (const m of text.matchAll(URL_RE)) urls.add(m[0]);
  }

  console.log(`Archivos escaneados: ${files.length}`);
  console.log(`Imagenes unicas encontradas: ${urls.size}`);

  const manifestPath = path.join(OUT_DIR, 'manifest.json');
  const manifest = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    : {};

  const urlToLocal = new Map();
  let downloaded = 0;

  for (const url of urls) {
    const id = `img-${hash(url)}`;
    const baseName = `${id}.webp`;
    const basePath = path.join(OUT_DIR, baseName);

    if (!fs.existsSync(basePath)) {
      const tmp = path.join(OUT_DIR, `${id}.src`);
      try {
        await download(url, tmp);
        const img = sharp(tmp, { failOn: 'none' }).rotate();
        const meta = await img.metadata();
        const width = Math.min(meta.width ?? 1600, 1600);

        await sharp(tmp, { failOn: 'none' })
          .rotate()
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: 80, effort: 5 })
          .toFile(basePath);

        for (const size of [480, 960]) {
          if (width <= size) continue;
          await sharp(tmp, { failOn: 'none' })
            .rotate()
            .resize({ width: size, withoutEnlargement: true })
            .webp({ quality: 78, effort: 5 })
            .toFile(path.join(OUT_DIR, `${id}-${size}.webp`));
        }

        fs.unlinkSync(tmp);
        downloaded++;
        console.log(`  ok ${id} (${width}px)`);
      } catch (err) {
        console.warn(`  FALLO ${url.slice(0, 60)}... -> ${err.message}`);
        if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
        continue;
      }
    }

    manifest[id] = {
      base: `/images/oxy/${baseName}`,
      variants: {
        '480': `/images/oxy/${id}-480.webp`,
        '960': `/images/oxy/${id}-960.webp`,
        '1600': `/images/oxy/${baseName}`,
      },
    };
    urlToLocal.set(url, `/images/oxy/${baseName}`);
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  // Reescribir referencias en el codigo
  let rewritten = 0;
  for (const [file, text] of contents) {
    let next = text;
    for (const [url, local] of urlToLocal) next = next.split(url).join(local);
    if (next !== text) {
      fs.writeFileSync(file, next);
      rewritten++;
    }
  }

  console.log(`\nDescargadas: ${downloaded}`);
  console.log(`Archivos reescritos: ${rewritten}`);
  console.log(`Manifest: ${manifestPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
