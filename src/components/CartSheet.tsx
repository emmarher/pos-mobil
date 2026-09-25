/**
 * components/CartSheet.tsx — Hoja inferior del carrito (RF-VE-001..005).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Presentación móvil/tablet del carrito: bottom sheet con manija.
 * El contenido (ítems, método de pago, totales, confirmación) vive en
 * CartContent (compartido con CartPanel de Windows).
 * ────────────────────────────────────────────────────────────────────────
 */
import React from 'react';
import {
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import CartContent from './CartContent';
import {useTheme} from '../hooks/useTheme';

interface CartSheetProps {
  visible: boolean;
  onClose: () => void;
}

export default function CartSheet({visible, onClose}: CartSheetProps) {
  const {colors} = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={[styles.sheet, {backgroundColor: colors.surfaceSolid}]}>
        {/* Manija */}
        <View style={[styles.handle, {backgroundColor: colors.border}]} />

        <CartContent onClose={onClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {flex: 1, backgroundColor: 'rgba(0,0,0,0.4)'},
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '92%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
});