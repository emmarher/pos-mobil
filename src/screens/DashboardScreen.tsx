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
 * ────────────────────────────────────────────────────────────────────────
 */
import React, {useState} from 'react';

import PosTerminalScreen from './PosTerminalScreen';
import InventoryScreen from './InventoryScreen';
import ReportsScreen from './ReportsScreen';
import {NavTab} from '../components/BottomNavBar';

export default function DashboardScreen() {
  const [tab, setTab] = useState<NavTab>('caja');

  return (
    <>
      {/* La pantalla activa gestiona fondo/header/scroll + BottomNavBar */}
      {tab === 'caja' && <PosTerminalScreen activeTab={tab} onTabChange={setTab} />}
      {tab === 'inventario' && <InventoryScreen activeTab={tab} onTabChange={setTab} />}
      {tab === 'reportes' && <ReportsScreen activeTab={tab} onTabChange={setTab} />}
    </>
  );
}
