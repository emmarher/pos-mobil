/**
 * .eslintrc.js — Configuración de ESLint del proyecto.
 *
 * ────────────────────────────────────────────────────────────────────────
 * Qué hace este archivo:
 *   - Usa la config base de React Native (@react-native).
 *   - Añade un override para los archivos de Jest (jest.setup.js y
 *     tests), que ejecutan en entorno Node con los globals de Jest
 *     (describe/test/jest/expect…) definidos globalmente.
 * ────────────────────────────────────────────────────────────────────────
 */
module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      // Archivos de pruebas y setup de Jest: exponen los globals de Jest
      files: ['jest.setup.js', '**/__tests__/**/*.{js,jsx,ts,tsx}', '**/*.test.{js,jsx,ts,tsx}'],
      env: {
        jest: true,
        node: true,
      },
    },
  ],
};
