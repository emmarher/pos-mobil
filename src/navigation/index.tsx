/**
 * navigation/index.tsx — Navegación raíz de la app.
 *
 * ────────────────────────────────────────────────────────────────────────
 * Qué hace este módulo:
 *   - Define el stack de pantallas y el flujo de primera configuración
 *     (sección 7.1 del PRD): Conexión (discovery) → Login → Dashboard.
 *   - Aplica estados especiales:
 *       • Licencia vencida → pantalla de bloqueo total (RF-AU-003, CA-004)
 *       • Servidor no disponible → pantalla con reintento cada 5s (RNF-002)
 *   - Decisión de ruta inicial reactiva al estado de auth (Zustand).
 *
 * Secciones:
 *   1) Tipos de rutas (RootStackParamList)
 *   2) Enrutamiento condicional (licencia / sesión)
 */
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import ConnectionScreen from '../screens/ConnectionScreen';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import LicenseBlockScreen from '../screens/LicenseBlockScreen';

import {useAuthStore} from '../stores/auth.store';

/* ── 1) TIPOS DE RUTAS ──────────────────────────────────────────────── */
export type RootStackParamList = {
  Connection: undefined;
  Login: undefined;
  Dashboard: undefined;
  LicenseBlock: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  /* ── 2) ENRUTAMIENTO CONDICIONAL (LICENCIA / SESIÓN) ─────────────── */

  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const licenseState = useAuthStore(state => state.licenseState);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {licenseState === 'expired' ? (
          // Bloqueo total por licencia (CA-004): solo muestra el aviso
          <Stack.Screen name="LicenseBlock" component={LicenseBlockScreen} />
        ) : isAuthenticated ? (
          // Sesión activa → dashboard del vendedor
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
        ) : (
          // Primera configuración: discovery → login
          <>
            <Stack.Screen name="Connection" component={ConnectionScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
