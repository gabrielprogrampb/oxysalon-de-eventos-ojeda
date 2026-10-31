import { expect, test } from '@playwright/test';

/**
 * Rutas públicas: que existan, que rendericen contenido real y que las
 * pantallas de estado digan la verdad.
 */
const PUBLIC_ROUTES = [
  { path: '/', name: 'portada' },
  { path: '/gallery', name: 'galería' },
  { path: '/services', name: 'servicios' },
  { path: '/spaces', name: 'espacios' },
  { path: '/booking', name: 'cotización' },
  { path: '/calendar', name: 'calendario' },
];

test.describe('Sitio público', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`la ${route.name} carga sin errores de consola`, async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      page.on('pageerror', (err) => errors.push(err.message));

      const response = await page.goto(route.path);

      expect(response?.status()).toBe(200);
      // La página monta React: debe haber al menos un encabezado visible.
      // `getByRole` ignora lo oculto: en móvil algunos h2 decorativos no se muestran.
      await expect(page.getByRole('heading').first()).toBeVisible();

      // Ignora ruido de red del modo demostración (sin Supabase configurado).
      const realErrors = errors.filter(
        (e) => !/supabase|Failed to fetch|net::ERR/i.test(e)
      );
      expect(realErrors, `Errores de consola en ${route.path}`).toEqual([]);
    });
  }

  test('el idioma del documento está declarado en español', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', /^es/);
  });

  test('una ruta inexistente muestra el 404, no una página en blanco', async ({ page }) => {
    await page.goto('/esta-ruta-no-existe');
    await expect(page.getByText('404', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: /esta página no existe/i })).toBeVisible();
  });

  test('la pantalla 403 explica el problema', async ({ page }) => {
    await page.goto('/403');
    await expect(page.getByRole('heading', { name: /no tienes acceso/i })).toBeVisible();
  });

  test('la pantalla 500 ofrece una salida', async ({ page }) => {
    await page.goto('/500');
    await expect(page.getByRole('heading', { name: /algo falló de nuestro lado/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /ir al inicio/i })).toBeVisible();
  });

  test('las rutas antiguas /dashboard redirigen al panel', async ({ page }) => {
    await page.goto('/dashboard/finance/new');
    // Sin sesión, el panel manda al login; lo importante es que no quede en 404.
    await expect(page).toHaveURL(/\/login/);
  });
});
