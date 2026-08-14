/**
 * screens/PosTerminalScreen.tsx — Terminal de ventas / Caja (spec 4.2).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Flujo del spec:
 *   - TopAppBar (avatar, "Terminal de ventas", notificación).
 *   - Búsqueda global con debounce.
 *   - Chips de categoría (del servidor; fallback mock).
 *   - Catálogo en grid (productos del servidor; fallback mock).
 *   - Al tocar un producto → ProductSheet (cantidad → carrito).
 *   - FAB carrito → CartSheet (totales, pago, confirmar POST /sales).
 *   - BottomNavBar (Productos/Inventario/Reportes).
 *
 * CARGA DE DATOS: se intenta GET /products + GET /categories al montar.
 * Si el servidor no responde, cae a MOCK_PRODUCTS/MOCK_CATEGORIES para
 * que la UI no se rompa (el servidor es la fuente de verdad).
 * ────────────────────────────────────────────────────────────────────────
 */
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, FlatList, StyleSheet, Text, View} from 'react-native';

import GlassBackground from '../components/GlassBackground';
import TopAppBar from '../components/TopAppBar';
import BottomNavBar, {NavTab} from '../components/BottomNavBar';
import SearchInput from '../components/SearchInput';
import FilterChip from '../components/FilterChip';
import ProductCard from '../components/ProductCard';
import Fab from '../components/Fab';
import ProductSheet from '../components/ProductSheet';
import CartSheet from '../components/CartSheet';

import {useTheme} from '../hooks/useTheme';
import {MOCK_CATEGORIES, MOCK_PRODUCTS} from '../constants/mock-data';
import {Category, PriceType, Product} from '../models';
import {searchProducts, getCategories, getPriceTypes} from '../api/endpoints';
import {useCartStore} from '../stores/cart.store';
import {useAuthStore} from '../stores/auth.store';

interface PosTerminalScreenProps {
  /** Pestaña activa (controlada por DashboardScreen) */
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  /** Al tocar el avatar (menú de usuario / cerrar sesión) */
  onAvatarPress?: () => void;
  /** Pestañas visibles por permisos (Reportes oculta para el Vendedor) */
  visibleTabs?: NavTab[];
}

export default function PosTerminalScreen({
  activeTab,
  onTabChange,
  onAvatarPress,
  visibleTabs,
}: PosTerminalScreenProps) {
  const {colors, fonts, spacing} = useTheme();

  /* ── Estado local ─────────────────────────────────────────────────── */
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Producto seleccionado para el sheet de cantidad (null = cerrado)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  // Carrito visible
  const [cartVisible, setCartVisible] = useState(false);

  // Datos: productos y categorías (reales o fallback mock)
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [priceTypes, setPriceTypes] = useState<PriceType[]>([]);
  const [loading, setLoading] = useState(true);

  // Carrito real (Zustand): badge con el conteo de ítems
  const cartCount = useCartStore(state => state.items.length);
  // Usuario: si cambia (login nuevo/restauración), recargar catálogo
  const user = useAuthStore(state => state.user);

  /* ── Carga inicial: GET /products + /categories + /price-types ───── */
  const loadCatalog = useCallback(async () => {
    setLoading(true);
    // Cada llamada con su propio try/catch: si una falla (ej. token
    // expirado) las demás aún cargan y no se mantiene el mock completo.
    // (Evita Promise.allSettled por compatibilidad con el runtime RN.)
    const prodRes = await searchProducts({limit: 50}).catch(() => null);
    const cats = await getCategories().catch(() => null);
    const pts = await getPriceTypes().catch(() => null);

    // Solo reemplazar si hay datos; los reales son la fuente de verdad
    if (prodRes && prodRes.items.length > 0) {
      setProducts(prodRes.items);
    }
    if (cats && cats.length > 0) {
      setCategories(cats);
    }
    if (pts && pts.length > 0) {
      setPriceTypes(pts);
    }
    setLoading(false);
  }, []);

  // Recarga el catálogo al montar y cuando cambia el usuario (login fresco)
  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog, user]);

  /* ── Filtrado: búsqueda (debounce 300ms) + categoría ─────────────── */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(pr => {
      const matchCat = activeCategory === 'all' || pr.category_id === activeCategory;
      const matchQ =
        !q ||
        pr.name.toLowerCase().includes(q) ||
        (pr.sku ?? '').toLowerCase().includes(q) ||
        (pr.internal_code ?? '').toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [products, query, activeCategory]);

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
          {categories.map(cat => (
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

      {/* Catálogo en grid */}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, {color: colors.textSecondary, fontSize: fonts.small}]}>
            Cargando productos…
          </Text>
        </View>
      ) : (
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
              <ProductCard
                product={item}
                onPress={() => setSelectedProduct(item)}
                testID={`product-${item.id}`}
              />
            </View>
          )}
        />
      )}

      {/* Sheet de cantidad al tocar un producto */}
      <ProductSheet
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        priceTypes={priceTypes}
      />

      {/* Carrito al tocar el FAB */}
      <CartSheet visible={cartVisible} onClose={() => setCartVisible(false)} />

      {/* FAB carrito con badge */}
      <Fab
        onPress={() => setCartVisible(true)}
        badgeCount={cartCount}
        testID="fab-cart"
      />

      {/* Navegación inferior (controlada por el Dashboard) */}
      <View style={styles.bottomNav}>
        <BottomNavBar
          active={activeTab}
          onChange={onTabChange}
          cartCount={cartCount}
          visibleTabs={visibleTabs}
        />
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
  loading: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  loadingText: {marginTop: 8, fontWeight: '600'},
  bottomNav: {position: 'absolute', bottom: 0, left: 0, right: 0},
});
