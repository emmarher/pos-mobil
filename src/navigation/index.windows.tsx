/**
 * navigation/index.windows.tsx — Navegación raíz de la app (plataforma
 * Windows).
 *
 * ────────────────────────────────────────────────────────────────────────
 * En Windows la app NO usa react-native-screens / native-stack (módulos
 * Old Architecture incompatibles con RNW 0.84 New Arch). Este archivo se
 * resuelve en lugar de index.tsx gracias a la extensión de plataforma
 * `.windows.tsx` de Metro, y monta el stack navigator 100% JS de
 * WindowsStack.tsx con la misma lógica de enrutamiento (licencia/sesión).
 * ────────────────────────────────────────────────────────────────────────
 */
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';

import ConnectionScreen from '../screens/ConnectionScreen';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import LicenseBlockScreen from '../screens/LicenseBlockScreen';
import ReceiptScreen from '../screens/ReceiptScreen';

import {useAuthStore} from '../stores/auth.store';
import {RootStackParamList} from './types';
import createWindowsStackNavigator from './WindowsStack';

export type {RootStackParamList} from './types';

const Stack = createWindowsStackNavigator<RootStackParamList>();

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
          // Sesión activa → dashboard del vendedor + recibo post-venta
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Receipt" component={ReceiptScreen} />
          </>
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