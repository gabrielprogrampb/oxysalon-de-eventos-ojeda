import { expect, test } from '@playwright/test';
import sharp from 'sharp';

/**
 * Galería con varias fotos por tema:
 *  - el panel permite subir varias imágenes y ponerles título y descripción;
 *  - el visor público las recorre como carrusel (flechas, puntos, teclado).
 */

/** Genera un PNG real para no depender de archivos binarios en el repo. */
async function pngBuffer(color: string): Promise<Buffer> {
  return sharp({ create: { width: 640, height: 480, channels: 3, background: color } })
    .png()
    .toBuffer();
}

async function dataUrl(color: string): Promise<string> {
  const buffer = await pngBuffer(color);
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.fill('#login-email', 'demo@ejemplo.com');
  await page.fill('#login-password', 'demo1234');
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

test.describe('Galería — panel', () => {
  test('crea un tema con dos fotos y sus descripciones', async ({ page, viewport }) => {
    test.skip((viewport?.width ?? 0) < 1024, 'El panel se prueba en escritorio');
    await login(page);

    await page.goto('/admin/galeria');
    await page.getByRole('button', { name: /nuevo tema/i }).click();

    await page.fill('#t-title', 'Bodas de prueba');
    await page.fill('#t-cat', 'Bodas');

    await page.locator('input[type="file"]').setInputFiles([
      { name: 'salon.png', mimeType: 'image/png', buffer: await pngBuffer('#5b13ec') },
      { name: 'mesa.png', mimeType: 'image/png', buffer: await pngBuffer('#d4af37') },
    ]);

    // Deben aparecer dos filas de edición.
    await expect(page.getByText('Foto 1')).toBeVisible();
    await expect(page.getByText('Foto 2')).toBeVisible();

    await page.getByLabel('Título de la foto 1').fill('Mesa principal');
    await page.getByLabel('Descripción de la foto 1').fill('Montaje para 120 invitados.');
    await page.getByLabel('Texto alternativo de la foto 1').fill('Mesa principal decorada');

    await page.getByRole('button', { name: /crear tema/i }).click();

    await expect(page.getByText(/tema creado/i)).toBeVisible();
    await expect(page.getByText('Bodas de prueba')).toBeVisible();
    // `exact` evita confundir la etiqueta de la tarjeta con el aviso de guardado.
    await expect(page.getByText('2 fotos', { exact: true })).toBeVisible();
  });

  test('valida que el tema tenga nombre y al menos una foto', async ({ page, viewport }) => {
    test.skip((viewport?.width ?? 0) < 1024, 'El panel se prueba en escritorio');
    await login(page);

    await page.goto('/admin/galeria');
    await page.getByRole('button', { name: /nuevo tema/i }).click();
    await page.getByRole('button', { name: /crear tema/i }).click();

    await expect(page.getByText(/ponle un nombre al tema/i)).toBeVisible();

    await page.fill('#t-title', 'Corporativo');
    await page.getByRole('button', { name: /crear tema/i }).click();

    await expect(page.getByText(/agrega al menos una foto/i)).toBeVisible();
  });
});

test.describe('Galería — carrusel público', () => {
  test.beforeEach(async ({ page }) => {
    const [one, two] = [await dataUrl('#5b13ec'), await dataUrl('#d4af37')];

    // Se siembra la galería en modo demostración antes de cargar la app.
    await page.addInitScript(
      ({ one, two }) => {
        localStorage.setItem(
          'oxy_demo_gallery',
          JSON.stringify([
            {
              id: 1,
              image: one,
              title: 'Bodas de prueba',
              category: 'Bodas',
              type: 'wide',
              likes: 0,
              published: true,
              photos: [
                {
                  id: 11,
                  itemId: 1,
                  image: one,
                  title: 'Mesa principal',
                  description: 'Montaje para 120 invitados con flores blancas.',
                  alt: 'Mesa principal decorada',
                  sortOrder: 0,
                },
                {
                  id: 12,
                  itemId: 1,
                  image: two,
                  title: 'Pista de baile',
                  description: 'Iluminación cálida para el primer baile.',
                  alt: 'Pista de baile iluminada',
                  sortOrder: 1,
                },
              ],
            },
          ])
        );
      },
      { one, two }
    );
  });

  test('abre el visor con la primera foto y su descripción', async ({ page }) => {
    await page.goto('/gallery');
    await page.getByRole('button', { name: /ver .*bodas de prueba/i }).first().click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('1 / 2')).toBeVisible();
    await expect(dialog.getByText('Mesa principal')).toBeVisible();
    await expect(dialog.getByText(/montaje para 120 invitados/i)).toBeVisible();
  });

  test('avanza con la flecha y con el teclado', async ({ page }) => {
    await page.goto('/gallery');
    await page.getByRole('button', { name: /ver .*bodas de prueba/i }).first().click();

    const dialog = page.getByRole('dialog');

    await dialog.getByRole('button', { name: /foto siguiente/i }).click();
    await expect(dialog.getByText('2 / 2')).toBeVisible();
    await expect(dialog.getByText('Pista de baile')).toBeVisible();

    // Vuelve atrás con el teclado.
    await page.keyboard.press('ArrowLeft');
    await expect(dialog.getByText('1 / 2')).toBeVisible();
  });

  test('los puntos llevan a una foto concreta y marcan la actual', async ({ page }) => {
    await page.goto('/gallery');
    await page.getByRole('button', { name: /ver .*bodas de prueba/i }).first().click();

    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Ir a la foto 2' }).click();

    await expect(dialog.getByText('2 / 2')).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Ir a la foto 2' })).toHaveAttribute(
      'aria-current',
      'true'
    );
  });

  test('Escape cierra el visor', async ({ page }) => {
    await page.goto('/gallery');
    await page.getByRole('button', { name: /ver .*bodas de prueba/i }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
});
