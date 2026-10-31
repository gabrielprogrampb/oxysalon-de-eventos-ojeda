/**
 * screenshots.mjs
 * Genera el material visual del proyecto a partir del BUILD de producción.
 *
 * Uso:
 *   npm run build && npm run preview     (en otra terminal)
 *   npm run capturas
 *
 * Requisitos: Google Chrome instalado (usa playwright-core con el Chrome del sistema).
 * Salida: docs/capturas/*.jpg  (1440 px escritorio / 780 px móvil)
 *
 * NOTA: el aviso "Modo demostración" del panel se oculta durante la captura
 * porque en producción (con Supabase configurado) no existe.
 * Para capturas con datos de contacto reales: completa src/config/site.ts,
 * vuelve a compilar y ejecuta de nuevo este script.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'docs', 'capturas');
const BASE = process.env.PREVIEW_URL ?? 'http://localhost:4173';

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);

function findChrome() {
  for (const candidate of CHROME_CANDIDATES) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(
    'No se encontró Google Chrome. Define la variable CHROME_PATH con la ruta al ejecutable.'
  );
}

// Agenda de ejemplo para que el calendario no salga vacío en las capturas.
// Se usa el mes siguiente para que todos los estados sean visibles
// (el mes en curso está casi todo en el pasado).
const DEMO_CALENDAR = [
  { id: 'd1', date: '2026-11-07', status: 'booked', title: 'Quince años', timeStart: '20:00', timeEnd: '23:59' },
  { id: 'd2', date: '2026-11-14', status: 'hold', title: 'Pre-reserva', timeStart: '19:00', timeEnd: '23:00' },
  { id: 'd3', date: '2026-11-19', status: 'maintenance', title: 'Mantenimiento' },
  { id: 'd4', date: '2026-11-21', status: 'booked', title: 'Gala corporativa', timeStart: '17:00', timeEnd: '22:00' },
  { id: 'd5', date: '2026-11-28', status: 'booked', title: 'Boda privada', timeStart: '18:00', timeEnd: '23:59' },
  { id: 'd6', date: '2026-12-12', status: 'booked', title: 'Boda', timeStart: '18:00', timeEnd: '23:59' },
];

const shots = [];
let page;

/**
 * Galería de demostración: el primer tema lleva tres fotos para que el visor
 * muestre flechas, puntos y contador. Los demás van con una sola.
 */
const DEMO_GALLERY = [
  {
    id: 1,
    image: '/images/oxy/img-31000bf958a9.webp',
    title: 'Montaje de Mesa',
    category: 'Bodas',
    type: 'wide',
    likes: 18,
    published: true,
    photos: [
      {
        id: 11, itemId: 1, sortOrder: 0,
        image: '/images/oxy/img-31000bf958a9.webp',
        title: 'Mesa principal',
        description: 'Montaje para 120 invitados con candelabros y flores naturales.',
        alt: 'Mesa principal decorada con candelabros',
      },
      {
        id: 12, itemId: 1, sortOrder: 1,
        image: '/images/oxy/img-20dd57a02f43.webp',
        title: 'Ambientación floral',
        description: 'Centros de mesa con flores de temporada incluidas en el servicio.',
        alt: 'Centros de mesa con flores',
      },
      {
        id: 13, itemId: 1, sortOrder: 2,
        image: '/images/oxy/img-369b9401311e.webp',
        title: 'Detalle de vajilla',
        description: 'Cristalería, cubertería y mantelería fina para cada invitado.',
        alt: 'Detalle de vajilla y cristalería',
      },
    ],
  },
  { id: 2, image: '/images/oxy/img-507d9b401ccc.webp', title: 'Cena de Gala', category: 'Corporativo', type: 'square', likes: 9, published: true },
  { id: 3, image: '/images/oxy/img-25597864f1fc.webp', title: 'Detalles Florales', category: 'Decoración', type: 'tall', likes: 14, published: true },
  { id: 4, image: '/images/oxy/img-4c3093b10c97.webp', title: 'Iluminación Escénica', category: 'Tecnología', type: 'wide', likes: 21, published: true },
  { id: 5, image: '/images/oxy/img-606b588fd0cd.webp', title: 'Cocktail Bar', category: 'Bebidas', type: 'square', likes: 7, published: true },
  { id: 6, image: '/images/oxy/img-928e542805f9.webp', title: 'Salón Principal', category: 'Salones', type: 'wide', likes: 25, published: true },
  { id: 7, image: '/images/oxy/img-aa62b78e00a6.webp', title: 'Terraza Exterior', category: 'Exterior', type: 'tall', likes: 11, published: true },
];

async function capture(name, { fullPage = false, hideDemoBanner = false, wait = 900 } = {}) {
  if (hideDemoBanner) {
    await page.evaluate(() => {
      document.querySelectorAll('div').forEach((el) => {
        if (el.textContent?.trim().startsWith('Modo demostración') && el.children.length <= 3) {
          el.remove();
        }
      });
    });
  }
  await page.waitForTimeout(wait);
  const file = path.join(OUT, `${name}.jpg`);
  await page.screenshot({ path: file, fullPage, type: 'jpeg', quality: 82 });
  shots.push(name);
  console.log(`  ✓ ${name}`);
}

async function go(route) {
  await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(700);
  // Recorrido completo para forzar la carga de imágenes con lazy-loading
  await page.evaluate(async () => {
    const height = document.body.scrollHeight;
    for (let y = 0; y < height; y += 500) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 90));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(900);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const chromePath = findChrome();
  console.log(`Chrome: ${chromePath}`);
  console.log(`Build:  ${BASE}\n`);

  const browser = await chromium.launch({ executablePath: chromePath, args: ['--no-sandbox'] });

  // ---------------------------------------------------------------- ESCRITORIO
  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  await desktop.addInitScript(({ calendar, gallery }) => {
    localStorage.setItem('oxy_demo_calendar', JSON.stringify(calendar));
    localStorage.setItem('oxy_demo_gallery', JSON.stringify(gallery));
    localStorage.setItem('oxy_demo_session', 'true');
    localStorage.setItem('oxy_demo_views', '1284');
  }, { calendar: DEMO_CALENDAR, gallery: DEMO_GALLERY });
  page = await desktop.newPage();

  console.log('PÚBLICO');

  await go('/');
  await capture('01-home-portada');

  // Secciones de la home
  await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 0.95, behavior: 'instant' }));
  await capture('02-home-espacios', { wait: 1200 });

  await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('h3')).find((h) =>
      h.textContent?.includes('Todo lo que necesitas')
    );
    el?.scrollIntoView({ block: 'center', behavior: 'instant' });
  });
  await capture('03-home-servicios', { wait: 1200 });

  await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('h3')).find((h) =>
      h.textContent?.includes('Lo que dicen nuestros clientes')
    );
    el?.scrollIntoView({ block: 'center', behavior: 'instant' });
  });
  await capture('04-home-testimonios', { wait: 1200 });

  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
  await capture('05-footer', { wait: 900 });

  await go('/services');
  await capture('06-servicios');

  // Tarjetas de servicio: aquí se ve "Animación y Entretenimiento"
  await page.evaluate(() => {
    const el = [...document.querySelectorAll('h3')].find((h) => h.textContent?.includes('Barra Libre'));
    el?.scrollIntoView({ block: 'center', behavior: 'instant' });
  });
  await capture('06b-servicios-tarjetas', { wait: 900 });

  await go('/services/decor');
  await capture('07-servicio-decoracion');

  await go('/services/tech');
  await capture('08-servicio-tecnica');

  await go('/services/bar');
  await capture('09-servicio-barra');

  await go('/spaces');
  await capture('10-espacios');

  await go('/gallery');
  await capture('11-galeria', { wait: 1400 });

  // Lightbox
  try {
    const card = page.locator('div.cursor-zoom-in').first();
    await card.click({ force: true, timeout: 5000 });
    await capture('12-galeria-lightbox', { wait: 800 });
    await page.mouse.click(20, 20);
  } catch (err) {
    console.warn('  ! lightbox omitido:', err.message.split('\n')[0]);
  }

  await go('/calendar');
  await capture('13-agenda-publica', { wait: 1200 });

  // Mes siguiente: todos los estados del calendario visibles
  await page.evaluate(() => {
    document.querySelector('.grid.grid-cols-7')?.scrollIntoView({ block: 'center', behavior: 'instant' });
  });
  const nextMonth = page.locator('button:has(.material-symbols-outlined:text("chevron_right"))').first();
  if (await nextMonth.count()) {
    await nextMonth.click();
    await page.waitForTimeout(600);
  }
  await capture('13b-agenda-mes', { wait: 900 });

  await go('/booking');
  await capture('14-reserva');

  // Campo "Sede del evento" (Ojeda / Cabimas / Maracaibo)
  await page.evaluate(() => {
    document.querySelector('#venue')?.scrollIntoView({ block: 'center', behavior: 'instant' });
  });
  await capture('14b-reserva-sede', { wait: 800 });

  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
  await capture('15-reserva-contacto', { wait: 900 });

  // Autenticación: contexto SIN sesión (si no, /login redirige al panel)
  const desktopPage = page;
  const anonCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  page = await anonCtx.newPage();

  await go('/login');
  await capture('16-login', { hideDemoBanner: true });

  await go('/reset-password');
  await capture('17-reset-password');

  await anonCtx.close();
  page = desktopPage;

  // ---------------------------------------------------------------- PANEL
  console.log('\nPANEL ADMINISTRATIVO');

  await go('/admin');
  if (!page.url().includes('/admin')) {
    // Modo demo con sesión ya inyectada; si redirige, se entra manualmente
    await go('/login');
    await page.fill('#login-email', 'demo@oxysalon.com');
    await page.fill('#login-password', 'demo1234');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
  }
  await capture('18-panel-resumen', { hideDemoBanner: true, wait: 1200 });

  // La barra lateral usa enlaces (NavLink), no botones.
  const nav = async (label) => {
    const link = page.locator(`a:has-text("${label}")`).first();
    if (await link.count()) {
      await link.click();
      await page.waitForTimeout(900);
      return true;
    }
    return false;
  };

  if (await nav('Agenda')) await capture('19-panel-agenda', { hideDemoBanner: true, wait: 900 });

  // Buzón = Solicitudes
  if (await nav('Solicitudes')) {
    await capture('20-panel-buzon', { hideDemoBanner: true, wait: 900 });

    // Detalle de una solicitud
    const row = page.locator('tbody tr').first();
    if (await row.count()) {
      await row.click();
      await page.waitForTimeout(1200);
      await capture('21-panel-solicitud', { hideDemoBanner: true, wait: 800 });
      await go('/admin');
    }
  }

  if (await nav('Finanzas')) {
    await capture('22-panel-finanzas', { hideDemoBanner: true, wait: 900 });

    // El alta de movimiento es un modal, no una ruta aparte.
    const newTx = page.getByRole('button', { name: /nuevo movimiento/i }).first();
    if (await newTx.count()) {
      await newTx.click();
      await capture('23-panel-nueva-transaccion', { hideDemoBanner: true, wait: 800 });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
    }
  }

  if (await nav('Galería')) {
    await capture('24-panel-galeria', { hideDemoBanner: true, wait: 1000 });

    const newTheme = page.getByRole('button', { name: /nuevo tema/i }).first();
    if (await newTheme.count()) {
      await newTheme.click();
      await capture('25-panel-subir-imagen', { hideDemoBanner: true, wait: 800 });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
    }
  }

  // ---------------------------------------------------------------- MÓVIL
  console.log('\nMÓVIL');

  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  await mobile.addInitScript(({ calendar, gallery }) => {
    localStorage.setItem('oxy_demo_calendar', JSON.stringify(calendar));
    localStorage.setItem('oxy_demo_gallery', JSON.stringify(gallery));
    localStorage.setItem('oxy_demo_session', 'true');
  }, { calendar: DEMO_CALENDAR, gallery: DEMO_GALLERY });
  page = await mobile.newPage();

  await go('/');
  await capture('26-movil-portada');

  // Menú de navegación abierto
  const menuBtn = page.locator('button:has(.material-symbols-outlined:text("menu_open"))').first();
  if (await menuBtn.count()) {
    await menuBtn.click();
    await capture('27-movil-menu', { wait: 700 });
    await page.keyboard.press('Escape').catch(() => {});
  }

  await go('/gallery');
  await capture('28-movil-galeria', { wait: 1200 });

  await go('/booking');
  await capture('29-movil-reserva', { wait: 800 });

  await go('/admin');
  await capture('30-movil-panel', { hideDemoBanner: true, wait: 1200 });

  await browser.close();

  console.log(`\n${shots.length} capturas en: ${OUT}`);
}

main().catch((err) => {
  console.error('\nError:', err.message);
  process.exit(1);
});
