/**
 * components/FilterChip.tsx — Chip de filtro/categoría (spec 3.4).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Píldora 32px: activo = indigo sólido + texto blanco; inactivo = glass.
 * Se usa en el catálogo (categorías) y en filtros de inventario.
 * ────────────────────────────────────────────────────────────────────────
 */
import React from 'react';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import {useTheme} from '../hooks/useTheme';

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  testID?: string;
}

export default function FilterChip({
  label,
  active,
  onPress,
  testID,
}: FilterChipProps) {
  const {colors, fonts, radius} = useTheme();

  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.chip,
        {
          borderRadius: radius.round,
          backgroundColor: active ? colors.primary : colors.surface,
          borderColor: active ? colors.primary : colors.border,
        },
      ]}>
      <Text
        style={[
          styles.label,
          {
            color: active ? colors.onPrimary : colors.textSecondary,
            fontSize: fonts.small,
          },
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 32,
    paddingHorizontal: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {fontWeight: '600'},
});
