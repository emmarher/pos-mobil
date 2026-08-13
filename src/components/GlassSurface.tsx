/**
 * components/GlassSurface.tsx — Superficie glass reutilizable (spec 2.4).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Receta del spec:
 *   - Fondo translúcido (colors.surface, opacidad configurable).
 *   - Borde 1px claro brillante (colors.borderGlass).
 *   - Radio y sombra suave difusa con tinte indigo.
 * El blur real (backdrop-filter) requiere @react-native-community/blur;
 * este componente ya deja el contrato listo para conectarlo.
 * ────────────────────────────────────────────────────────────────────────
 */
import React from 'react';
import {StyleSheet, View, ViewProps, ViewStyle} from 'react-native';
import {useTheme} from '../hooks/useTheme';

interface GlassSurfaceProps extends Omit<ViewProps, 'style'> {
  /** Opacidad extra (0-1) sobre colors.surface */
  opacity?: number;
  /** Elevación: 'flat' (cards) | 'raised' (modales/FAB) */
  elevation?: 'flat' | 'raised';
  style?: ViewStyle | ViewStyle[];
}

export default function GlassSurface({
  opacity,
  elevation = 'flat',
  style,
  children,
  ...rest
}: GlassSurfaceProps) {
  const {colors, radius, glass} = useTheme();

  const elevationStyle: ViewStyle =
    elevation === 'raised'
      ? {
          shadowColor: colors.shadow,
          shadowRadius: 40,
          shadowOffset: {width: 0, height: 16},
          shadowOpacity: 0.18,
          elevation: 12,
        }
      : {
          shadowColor: colors.shadow,
          shadowRadius: 24,
          shadowOffset: {width: 0, height: 8},
          shadowOpacity: 0.10,
          elevation: 4,
        };

  return (
    <View
      {...rest}
      style={[
        styles.base,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderGlass,
          borderRadius: radius.lg,
          ...(opacity != null ? {opacity} : {opacity: glass.opacity}),
        },
        elevationStyle,
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
  },
});
