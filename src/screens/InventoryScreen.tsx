/**
 * screens/InventoryScreen.tsx — Gestión de inventario (spec 4.3).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Flujo del spec:
 *   - TopAppBar + búsqueda con botón de filtro avanzado.
 *   - Chips de categoría (del servidor; mismas que en Productos).
 *   - KPIs calculados de los productos reales: Total, Agotados, Categorías.
 *   - Lista "Product Catalog" con nombre, SKU, stock, StatusChip.
 *   - FAB "+" para agregar producto.
 *   - BottomNavBar (Productos/Inventario/Reportes).
 *
 * FUENTE DE DATOS: GET /products + GET /categories (misma que la terminal).
 * Los datos de la BD son la fuente de verdad; si el servidor no responde
 * se muestra un mensaje de error (sin mock).
 * ────────────────────────────────────────────────────────────────────────
 */
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import GlassBackground from '../components/GlassBackground';
import TopAppBar from '../components/TopAppBar';
import BottomNavBar, {NavTab} from '../components/BottomNavBar';
import SearchInput from '../components/SearchInput';
import FilterChip from '../components/FilterChip';
import KpiCard from '../components/KpiCard';
import StatusChip, {StockStatus} from '../components/StatusChip';
import Fab from '../components/Fab';
import GlassSurface from '../components/GlassSurface';

import {useTheme} from '../hooks/useTheme';
import {Category, Product} from '../models';
import {searchProducts, getCategories} from '../api/endpoints';

interface InventoryScreenProps {
  /** Pestaña activa (controlada por DashboardScreen) */
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  /** Al tocar el avatar (menú de usuario / cerrar sesión) */
  onAvatarPress?: () => void;
  /** Pestañas visibles por permisos (Reportes oculta para el Vendedor) */
  visibleTabs?: NavTab[];
}

/** Deriva el status de stock (umbral min_stock; spec 3.8) */
function stockStatus(p: Product): StockStatus {
  if (p.stock <= 0) return 'out_of_stock';
  if (p.stock <= p.min_stock) return 'low_stock';
  return 'in_stock';
}

export default function InventoryScreen({
  activeTab,
  onTabChange,
  onAvatarPress,
  visibleTabs,
}: InventoryScreenProps) {
  const {colors, fonts, spacing} = useTheme();

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Productos y categorías reales (fuente de verdad: BD vía API)
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  /* ── Carga: GET /products + /categories (igual que la terminal) ──── */
  const loadInventory = useCallback(async () => {
    setLoading(true);
    // limit 50 = máximo del backend (RF-CA-006: 20, el servicio permite 50)
    const prodRes = await searchProducts({limit: 50}).catch(() => null);
    const cats = await getCategories().catch(() => null);
    if (prodRes) {
      setProducts(prodRes.items);
    }
    if (cats) {
      setCategories(cats);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadInventory();
  }, [loadInventory]);

  /* ── KPIs calculados de los datos reales ─────────────────────────── */
  const kpis = useMemo(() => {
    const outOfStock = products.filter(p => p.stock <= 0).length;
    const catCount = categories.length;
    return {
      totalItems: products.length.toLocaleString('es-MX'),
      totalItemsTrend: '',
      outOfStock: String(outOfStock),
      categories: `${catCount} ${catCount === 1 ? 'activa' : 'activas'}`,
    };
  }, [products, categories]);

  /* ── Filtrado: búsqueda + categoría ──────────────────────────────── */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(p => {
      const matchCat = activeCategory === 'all' || p.category_id === activeCategory;
      const matchQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.sku ?? '').toLowerCase().includes(q) ||
        (p.internal_code ?? '').toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [products, query, activeCategory]);

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

        {/* Chips de categoría (del servidor, mismas que en Productos) */}
        <View style={[styles.chips, {marginTop: spacing.sm}]}>
          <FilterChip
            label="Todos"
            active={activeCategory === 'all'}
            onPress={() => setActiveCategory('all')}
            testID="inv-chip-all"
          />
          {categories.map(cat => (
            <FilterChip
              key={cat.id}
              label={cat.name}
              active={activeCategory === cat.id}
              onPress={() => setActiveCategory(cat.id)}
              testID={`inv-chip-${cat.id}`}
            />
          ))}
        </View>

        {/* KPIs calculados de los datos reales */}
        <View style={[styles.kpiRow, {marginTop: spacing.md}]}>
          <KpiCard
            label="Total items"
            value={kpis.totalItems}
            trend={kpis.totalItemsTrend}
            style={styles.kpi}
            testID="kpi-total"
          />
          <KpiCard
            label="Agotados"
            value={kpis.outOfStock}
            alert={Number(kpis.outOfStock) > 0}
            style={styles.kpi}
            testID="kpi-outofstock"
          />
          <KpiCard
            label="Categorías"
            value={kpis.categories}
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

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, {color: colors.textSecondary, fontSize: fonts.small}]}>
              Cargando inventario…
            </Text>
          </View>
        ) : filtered.length === 0 ? (
          <Text style={[styles.empty, {color: colors.textSecondary, fontSize: fonts.regular}]}>
            No hay productos para «{query}» o el servidor no está disponible
          </Text>
        ) : (
          filtered.map(p => (
            <GlassSurface key={p.id} style={styles.rowCard}>
              <View style={[styles.thumb, {backgroundColor: colors.primarySoft}]}>
                <Text style={[styles.thumbText, {color: colors.primary}]}>
                  {p.name.charAt(0)}
                </Text>
              </View>
              <View style={styles.rowInfo}>
                <Text numberOfLines={1} style={[styles.rowName, {color: colors.text, fontSize: fonts.regular}]}>
                  {p.name}
                </Text>
                <Text style={[styles.rowSku, {color: colors.textSecondary, fontSize: fonts.small}]}>
                  {p.sku ?? p.internal_code} · Stock: {p.stock}
                </Text>
              </View>
              <StatusChip status={stockStatus(p)} testID={`status-${p.id}`} />
            </GlassSurface>
          ))
        )}
      </ScrollView>

      {/* FAB + para agregar producto */}
      <Fab variant="add" onPress={() => console.log('Nuevo producto')} testID="fab-add-product" />

      {/* Navegación inferior (controlada por el Dashboard) */}
      <View style={styles.bottomNav}>
        <BottomNavBar active={activeTab} onChange={onTabChange} visibleTabs={visibleTabs} />
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
  chips: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
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
  loading: {alignItems: 'center', paddingTop: 32},
  loadingText: {marginTop: 8, fontWeight: '600'},
  empty: {textAlign: 'center', paddingTop: 32},
  bottomNav: {position: 'absolute', bottom: 0, left: 0, right: 0},
});
