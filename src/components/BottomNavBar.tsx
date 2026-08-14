/**
 * components/BottomNavBar.tsx — Barra de navegación inferior (spec 3.2).
 *
 * ────────────────────────────────────────────────────────────────────────
 * 3 secciones fijas: Caja, Inventario, Reportes (RF-PR, spec 4.x).
 * Estado activo: ícono + etiqueta en indigo con pastilla de fondo.
 * Altura 64px + safe-area-inset-bottom; glass con borde superior sutil.
 * ────────────────────────────────────────────────────────────────────────
 */
import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../hooks/useTheme';

export type NavTab = 'caja' | 'inventario' | 'reportes';

interface BottomNavBarProps {
  active: NavTab;
  onChange: (tab: NavTab) => void;
  /** Badge sobre la pestaña de Caja (índice de ítems en carrito) */
  cartCount?: number;
  /** Pestañas visibles (por permisos). Default: las 3 (Caja/Inventario/Reportes) */
  visibleTabs?: NavTab[];
}

/** Etiquetas y emoji-icon de cada pestaña (fijos, spec 3.2) */
const TABS: {key: NavTab; label: string; icon: string}[] = [
  {key: 'caja', label: 'Productos', icon: '🛒'},
  {key: 'inventario', label: 'Inventario', icon: '📦'},
  {key: 'reportes', label: 'Reportes', icon: '📊'},
];

export default function BottomNavBar({
  active,
  onChange,
  cartCount = 0,
  visibleTabs,
}: BottomNavBarProps) {
  const insets = useSafeAreaInsets();
  const {colors, fonts} = useTheme();

  // Filtra por permisos: si visibleTabs se pasa, solo se renderizan esas
  // pestañas (ej. el Vendedor no ve "Reportes" → no tiene reports:read)
  const tabs = visibleTabs
    ? TABS.filter(tab => visibleTabs.includes(tab.key))
    : TABS;

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom,
          backgroundColor: colors.surfaceSolid,
          borderTopColor: colors.border,
        },
      ]}>
      {tabs.map(tab => {
        const isActive = tab.key === active;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onChange(tab.key)}
            testID={`tab-${tab.key}`}>
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
                  testID="nav-cart-badge">
                  <Text style={styles.badgeText}>{cartCount}</Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.label,
                {
                  color: isActive ? colors.primary : colors.textSecondary,
                  fontSize: fonts.small,
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
    height: 64,
    flexDirection: 'row',
    borderTopWidth: 1,
  },
  tab: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  iconWrap: {
    width: 44,
    height: 32,
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
