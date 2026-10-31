import { expect, test } from '@playwright/test';

/**
 * Flujo de cotización completo en modo demostración (sin Supabase):
 * los datos se guardan en el navegador, pero la validación y los estados
 * de la interfaz son exactamente los de producción.
 */

/** El formulario rechaza envíos antes de 2.5 s (anti-bot). */
const ANTI_BOT_WAIT = 2_700;

async function openBooking(page: import('@playwright/test').Page) {
  await page.goto('/booking');
  await expect(page.locator('#name')).toBeVisible();
  await page.waitForTimeout(ANTI_BOT_WAIT);
}

test.describe('Formulario de cotización', () => {
  test('rechaza un envío vacío y señala cada campo', async ({ page }) => {
    await openBooking(page);

    await page.getByRole('button', { name: /solicitar cotización/i }).click();

    await expect(page.getByText('Escribe tu nombre completo.')).toBeVisible();
    await expect(page.getByText('Escribe un correo válido.')).toBeVisible();
    await expect(page.getByText(/teléfono válido/i)).toBeVisible();
    await expect(page.getByText(/debes autorizar el contacto/i)).toBeVisible();
  });

  test('marca los campos inválidos para lectores de pantalla', async ({ page }) => {
    await openBooking(page);
    await page.getByRole('button', { name: /solicitar cotización/i }).click();

    await expect(page.locator('#name')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#email')).toHaveAttribute('aria-invalid', 'true');
  });

  test('no deja enviar sin autorizar el contacto', async ({ page }) => {
    await openBooking(page);

    await page.fill('#name', 'María Fernández');
    await page.fill('#email', 'maria@ejemplo.com');
    await page.fill('#phone', '+58 424-1234567');

    await page.getByRole('button', { name: /solicitar cotización/i }).click();

    await expect(page.getByText(/debes autorizar el contacto/i)).toBeVisible();
    await expect(page.getByText(/solicitud recibida/i)).toHaveCount(0);
  });

  test('envía una solicitud válida y muestra la confirmación', async ({ page }) => {
    await openBooking(page);

    await page.fill('#name', 'María Fernández');
    await page.fill('#email', 'maria@ejemplo.com');
    await page.fill('#phone', '+58 424-1234567');
    await page.fill('#message', 'Boda para 120 personas en diciembre.');
    await page.locator('input[type="checkbox"]').check();

    await page.getByRole('button', { name: /solicitar cotización/i }).click();

    await expect(page.getByText(/solicitud recibida/i)).toBeVisible();
    await expect(page.getByText(/gracias por escribirnos/i)).toBeVisible();
  });

  test('permite enviar otra solicitud después de confirmar', async ({ page }) => {
    await openBooking(page);

    await page.fill('#name', 'Carlos Ojeda');
    await page.fill('#email', 'carlos@ejemplo.com');
    await page.fill('#phone', '0414-1234567');
    await page.locator('input[type="checkbox"]').check();
    await page.getByRole('button', { name: /solicitar cotización/i }).click();

    await expect(page.getByText(/solicitud recibida/i)).toBeVisible();

    await page.getByRole('button', { name: /enviar otra/i }).click();

    // El formulario vuelve vacío y utilizable.
    await expect(page.locator('#name')).toHaveValue('');
  });
});
