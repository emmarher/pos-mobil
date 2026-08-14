/**
 * screens/DashboardScreen.tsx — Contenedor de pestañas post-login (spec 3.2).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Después del login, la app opera en 3 pestañas fijas (BottomNavBar):
 *   - Caja        → PosTerminalScreen (terminal de ventas)
 *   - Inventario  → InventoryScreen (gestión de inventario)
 *   - Reportes    → ReportsScreen (reportes; corte de caja en futuro)
 * El estado de pestaña vive aquí; cada pantalla recibe activeTab/onTabChange
 * y renderiza su propio BottomNavBar (spec 3.2).
 *
 * El avatar del TopAppBar abre el menú de usuario con "Cerrar sesión":
 * logout() del auth.store limpia tokens y estado; al poner
 * isAuthenticated=false el AppNavigator vuelve al Login automáticamente.
 * ────────────────────────────────────────────────────────────────────────
 */
import React, {useState} from 'react';
import {Alert} from 'react-native';

import PosTerminalScreen from './PosTerminalScreen';
import InventoryScreen from './InventoryScreen';
import ReportsScreen from './ReportsScreen';
import {NavTab} from '../components/BottomNavBar';
import {useAuthStore} from '../stores/auth.store';

export default function DashboardScreen() {
  const [tab, setTab] = useState<NavTab>('caja');
  const logout = useAuthStore(state => state.logout);
  const user = useAuthStore(state => state.user);

  // Reportes solo visible con permiso reports:read (el Vendedor no lo tiene)
  const canViewReports = user?.permissions.includes('reports:read') ?? false;
  const visibleTabs: NavTab[] = canViewReports
    ? ['caja', 'inventario', 'reportes']
    : ['caja', 'inventario'];

  // Si el tab activo no es visible (ej. cambio de rol), renderizar Caja.
  // NO se llama setState durante el render (evita warning de React).
  const effectiveTab: NavTab = visibleTabs.includes(tab) ? tab : 'caja';

  /* Menú de usuario: cerrar sesión con confirmación (RF-AU) */
  const handleAvatarPress = () => {
    Alert.alert('Cerrar sesión', '¿Deseas cerrar la sesión actual?', [
      {text: 'Cancelar', style: 'cancel'},
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: () => void logout(),
      },
    ]);
  };

  return (
    <>
      {/* La pantalla activa gestiona fondo/header/scroll + BottomNavBar */}
      {effectiveTab === 'caja' && (
        <PosTerminalScreen
          activeTab={effectiveTab}
          onTabChange={setTab}
          onAvatarPress={handleAvatarPress}
          visibleTabs={visibleTabs}
        />
      )}
      {effectiveTab === 'inventario' && (
        <InventoryScreen
          activeTab={effectiveTab}
          onTabChange={setTab}
          onAvatarPress={handleAvatarPress}
          visibleTabs={visibleTabs}
        />
      )}
      {effectiveTab === 'reportes' && (
        <ReportsScreen
          activeTab={effectiveTab}
          onTabChange={setTab}
          onAvatarPress={handleAvatarPress}
          visibleTabs={visibleTabs}
        />
      )}
    </>
  );
}
