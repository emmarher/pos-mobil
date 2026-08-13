/**
 * screens/InventoryScreen.tsx — Gestión de inventario (spec 4.3).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Flujo del spec:
 *   - TopAppBar + búsqueda con botón de filtro avanzado.
 *   - KPIs: Total Items (tendencia), Agotados (alerta roja), Categorías.
 *   - Lista "Product Catalog" con imagen, nombre, SKU, stock, StatusChip.
 *   - FAB "+" para agregar producto.
 *   - BottomNavBar (Caja/Inventario/Reportes).
 * ────────────────────────────────────────────────────────────────────────
 */
import React, {useMemo, useState} from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import GlassBackground from '../components/GlassBackground';
import TopAppBar from '../components/TopAppBar';
import BottomNavBar, {NavTab} from '../components/BottomNavBar';
import SearchInput from '../components/SearchInput';
import KpiCard from '../components/KpiCard';
import StatusChip, {StockStatus} from '../components/StatusChip';
import Fab from '../components/Fab';
import GlassSurface from '../components/GlassSurface';

import {useTheme} from '../hooks/useTheme';
import {MOCK_INVENTORY, MOCK_INVENTORY_KPIS, InventoryRow} from '../constants/mock-data';

interface InventoryScreenProps {
  /** Pestaña activa (controlada por DashboardScreen) */
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  /** Al tocar el avatar (menú de usuario / cerrar sesión) */
  onAvatarPress?: () => void;
}

/** Deriva el status de stock (umbral min_stock; spec 3.8) */
function stockStatus(row: InventoryRow): StockStatus {
  if (row.stock <= 0) return 'out_of_stock';
  if (row.stock <= row.minStock) return 'low_stock';
  return 'in_stock';
}

export default function InventoryScreen({
  activeTab,
  onTabChange,
  onAvatarPress,
}: InventoryScreenProps) {
  const {colors, fonts, spacing} = useTheme();

  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_INVENTORY;
    return MOCK_INVENTORY.filter(
      r => r.name.toLowerCase().includes(q) || r.sku.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <GlassBackground>
      <TopAppBar title="Inventario" notificationCount={1} onAvatarPress={onAvatarPress} />

      {/* Búsqueda + filtro avanzado */}
      <View style={styles.header}>
        <View style={styles.searchRow}>
          <View style={styles.searchFlex}>
            <SearchInput
              placeholder="Buscar productos, SKUs…"
              value={query}
              onChangeText={setQuery}
              testID="search-inventory"
            />
          </View>
          <TouchableOpacity
            style={[styles.filterBtn, {backgroundColor: colors.surface, borderColor: colors.border}]}
            onPress={() => console.log('Filtro avanzado')}
            testID="btn-filter-advanced">
            <Text style={{fontSize: 18}}>⚙</Text>
          </TouchableOpacity>
        </View>

        {/* KPIs: Total Items / Agotados / Categorías */}
        <View style={[styles.kpiRow, {marginTop: spacing.md}]}>
          <KpiCard
            label="Total items"
            value={MOCK_INVENTORY_KPIS.totalItems}
            trend={MOCK_INVENTORY_KPIS.totalItemsTrend}
            style={styles.kpi}
            testID="kpi-total"
          />
          <KpiCard
            label="Agotados"
            value={MOCK_INVENTORY_KPIS.outOfStock}
            alert
            style={styles.kpi}
            testID="kpi-outofstock"
          />
          <KpiCard
            label="Categorías"
            value={MOCK_INVENTORY_KPIS.categories}
            style={styles.kpi}
            testID="kpi-categories"
          />
        </View>
      </View>

      {/* Lista del catálogo */}
      <ScrollView contentContainerStyle={{padding: spacing.md, paddingBottom: 160}}>
        <Text style={[styles.sectionTitle, {color: colors.text, fontSize: fonts.medium}]}>
          Catálogo de productos
        </Text>

        {filtered.map(row => (
          <GlassSurface key={row.id} style={styles.rowCard}>
            <View style={[styles.thumb, {backgroundColor: colors.primarySoft}]}>
              <Text style={[styles.thumbText, {color: colors.primary}]}>
                {row.name.charAt(0)}
              </Text>
            </View>
            <View style={styles.rowInfo}>
              <Text numberOfLines={1} style={[styles.rowName, {color: colors.text, fontSize: fonts.regular}]}>
                {row.name}
              </Text>
              <Text style={[styles.rowSku, {color: colors.textSecondary, fontSize: fonts.small}]}>
                {row.sku} · Stock: {row.stock}
              </Text>
            </View>
            <StatusChip status={stockStatus(row)} testID={`status-${row.id}`} />
          </GlassSurface>
        ))}
      </ScrollView>

      {/* FAB + para agregar producto */}
      <Fab variant="add" onPress={() => console.log('Nuevo producto')} testID="fab-add-product" />

      {/* Navegación inferior (controlada por el Dashboard) */}
      <View style={styles.bottomNav}>
        <BottomNavBar active={activeTab} onChange={onTabChange} />
      </View>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  header: {paddingHorizontal: 16, paddingTop: 12},
  searchRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  searchFlex: {flex: 1},
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiRow: {flexDirection: 'row', gap: 8},
  kpi: {flex: 1},
  sectionTitle: {fontWeight: '700', marginBottom: 8},
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  thumbText: {fontWeight: '800', fontSize: 20},
  rowInfo: {flex: 1, marginRight: 8},
  rowName: {fontWeight: '600'},
  rowSku: {fontWeight: '500', marginTop: 2},
  bottomNav: {position: 'absolute', bottom: 0, left: 0, right: 0},
});
