/**
 * jest.setup.js — Mocks de módulos nativos para los tests de Jest.
 *
 * ────────────────────────────────────────────────────────────────────────
 * Qué hace este archivo:
 *   Los módulos nativos (turbo modules, keychain, async-storage, udp)
 *   no existen en el entorno Node de Jest, así que se mockean aquí antes
 *   de correr cualquier test.
 *
 * Secciones:
 *   1) Setup de gesture-handler
 *   2) Mocks de módulos nativos (AsyncStorage, Keychain, DeviceInfo, UDP)
 */

/* ── 1) SETUP DE GESTURE-HANDLER ────────────────────────────────────── */

import 'react-native-gesture-handler/jestSetup';

/* ── 2) MOCKS DE MÓDULOS NATIVOS ────────────────────────────────────── */

// @react-native-async-storage/async-storage: mock oficial (v3)
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest'),
);

// react-native-keychain: no disponible en Jest
jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn().mockResolvedValue(true),
  getGenericPassword: jest.fn().mockResolvedValue(false),
  resetGenericPassword: jest.fn().mockResolvedValue(true),
  ACCESSIBLE: {WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'whenUnlocked'},
}));

// react-native-device-info: expone un device id fijo
jest.mock('react-native-device-info', () => ({
  getUniqueId: jest.fn().mockResolvedValue('test-device-id'),
}));

// react-native-udp: no se usa en tests
jest.mock('react-native-udp', () => ({
  createSocket: jest.fn().mockImplementation(() => ({
    bind: jest.fn(),
    send: jest.fn(),
    close: jest.fn(),
    on: jest.fn(),
    once: jest.fn(),
    setBroadcast: jest.fn(),
  })),
}));
