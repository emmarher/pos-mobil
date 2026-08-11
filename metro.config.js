const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration — pos-mobile
 * https://facebook.github.io/metro/docs/configuration
 *
 * NOTAS (2026-08-11):
 * - Watchman está corrupto en este proyecto (crawl falla con
 *   "node_modules/node_modules: No such file or directory"). El fix fue
 *   quitar los watchFolders del template RNW que apuntaban a rutas
 *   inexistentes (node_modules/react-native-windows/../node_modules y
 *   ../packages). Con eso Metro 0.83.7 usa su file-map por defecto sin
 *   crashear; si el crawl de watchman vuelve a fallar, se puede forzar el
 *   file-map de Node (opción no documentada de esta versión) o reiniciar
 *   watchman con: watchman shutdown-server && pkill -9 watchman.
 * - El template de react-native-windows agrega watchFolders que solo
 *   aplican cuando RNW es un workspace monorepo; aquí RNW está instalado
 *   en el node_modules normal, así que se omitieron deliberadamente.
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    blockList: [
      // Evita que la carpeta de build de Windows alimente a Metro
      new RegExp(
        `${require('node:path').resolve(__dirname, 'windows').replace(/[/\\]/g, '/')}.*`,
      ),
      /.*\.ProjectImports\.zip/,
    ],
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
