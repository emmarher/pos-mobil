/**
 * components/DesktopDialog.tsx — Diálogo de escritorio (WINDOWS_PLAN §5.2, §6.2).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Sustituto de las bottom sheets en Windows: modal centrado con fade,
 * ancho máximo y bordes glass. Comportamiento de escritorio:
 *   - Esc cierra el diálogo.
 *   - Enter dispara la acción principal (`onEnter`) si se provee.
 * En Android/iOS los componentes siguen usando sus sheets (no este diálogo).
 * ────────────────────────────────────────────────────────────────────────
 */
import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import GlassSurface from './GlassSurface';
import {useTheme} from '../hooks/useTheme';
import {useShortcut} from '../layout/useShortcut';

interface DesktopDialogProps {
  visible: boolean;
  onClose: () => void;
  /** Título opcional del diálogo */
  title?: string;
  /** Ancho máximo del diálogo (default 480px) */
  maxWidth?: number;
  /** Acción a disparar con Enter (si se provee) */
  onEnter?: () => void;
  children: React.ReactNode;
}

export default function DesktopDialog({
  visible,
  onClose,
  title,
  maxWidth = 480,
  onEnter,
  children,
}: DesktopDialogProps) {
  const {colors, fonts} = useTheme();

  // Esc cierra; Enter confirma (solo cuando el diálogo está visible).
  useShortcut(event => {
    if (!visible) {
      return false;
    }
    if (event.key === 'escape') {
      onClose();
      return true;
    }
    if (event.key === 'enter' && onEnter) {
      onEnter();
      return true;
    }
    return false;
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.center}>
        {/* Backdrop: tocar fuera cierra */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <GlassSurface elevation="raised" style={[styles.dialog, {maxWidth}]}>
          {title ? (
            <Text style={[styles.title, {color: colors.text, fontSize: fonts.medium}]}>
              {title}
            </Text>
          ) : null}
          {children}
        </GlassSurface>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  dialog: {
    width: '100%',
    padding: 24,
    paddingBottom: 28,
  },
  title: {fontWeight: '800', textAlign: 'center', marginBottom: 8},
});