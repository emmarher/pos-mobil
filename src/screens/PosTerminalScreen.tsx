/**
 * screens/PosTerminalScreen.tsx — Terminal de ventas / Caja (spec 4.2).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Flujo del spec:
 *   - TopAppBar (avatar, "Terminal de ventas", notificación).
 *   - Búsqueda global con debounce.
 *   - Chips de categoría (Todos, Comida, Bebidas, Electrónicos…).
 *   - Catálogo en grid 2 columnas (ProductCard).
 *   - FAB carrito con badge de ítems.
 *   - BottomNavBar (Caja/Inventario/Reportes).
 * Usa datos mock hasta conectar la API real (Fase 4 del changelog).
 * ────────────────────────────────────────────────────────────────────────
 */
import React, {useMemo, useState} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';

import GlassBackground from '../components/GlassBackground';
import TopAppBar from '../components/TopAppBar';
import BottomNavBar, {NavTab} from '../components/BottomNavBar';
import SearchInput from '../components/SearchInput';
import FilterChip from '../components/FilterChip';
import ProductCard from '../components/ProductCard';
import Fab from '../components/Fab';

import {useTheme} from '../hooks/useTheme';
import {MOCK_CATEGORIES, MOCK_PRODUCTS} from '../constants/mock-data';
import {Product} from '../models';

interface PosTerminalScreenProps {
  /** Pestaña activa (controlada por DashboardScreen) */
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  /** Al tocar el avatar (menú de usuario / cerrar sesión) */
  onAvatarPress?: () => void;
}

export default function PosTerminalScreen({
  activeTab,
  onTabChange,
  onAvatarPress,
}: PosTerminalScreenProps) {
  const {colors, fonts, spacing} = useTheme();

  /* ── Estado local ─────────────────────────────────────────────────── */
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [cartCount, setCartCount] = useState(3); // mock: carrito con 3 ítems

  /* ── Filtrado: búsqueda (debounce 300ms) + categoría ─────────────── */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_PRODUCTS.filter(pr => {
      const matchCat = activeCategory === 'all' || pr.category_id === activeCategory;
      const matchQ =
        !q ||
        pr.name.toLowerCase().includes(q) ||
        (pr.sku ?? '').toLowerCase().includes(q) ||
        (pr.internal_code ?? '').toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [query, activeCategory]);

  /* ── Acciones (mock; se conectan a la API en Fase 4) ─────────────── */
  const addToCart = (product: Product) => {
    setCartCount(c => c + 1);
    // TODO(Fase 4): addItem({product, quantity: 1, priceType, ...})
    console.log('Agregar al carrito:', product.name);
  };

  return (
    <GlassBackground>
      <TopAppBar title="Terminal de ventas" notificationCount={2} onAvatarPress={onAvatarPress} />

      {/* Búsqueda + categorías */}
      <View style={styles.header}>
        <SearchInput
          placeholder="Buscar productos…"
          value={query}
          onChangeText={setQuery}
          testID="search-products"
        />
        <View style={[styles.chips, {marginTop: spacing.sm}]}>
          {MOCK_CATEGORIES.map(cat => (
            <FilterChip
              key={cat.id}
              label={cat.name}
              active={activeCategory === cat.id}
              onPress={() => setActiveCategory(cat.id)}
              testID={`chip-${cat.id}`}
            />
          ))}
        </View>
      </View>

      {/* Catálogo en grid 4 columnas */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        numColumns={4}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{padding: spacing.md, paddingBottom: 160}}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, {color: colors.textSecondary, fontSize: fonts.regular}]}>
              No hay productos para "«{query}»"
            </Text>
          </View>
        }
        renderItem={({item}) => (
          <View style={styles.cell}>
            <ProductCard product={item} onPress={() => addToCart(item)} testID={`product-${item.id}`} />
          </View>
        )}
      />

      {/* FAB carrito con badge */}
      <Fab onPress={() => console.log('Abrir carrito')} badgeCount={cartCount} testID="fab-cart" />

      {/* Navegación inferior (controlada por el Dashboard) */}
      <View style={styles.bottomNav}>
        <BottomNavBar active={activeTab} onChange={onTabChange} cartCount={cartCount} />
      </View>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  header: {paddingHorizontal: 16, paddingTop: 12},
  chips: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  row: {gap: 20},
  cell: {flex: 1, marginBottom: 24},
  empty: {alignItems: 'center', paddingTop: 48},
  emptyText: {fontWeight: '600'},
  bottomNav: {position: 'absolute', bottom: 0, left: 0, right: 0},
});
