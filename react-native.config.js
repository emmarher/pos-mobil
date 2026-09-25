/**
 * react-native.config.js — Configuración del CLI (plataforma Windows).
 *
 * Registra los comandos de @react-native-windows/cli en el CLI de la
 * comunidad para que `npx react-native run-windows` (script `windows`)
 * compile e instale la app de escritorio (WINDOWS_PLAN §10).
 */
module.exports = {
  commands: require('@react-native-windows/cli').commands,
  project: {
    windows: {
      sourceDir: 'windows',
      solutionFile: 'PosMobile.sln',
      project: {
        projectFile: 'PosMobile/PosMobile.vcxproj',
      },
    },
  },
  dependencies: {
    // RNW 0.84 es solo New Architecture (Fabric). Los módulos nativos
    // Windows de estos paquetes son Old Architecture (UWP/WinUI2) y no
    // compilan contra WinUI3 → se excluyen del build Windows. El JS de
    // la app ya usa fallbacks (device-id propio, navigator JS).
    'react-native-screens': {platforms: {windows: null}},
    'react-native-device-info': {platforms: {windows: null}},
  },
};