/**
 * layout/AppShell.tsx — Shell de escritorio (WINDOWS_PLAN §5.2).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Estructura desktop post-login:
 *   ┌────────────────────────────────────────────────────────────┐
 *   │ TopAppBar (título + avatar)                                │
 *   ├────────┬───────────────────────────────────────────────────┤
 *   │  Rail  │  children (contenido de la pestaña activa)        │
 *   └────────┴───────────────────────────────────────────────────┘
 *
 * - Fondo glass (GlassBackground) + TopAppBar (sin inset en escritorio).
 * - SideNavRail con las mismas pestañas/permisos que la BottomNavBar.
 * - El contenido (children) es la pantalla activa en modo "desktop"
 *   (sin su propio chrome). El carrito en Caja se monta dentro del
 *   contenido (CartPanel), no aquí.
 * ────────────────────────────────────────────────────────────────────────
 */
import React from 'react';
import {StyleSheet, View} from 'react-native';

import GlassBackground from '../components/GlassBackground';
import TopAppBar from '../components/TopAppBar';
import SideNavRail from '../components/SideNavRail';
import {NavTab} from '../components/BottomNavBar';

interface AppShellProps {
  title: string;
  /** Iniciales del cajero (avatar) */
  avatarLabel?: string;
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  /** Pestañas visibles por permisos */
  visibleTabs?: NavTab[];
  /** Badge del carrito sobre la pestaña Caja */
  cartCount?: number;
  onAvatarPress?: () => void;
  children: React.ReactNode;
}

export default function AppShell({
  title,
  avatarLabel,
  activeTab,
  onTabChange,
  visibleTabs,
  cartCount = 0,
  onAvatarPress,
  children,
}: AppShellProps) {
  return (
    <GlassBackground>
      <TopAppBar title={title} avatarLabel={avatarLabel} onAvatarPress={onAvatarPress} />
      <View style={styles.row}>
        <SideNavRail
          active={activeTab}
          onChange={onTabChange}
          visibleTabs={visibleTabs}
          cartCount={cartCount}
        />
        <View style={styles.content}>{children}</View>
      </View>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  row: {flex: 1, flexDirection: 'row'},
  content: {flex: 1},
});