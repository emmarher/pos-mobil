module.exports = {
  preset: 'react-native',
  setupFiles: ['./jest.setup.js'],
  // react-native-gesture-handler y otros paquetes publican ESM sin transformar.
  // Se incluyen en transformIgnorePatterns para que Babel los procese.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-native-gesture-handler|react-native-screens|react-native-safe-area-context|react-native-keychain|@react-navigation|react-native-udp|react-native-device-info|@react-native-async-storage)/)',
  ],
};
