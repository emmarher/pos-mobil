/**
 * screens/CashierCutScreen.tsx — Corte de caja / fin de turno (spec 4.4).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Flujo del spec:
 *   - Resumen comparativo: hoy vs. ayer (total + tendencia).
 *   - Reconciliación: esperado vs. contado con diferencia (faltante/sobrante).
 *   - Desglose por método de pago (Efectivo, Tarjeta…).
 *   - Acciones: "Reimprimir corte" (secundario) y "Cerrar turno" (primario).
 * Permisos: cashier:cut_own (turno) / cashier:cut_all (diario).
 * ────────────────────────────────────────────────────────────────────────
 */
import React, {useState} from 'react';
import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';

import GlassBackground from '../components/GlassBackground';
import TopAppBar from '../components/TopAppBar';
import BottomNavBar, {NavTab} from '../components/BottomNavBar';
import GlassSurface from '../components/GlassSurface';
import POSButton from '../components/POSButton';

import {useTheme} from '../hooks/useTheme';
import {MOCK_CUT} from '../constants/mock-data';

export default function CashierCutScreen() {
  const {colors, fonts, spacing} = useTheme();
  const [tab, setTab] = useState<NavTab>('reportes');

  /* Cálculos del corte (mock; en Fase 5 se conectan a /cashier) */
  const delta = MOCK_CUT.today.total - MOCK_CUT.yesterday.total;
  const deltaPct = MOCK_CUT.yesterday.total > 0 ? (delta / MOCK_CUT.yesterday.total) * 100 : 0;
  const difference = MOCK_CUT.countedCash - MOCK_CUT.expectedCash;
  const isShort = difference < 0;

  const handleTabChange = (next: NavTab) => {
    if (next === tab) return;
    setTab(next);
    console.log('Navegar a:', next);
  };

  const closeCut = () => {
    Alert.alert(
      'Cerrar turno',
      `¿Confirmar corte con ${MOCK_CUT.today.transactions} ventas y $${MOCK_CUT.today.total.toFixed(2)}?`,
      [
        {text: 'Cancelar', style: 'cancel'},
        {text: 'Cerrar turno', style: 'default', onPress: () => console.log('Corte cerrado')},
      ],
    );
  };

  return (
    <GlassBackground>
      <TopAppBar title="Corte de caja" />

      <ScrollView contentContainerStyle={{padding: spacing.md, paddingBottom: 120}}>
        {/* ── Resumen comparativo (hoy vs. ayer) ─────────────────────── */}
        <GlassSurface style={styles.card}>
          <Text style={[styles.cardTitle, {color: colors.text, fontSize: fonts.medium}]}>
            Resumen de ventas
          </Text>
          <View style={styles.compareRow}>
            <View style={styles.compareCol}>
              <Text style={[styles.compareLabel, {color: colors.textSecondary, fontSize: fonts.small}]}>
                Hoy
              </Text>
              <Text style={[styles.compareValue, {color: colors.text, fontSize: fonts.xlarge}]}>
                ${MOCK_CUT.today.total.toLocaleString('es-MX', {minimumFractionDigits: 2})}
              </Text>
            </View>
            <View style={styles.compareCol}>
              <Text style={[styles.compareLabel, {color: colors.textSecondary, fontSize: fonts.small}]}>
                Ayer
              </Text>
              <Text style={[styles.compareValue, {color: colors.textSecondary, fontSize: fonts.xlarge}]}>
                ${MOCK_CUT.yesterday.total.toLocaleString('es-MX', {minimumFractionDigits: 2})}
              </Text>
            </View>
            {/* Tendencia */}
            <View
              style={[
                styles.trendBadge,
                {backgroundColor: delta >= 0 ? colors.secondarySoft : colors.dangerSoft},
              ]}>
              <Text
                style={[
                  styles.trendText,
                  {color: delta >= 0 ? colors.success : colors.danger, fontSize: fonts.small},
                ]}>
                {delta >= 0 ? '▲' : '▼'} {Math.abs(deltaPct).toFixed(1)}%
              </Text>
            </View>
          </View>
          {/* Barra comparativa (proporción del total) */}
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${Math.min(100, (MOCK_CUT.today.total / (MOCK_CUT.today.total + MOCK_CUT.yesterday.total)) * 100)}%`,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>
        </GlassSurface>

        {/* ── Reconciliación: esperado vs. real ──────────────────────── */}
        <GlassSurface style={styles.card}>
          <Text style={[styles.cardTitle, {color: colors.text, fontSize: fonts.medium}]}>
            Flujo de caja
          </Text>
          <View style={styles.reconcileRow}>
            <Text style={[styles.reconcileLabel, {color: colors.textSecondary, fontSize: fonts.regular}]}>
              Esperado
            </Text>
            <Text style={[styles.reconcileValue, {color: colors.text, fontSize: fonts.medium}]}>
              ${MOCK_CUT.expectedCash.toLocaleString('es-MX', {minimumFractionDigits: 2})}
            </Text>
          </View>
          <View style={styles.reconcileRow}>
            <Text style={[styles.reconcileLabel, {color: colors.textSecondary, fontSize: fonts.regular}]}>
              Contado
            </Text>
            <Text style={[styles.reconcileValue, {color: colors.text, fontSize: fonts.medium}]}>
              ${MOCK_CUT.countedCash.toLocaleString('es-MX', {minimumFractionDigits: 2})}
            </Text>
          </View>
          <View style={[styles.diffRow, {borderTopColor: colors.border}]}>
            <Text style={[styles.reconcileLabel, {color: colors.text, fontSize: fonts.regular}]}>
              Diferencia
            </Text>
            <View style={styles.diffRight}>
              <Text
                style={[
                  styles.diffValue,
                  {color: isShort ? colors.danger : colors.success, fontSize: fonts.medium},
                ]}>
                {isShort ? '−' : '+'}${Math.abs(difference).toFixed(2)}
              </Text>
              <Text style={[styles.diffTag, {color: isShort ? colors.danger : colors.success, fontSize: fonts.small}]}>
                {isShort ? 'Faltante' : 'Sobrante'}
              </Text>
            </View>
          </View>
        </GlassSurface>

        {/* ── Desglose por método de pago ────────────────────────────── */}
        <GlassSurface style={styles.card}>
          <Text style={[styles.cardTitle, {color: colors.text, fontSize: fonts.medium}]}>
            Desglose por método
          </Text>
          {MOCK_CUT.byMethod.map(m => (
            <View key={m.method} style={styles.methodRow}>
              <Text style={[styles.methodIcon, {fontSize: fonts.regular}]}>{m.icon}</Text>
              <Text style={[styles.methodLabel, {color: colors.textSecondary, fontSize: fonts.regular}]}>
                {m.method}
              </Text>
              <Text style={[styles.methodAmount, {color: colors.text, fontSize: fonts.medium}]}>
                ${m.amount.toLocaleString('es-MX', {minimumFractionDigits: 2})}
              </Text>
            </View>
          ))}
        </GlassSurface>

        {/* ── Acciones ──────────────────────────────────────────────── */}
        <View style={styles.actions}>
          <POSButton
            title="Reimprimir corte"
            variant="secondary"
            onPress={() => console.log('Reimprimir corte')}
            style={styles.actionBtn}
            testID="btn-reprint-cut"
          />
          <POSButton
            title="Cerrar turno"
            onPress={closeCut}
            style={styles.actionBtn}
            testID="btn-close-cut"
          />
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <BottomNavBar active={tab} onChange={handleTabChange} />
      </View>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  card: {padding: 16, marginBottom: 12},
  cardTitle: {fontWeight: '700', marginBottom: 12},
  compareRow: {flexDirection: 'row', alignItems: 'flex-end', gap: 24},
  compareCol: {flex: 1},
  compareLabel: {fontWeight: '500'},
  compareValue: {fontWeight: '800', marginTop: 2},
  trendBadge: {borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4},
  trendText: {fontWeight: '700'},
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginTop: 12,
    overflow: 'hidden',
  },
  barFill: {height: 8, borderRadius: 4},
  reconcileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  reconcileLabel: {fontWeight: '500'},
  reconcileValue: {fontWeight: '700'},
  diffRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    marginTop: 4,
    borderTopWidth: 1,
  },
  diffRight: {flexDirection: 'row', alignItems: 'center', gap: 8},
  diffValue: {fontWeight: '800'},
  diffTag: {fontWeight: '700'},
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  methodIcon: {marginRight: 10},
  methodLabel: {flex: 1, fontWeight: '500'},
  methodAmount: {fontWeight: '700'},
  actions: {flexDirection: 'row', gap: 12, marginTop: 8},
  actionBtn: {flex: 1},
  bottomNav: {position: 'absolute', bottom: 0, left: 0, right: 0},
});
