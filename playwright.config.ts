import { defineConfig, devices } from '@playwright/test';

/**
 * Pruebas end-to-end contra el build de producción (`dist/`).
 *
 * Se ejecutan con el navegador ya instalado en la máquina (Chrome/Edge) para
 * no descargar binarios. En CI se usa el Chromium de Playwright.
 *
 * El sitio se levanta en modo demostración si no existe `.env.local`, así que
 * ninguna prueba toca datos reales de Supabase.
 */
const localChannel = process.env.CI ? undefined : 'chrome';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 45_000,
  expect: { timeout: 8_000 },

  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    locale: 'es-VE',
    timezoneId: 'America/Caracas',
  },

  projects: [
    {
      name: 'escritorio',
      use: { ...devices['Desktop Chrome'], channel: localChannel },
    },
    {
      name: 'movil',
      use: { ...devices['Pixel 7'], channel: localChannel },
    },
  ],

  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
