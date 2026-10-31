import { defineConfig } from 'vitest/config';

/**
 * Pruebas unitarias de la lógica pura (validación, formato, identificadores).
 * No se monta React aquí: las pruebas de interfaz se harían con Playwright
 * contra el build de producción.
 */
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    reporters: ['default'],
    passWithNoTests: false,
  },
});
