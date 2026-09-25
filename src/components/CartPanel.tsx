/**
 * components/CartPanel.tsx — Panel derecho acoplable del carrito (WINDOWS_PLAN §5.2).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Presentación de escritorio (wide) del carrito: panel fijo de 340px al
 * lado derecho de la Terminal de ventas, con el contenido compartido
 * (CartContent). Sustituye al FAB + CartSheet en Windows; se abre/cierra
 * con Ctrl+Espacio o con el botón "Cerrar" del propio contenido.
 * ────────────────────────────────────────────────────────────────────────
 */
import React from 'react';
import {StyleSheet, View} from 'react-native';

import CartContent from './CartContent';
import {useTheme} from '../hooks/useTheme';
import {CART_PANEL_WIDTH} from '../layout/Breakpoints';

interface CartPanelProps {
  visible: boolean;
  onClose: () => void;
}

export default function CartPanel({visible, onClose}: CartPanelProps) {
  const {colors} = useTheme();

  if (!visible) {
    return null;
  }

  return (
    <View
      style={[
        styles.panel,
        {backgroundColor: colors.surface, borderLeftColor: colors.border},
      ]}>
      <CartContent onClose={onClose} />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: CART_PANEL_WIDTH,
    flexShrink: 0,
    borderLeftWidth: 1,
    padding: 16,
    paddingTop: 20,
    paddingBottom: 24,
  },
});