import { expect, test } from '@playwright/test';

/**
 * Perfil del administrador: el nombre debe guardarse, verse en la barra y
 * sobrevivir a una recarga. Era el bug reportado desde el panel.
 */

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.fill('#login-email', 'demo@ejemplo.com');
  await page.fill('#login-password', 'demo1234');
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

test.describe('Perfil del administrador', () => {
  test.beforeEach(async ({ page, viewport }) => {
    test.skip((viewport?.width ?? 0) < 1024, 'El panel se prueba en escritorio');
    await login(page);
  });

  test('guarda nombre y apellido y los muestra en la barra', async ({ page }) => {
    await page.goto('/admin/configuracion');

    await page.fill('#acc-first', 'María');
    await page.fill('#acc-last', 'Ojeda');

    await page.getByRole('button', { name: /^guardar$/i }).click();

    await expect(page.getByText(/perfil actualizado/i)).toBeVisible();

    // El nombre aparece en el botón de cuenta, no solo en el formulario.
    await expect(page.getByRole('button', { name: /cuenta y sesión/i })).toContainText('María Ojeda');
  });

  test('el nombre persiste al recargar', async ({ page }) => {
    await page.goto('/admin/configuracion');
    await page.fill('#acc-first', 'Carlos');
    await page.fill('#acc-last', 'Ojeda');
    await page.getByRole('button', { name: /^guardar$/i }).click();
    await expect(page.getByText(/perfil actualizado/i)).toBeVisible();

    await page.reload();

    await expect(page.locator('#acc-first')).toHaveValue('Carlos');
    await expect(page.locator('#acc-last')).toHaveValue('Ojeda');
  });

  test('no permite guardar un nombre vacío', async ({ page }) => {
    await page.goto('/admin/configuracion');

    await page.fill('#acc-first', '');
    await page.fill('#acc-last', '');

    await expect(page.getByRole('button', { name: /^guardar$/i })).toBeDisabled();
    await expect(page.getByText(/escribe tu nombre para habilitar/i)).toBeVisible();
  });
});
