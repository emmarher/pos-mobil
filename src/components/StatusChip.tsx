/**
 * components/StatusChip.tsx — Chip de estado de stock (spec 3.8).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Estados: En stock (emerald), Stock bajo (ámbar), Agotado (error).
 * REGLA DEL SPEC: el estado SIEMPRE combina color + etiqueta (+ icono).
 * Nunca el color solo (Grey Test / daltónicos).
 * ────────────────────────────────────────────────────────────────────────
 */
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useTheme} from '../hooks/useTheme';

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

interface StatusChipProps {
  status: StockStatus;
  /** Etiqueta personalizada (default según status) */
  label?: string;
  testID?: string;
}

const CONFIG: Record<
  StockStatus,
  {label: string; icon: string; bg: string; fg: string}
> = {
  in_stock: {label: 'En stock', icon: '✓', bg: 'secondarySoft', fg: 'secondary'},
  low_stock: {label: 'Stock bajo', icon: '⚠', bg: 'warningSoft', fg: 'warning'},
  out_of_stock: {label: 'Agotado', icon: '✕', bg: 'dangerSoft', fg: 'danger'},
};

export default function StatusChip({status, label, testID}: StatusChipProps) {
  const {colors, fonts, radius} = useTheme();
  const cfg = CONFIG[status];

  return (
    <View
      testID={testID}
      style={[
        styles.chip,
        {
          backgroundColor: colors[cfg.bg as 'secondarySoft'],
          borderRadius: radius.round,
        },
      ]}>
      <Text style={[styles.icon, {color: colors[cfg.fg as 'secondary']}]}>
        {cfg.icon}
      </Text>
      <Text
        style={[
          styles.label,
          {color: colors[cfg.fg as 'secondary'], fontSize: fonts.micro},
        ]}>
        {label ?? cfg.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  icon: {fontSize: 11, fontWeight: '800', marginRight: 4},
  label: {fontWeight: '700'},
});
