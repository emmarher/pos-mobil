/**
 * components/KpiCard.tsx — Tarjeta de métrica rápida (spec 3.9).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Glass card con label (secundario), valor display 800 y tendencia.
 * Variante de alerta: valor en error y borde ámbar/rojo (ej. "Agotados").
 * ────────────────────────────────────────────────────────────────────────
 */
import React from 'react';
import {StyleSheet, Text, View, ViewStyle} from 'react-native';
import GlassSurface from './GlassSurface';
import {useTheme} from '../hooks/useTheme';

interface KpiCardProps {
  label: string;
  value: string;
  /** Tendencia: "+4%" / "-2%" (color según dirección) */
  trend?: string;
  /** Alerta: resalta el valor en error (ej. agotados) */
  alert?: boolean;
  style?: ViewStyle | ViewStyle[];
  testID?: string;
}

export default function KpiCard({
  label,
  value,
  trend,
  alert = false,
  style,
  testID,
}: KpiCardProps) {
  const {colors, fonts, spacing} = useTheme();

  const trendPositive = trend?.startsWith('+');
  const trendColor = alert ? colors.danger : trendPositive ? colors.success : colors.danger;

  return (
    <GlassSurface
      testID={testID}
      style={StyleSheet.flatten([
        styles.card,
        {
          padding: spacing.md,
          borderColor: alert ? colors.warning : colors.borderGlass,
        },
        style,
      ])}>
      <Text style={[styles.label, {color: colors.textSecondary, fontSize: fonts.small}]}>
        {label}
      </Text>
      <View style={styles.valueRow}>
        <Text
          style={[
            styles.value,
            {
              color: alert ? colors.danger : colors.text,
              fontSize: fonts.xlarge,
            },
          ]}>
          {value}
        </Text>
        {trend ? (
          <Text style={[styles.trend, {color: trendColor, fontSize: fonts.small}]}>
            {trend}
          </Text>
        ) : null}
      </View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  card: {minHeight: 88},
  label: {fontWeight: '500'},
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  value: {fontWeight: '800'},
  trend: {fontWeight: '700'},
});
