import { expect, test } from '@playwright/test';

/**
 * Acceso al panel: sin sesión no se entra, y con sesión se navega por todas
 * las secciones. En modo demostración el login acepta cualquier credencial
 * no vacía, que es justo lo que se prueba aquí.
 */

test.describe('Acceso al panel', () => {
  test('sin sesión, /admin manda al login', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeVisible();
  });

  test('las credenciales vacías no dejan entrar', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Los campos son `required`: el navegador bloquea el envío antes de la red.
    await expect(page).toHaveURL(/\/login/);
    const emailValid = await page
      .locator('#login-email')
      .evaluate((el) => (el as HTMLInputElement).validity.valid);
    expect(emailValid).toBe(false);
  });

  test('con sesión se entra y se ve el resumen', async ({ page, viewport }) => {
    test.skip((viewport?.width ?? 0) < 1024, 'El panel se prueba en escritorio');

    await page.goto('/login');
    await page.fill('#login-email', 'demo@ejemplo.com');
    await page.fill('#login-password', 'demo1234');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole('heading', { name: /resumen/i }).first()).toBeVisible();
  });

  test('se navega por todas las secciones sin romper', async ({ page, viewport }) => {
    test.skip((viewport?.width ?? 0) < 1024, 'El panel se prueba en escritorio');

    await page.goto('/login');
    await page.fill('#login-email', 'demo@ejemplo.com');
    await page.fill('#login-password', 'demo1234');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await expect(page).toHaveURL(/\/admin$/);

    const sections = [
      { label: 'Solicitudes', url: /\/admin\/solicitudes(\?.*)?$/ },
      { label: 'Agenda', url: /\/admin\/agenda(\?.*)?$/ },
      { label: 'Finanzas', url: /\/admin\/finanzas(\?.*)?$/ },
      { label: 'Galería', url: /\/admin\/galeria(\?.*)?$/ },
      { label: 'Analítica', url: /\/admin\/analitica(\?.*)?$/ },
      { label: 'Actividad', url: /\/admin\/actividad(\?.*)?$/ },
      { label: 'Configuración', url: /\/admin\/configuracion(\?.*)?$/ },
    ];

    for (const section of sections) {
      await page.getByRole('link', { name: section.label, exact: true }).first().click();
      await expect(page).toHaveURL(section.url);
      // Cada sección debe pintar contenido, no quedarse en el esqueleto de carga.
      await expect(page.locator('main, section, .panel').first()).toBeVisible();
    }
  });

  test('cerrar sesión devuelve al login y bloquea el panel', async ({ page, viewport }) => {
    test.skip((viewport?.width ?? 0) < 1024, 'El panel se prueba en escritorio');

    await page.goto('/login');
    await page.fill('#login-email', 'demo@ejemplo.com');
    await page.fill('#login-password', 'demo1234');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await expect(page).toHaveURL(/\/admin$/);

    await page.getByRole('button', { name: /cuenta y sesión/i }).click();
    await page.getByRole('menuitem', { name: /cerrar sesión/i }).click();

    await expect(page).toHaveURL(/\/login/);
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });
});
