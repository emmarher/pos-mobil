/**
 * screens/ReportsScreen.tsx — Reportes (placeholder, spec BottomNav).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Tercera pestaña fija de la navegación (Caja/Inventario/Reportes).
 * Vista previa de métricas consolidadas. En Fase 2 (reportes del PRD)
 * se conecta a GET /reports/quick-stats y /reports/sales-history.
 * ────────────────────────────────────────────────────────────────────────
 */
import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';

import GlassBackground from '../components/GlassBackground';
import TopAppBar from '../components/TopAppBar';
import BottomNavBar, {NavTab} from '../components/BottomNavBar';
import GlassSurface from '../components/GlassSurface';
import KpiCard from '../components/KpiCard';

import {useTheme} from '../hooks/useTheme';

interface ReportsScreenProps {
  /** Pestaña activa (controlada por DashboardScreen) */
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export default function ReportsScreen({activeTab, onTabChange}: ReportsScreenProps) {
  const {colors, fonts, spacing} = useTheme();

  return (
    <GlassBackground>
      <TopAppBar title="Reportes" />

      <ScrollView contentContainerStyle={{padding: spacing.md, paddingBottom: 120}}>
        <Text style={[styles.sectionTitle, {color: colors.text, fontSize: fonts.medium}]}>
          Vista general
        </Text>
        <View style={styles.kpiRow}>
          <KpiCard label="Ventas hoy" value="$12,480" trend="+11.4%" style={styles.kpi} />
          <KpiCard label="Ticket promedio" value="$145.12" style={styles.kpi} />
        </View>

        <GlassSurface style={[styles.card, {marginTop: spacing.md}]}>
          <Text style={[styles.cardTitle, {color: colors.text, fontSize: fonts.medium}]}>
            Reportes disponibles
          </Text>
          {['Ventas por período', 'Ventas por vendedor', 'Ventas por producto', 'Calidad de servicio (QoS)'].map(
            r => (
              <View key={r} style={[styles.reportRow, {borderBottomColor: colors.border}]}>
                <Text style={[styles.reportName, {color: colors.text, fontSize: fonts.regular}]}>
                  {r}
                </Text>
                <Text style={[styles.reportStatus, {color: colors.textSecondary, fontSize: fonts.small}]}>
                  Próximamente
                </Text>
              </View>
            ),
          )}
        </GlassSurface>
      </ScrollView>

      <View style={styles.bottomNav}>
        <BottomNavBar active={activeTab} onChange={onTabChange} />
      </View>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {fontWeight: '700', marginBottom: 8},
  kpiRow: {flexDirection: 'row', gap: 8},
  kpi: {flex: 1},
  card: {padding: 16},
  cardTitle: {fontWeight: '700', marginBottom: 8},
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  reportName: {fontWeight: '600'},
  reportStatus: {fontWeight: '500'},
  bottomNav: {position: 'absolute', bottom: 0, left: 0, right: 0},
});
