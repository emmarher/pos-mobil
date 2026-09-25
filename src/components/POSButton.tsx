/**
 * components/POSButton.tsx — Botón primario de gran tamaño (RNF-005).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Qué hace este componente:
 *   - Botón táctil optimizado para tableta 10" (área mínima 56px).
 *   - Variantes de color, modo loading (spinner) y estado deshabilitado.
 *   - Usa el tema activo (useTheme) para colores y tipografía.
 *
 * Secciones:
 *   1) Props del componente (POSButtonProps)
 *   2) Lógica de variantes y estado
 *   3) Render (UI)
 */
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import {useTheme} from '../hooks/useTheme';

/* ── 1) PROPS DEL COMPONENTE ────────────────────────────────────────── */
interface POSButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  large?: boolean;
  testID?: string;
}

export default function POSButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  large = false,
  testID,
}: POSButtonProps) {
  /* ── 2) LÓGICA DE VARIANTES Y ESTADO ─────────────────────────────── */

  const theme = useTheme();
  const {colors, fonts, radius, spacing} = theme;

  // Mapa variante → colores de fondo y texto (ghost además usa borde)
  const variantColors = {
    primary: {bg: colors.primary, fg: colors.onPrimary},
    secondary: {bg: colors.surface, fg: colors.text, border: colors.border},
    danger: {bg: colors.danger, fg: colors.onPrimary},
    success: {bg: colors.success, fg: colors.onPrimary},
    ghost: {bg: 'transparent', fg: colors.primary, border: colors.border},
  }[variant];

  // Deshabilitado si lo pide el padre o si está cargando
  const isDisabled = disabled || loading;

  /* ── 3) RENDER (UI) ──────────────────────────────────────────────── */

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      style={(state: {pressed: boolean; hovered?: boolean}) => [
        styles.base,
        {
          backgroundColor: variantColors.bg,
          borderColor: variantColors.border,
          borderWidth: variantColors.border ? 1 : 0,
          borderRadius: radius.md,
          paddingVertical: large ? spacing.lg : spacing.md,
          paddingHorizontal: large ? spacing.xl : spacing.lg,
          // Estados: hover (ratón/escritorio) aclara sutilmente; pressed oscurece
          opacity: isDisabled
            ? 0.5
            : state.pressed
            ? 0.85
            : state.hovered
            ? 0.92
            : 1,
        },
        style,
      ]}>
      {loading ? (
        // Estado de carga: spinner en lugar del título
        <ActivityIndicator color={variantColors.fg} size="large" />
      ) : (
        <Text
          style={[
            styles.label,
            {
              color: variantColors.fg,
              fontSize: large ? fonts.medium : fonts.regular,
            },
          ]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

/* ── Estilos del componente ─────────────────────────────────────────── */
const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56, // área táctil mínima para tableta (RNF-005)
  },
  label: {
    fontWeight: '700',
  },
});
