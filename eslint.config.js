import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

/**
 * Lint pragmático: detecta errores reales (variables sin usar, hooks mal
 * usados, `any` implícito) sin imponer un estilo que obligue a reescribir
 * el proyecto. El formato no se valida aquí.
 */
export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'docs/**',
      'backups/**',
      'supabase/**',
      'scripts/**',
      // Artefactos de builds anteriores: nunca se editan a mano.
      '.vercel/**',
      'coverage/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // El proyecto usa `console.error` deliberadamente en rutas de error.
      'no-console': 'off',
      // Los tipos de Supabase llegan como `any` en los bordes; se permite
      // pero se avisa para no acumular deuda silenciosa.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // React 19 no necesita importar React para JSX.
      'react-hooks/exhaustive-deps': 'warn',
    },
  }
);
