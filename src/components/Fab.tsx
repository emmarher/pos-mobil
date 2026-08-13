/**
 * components/Fab.tsx — Botón flotante (spec 3.7).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Círculo 64px en indigo, sombra elevada, plano de atención (z: 2).
 * Variantes: carrito (con badge numérico) y agregar (+).
 * ────────────────────────────────────────────────────────────────────────
 */
import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View, ViewStyle} from 'react-native';
import {useTheme} from '../hooks/useTheme';

interface FabProps {
  onPress: () => void;
  /** 'cart' (ícono carrito + badge) o 'add' (ícono +) */
  variant?: 'cart' | 'add';
  /** Conteo del badge (solo variante cart) */
  badgeCount?: number;
  style?: ViewStyle;
  testID?: string;
}

export default function Fab({
  onPress,
  variant = 'cart',
  badgeCount = 0,
  style,
  testID,
}: FabProps) {
  const {colors} = useTheme();

  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.fab,
        {backgroundColor: colors.primary, shadowColor: colors.shadow},
        style,
      ]}>
      <Text style={styles.icon}>{variant === 'cart' ? '🛒' : '+'}</Text>
      {variant === 'cart' && badgeCount > 0 && (
        <View style={[styles.badge, {backgroundColor: colors.warning}]} testID="fab-badge">
          <Text style={styles.badgeText}>{badgeCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 88,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.3,
    elevation: 8,
  },
  icon: {color: '#FFFFFF', fontSize: 26, fontWeight: '800'},
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {color: '#FFFFFF', fontSize: 11, fontWeight: '800'},
});
