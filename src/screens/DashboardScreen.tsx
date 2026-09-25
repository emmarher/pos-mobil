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
 * MODO DESKTOP (WINDOWS_PLAN §5.2): en vez de BottomNavBar se monta el
 * AppShell (rail lateral + TopAppBar); cada pantalla se renderiza en modo
 * `desktop` (sin su propio chrome). El badge del carrito va al rail.
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
import {useCartStore} from '../stores/cart.store';
import {useIsDesktop} from '../layout/useIsDesktop';
import AppShell from '../layout/AppShell';

/** Título de la ventana/header según la pestaña activa */
const TAB_TITLES: Record<NavTab, string> = {
  caja: 'Terminal de ventas',
  inventario: 'Inventario',
  reportes: 'Reportes',
};

export default function DashboardScreen() {
  const [tab, setTab] = useState<NavTab>('caja');
  const logout = useAuthStore(state => state.logout);
  const user = useAuthStore(state => state.user);
  const cartCount = useCartStore(state => state.items.length);
  const desktop = useIsDesktop();

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

  // Contenido de la pestaña activa (en modo desktop o móvil)
  const renderScreen = (isDesktop: boolean) => {
    switch (effectiveTab) {
      case 'inventario':
        return (
          <InventoryScreen
            activeTab={effectiveTab}
            onTabChange={setTab}
            onAvatarPress={handleAvatarPress}
            visibleTabs={visibleTabs}
            desktop={isDesktop}
          />
        );
      case 'reportes':
        return (
          <ReportsScreen
            activeTab={effectiveTab}
            onTabChange={setTab}
            onAvatarPress={handleAvatarPress}
            visibleTabs={visibleTabs}
            desktop={isDesktop}
          />
        );
      default:
        return (
          <PosTerminalScreen
            activeTab={effectiveTab}
            onTabChange={setTab}
            onAvatarPress={handleAvatarPress}
            visibleTabs={visibleTabs}
            desktop={isDesktop}
          />
        );
    }
  };

  /* ── Modo escritorio: AppShell (rail + TopAppBar + contenido) ─────── */
  if (desktop) {
    return (
      <AppShell
        title={TAB_TITLES[effectiveTab]}
        activeTab={effectiveTab}
        onTabChange={setTab}
        visibleTabs={visibleTabs}
        cartCount={cartCount}
        onAvatarPress={handleAvatarPress}>
        {renderScreen(true)}
      </AppShell>
    );
  }

  /* ── Modo móvil/tablet: cada pantalla gestiona su chrome ──────────── */
  return <>{renderScreen(false)}</>;
}