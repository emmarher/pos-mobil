/**
 * components/SideNavRail.tsx — Rail lateral de navegación (WINDOWS_PLAN §5.2).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Sustituto de escritorio de la BottomNavBar (spec 3.2): mismas pestañas
 * (Caja / Inventario / Reportes) y mismos permisos (visibleTabs), pero en
 * orientación vertical (72px) a la izquierda, patrón estándar de apps de
 * escritorio. Estado activo con pastilla `primarySoft` (mismos tokens).
 * ────────────────────────────────────────────────────────────────────────
 */
import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useTheme} from '../hooks/useTheme';
import {RAIL_WIDTH} from '../layout/Breakpoints';
import {NavTab} from './BottomNavBar';

interface SideNavRailProps {
  active: NavTab;
  onChange: (tab: NavTab) => void;
  /** Badge sobre la pestaña de Caja (índice de ítems en carrito) */
  cartCount?: number;
  /** Pestañas visibles por permisos (Reportes oculta para el Vendedor) */
  visibleTabs?: NavTab[];
}

/** Etiquetas e ícono de cada pestaña (mismas que la BottomNavBar) */
const TABS: {key: NavTab; label: string; icon: string}[] = [
  {key: 'caja', label: 'Caja', icon: '🛒'},
  {key: 'inventario', label: 'Inventario', icon: '📦'},
  {key: 'reportes', label: 'Reportes', icon: '📊'},
];

export default function SideNavRail({
  active,
  onChange,
  cartCount = 0,
  visibleTabs,
}: SideNavRailProps) {
  const {colors, fonts} = useTheme();

  const tabs = visibleTabs
    ? TABS.filter(tab => visibleTabs.includes(tab.key))
    : TABS;

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: colors.surfaceSolid, borderRightColor: colors.border},
      ]}>
      {tabs.map(tab => {
        const isActive = tab.key === active;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onChange(tab.key)}
            testID={`rail-${tab.key}`}>
            {/* Pastilla de fondo del estado activo */}
            <View
              style={[
                styles.iconWrap,
                isActive && {backgroundColor: colors.primarySoft},
              ]}>
              <Text style={[styles.icon, {color: colors.text}]}>
                {tab.icon}
              </Text>
              {tab.key === 'caja' && cartCount > 0 && (
                <View
                  style={[styles.badge, {backgroundColor: colors.warning}]}
                  testID="rail-cart-badge">
                  <Text style={styles.badgeText}>{cartCount}</Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.label,
                {
                  color: isActive ? colors.primary : colors.textSecondary,
                  fontSize: fonts.micro,
                },
              ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: RAIL_WIDTH,
    borderRightWidth: 1,
    paddingTop: 12,
  },
  tab: {alignItems: 'center', paddingVertical: 10},
  iconWrap: {
    width: 44,
    height: 36,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  icon: {fontSize: 20},
  label: {fontWeight: '600', marginTop: 2},
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {color: '#FFFFFF', fontSize: 9, fontWeight: '800'},
});