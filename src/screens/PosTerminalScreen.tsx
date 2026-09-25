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
 * MODO DESKTOP (prop `desktop`, WINDOWS_PLAN §5.2):
 *   - Sin TopAppBar/BottomNavBar/FAB (los provee AppShell).
 *   - Grid reactivo: columnas según breakpoint.
 *   - Carrito como CartPanel (panel derecho) en lugar de sheet.
 *   - Atajos: Ctrl+K → búsqueda; Ctrl+Space → alternar carrito.
 *
 * CARGA DE DATOS: se intenta GET /products + GET /categories al montar.
 * Si el servidor no responde, cae a MOCK_PRODUCTS/MOCK_CATEGORIES para
 * que la UI no se rompa (el servidor es la fuente de verdad).
 * ────────────────────────────────────────────────────────────────────────
 */
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View} from 'react-native';

import GlassBackground from '../components/GlassBackground';
import TopAppBar from '../components/TopAppBar';
import BottomNavBar, {NavTab} from '../components/BottomNavBar';
import SearchInput from '../components/SearchInput';
import FilterChip from '../components/FilterChip';
import ProductCard from '../components/ProductCard';
import Fab from '../components/Fab';
import ProductSheet from '../components/ProductSheet';
import CartSheet from '../components/CartSheet';
import CartPanel from '../components/CartPanel';

import {useTheme} from '../hooks/useTheme';
import {useWindowBreakpoint} from '../layout/useWindowBreakpoint';
import {useShortcut} from '../layout/useShortcut';
import {getGridColumns} from '../layout/Breakpoints';
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
  /** Modo escritorio: sin chrome propio, grid reactivo + CartPanel. */
  desktop?: boolean;
}

export default function PosTerminalScreen({
  activeTab,
  onTabChange,
  onAvatarPress,
  visibleTabs,
  desktop = false,
}: PosTerminalScreenProps) {
  const {colors, fonts, spacing} = useTheme();
  const breakpoint = useWindowBreakpoint();

  /* ── Estado local ─────────────────────────────────────────────────── */
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Producto seleccionado para el sheet de cantidad (null = cerrado)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  // Carrito visible (móvil: sheet; desktop: panel derecho)
  const [cartVisible, setCartVisible] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  // Datos: productos y categorías (reales o fallback mock)
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [priceTypes, setPriceTypes] = useState<PriceType[]>([]);
  const [loading, setLoading] = useState(true);

  // Carrito real (Zustand): badge con el conteo de ítems
  const cartCount = useCartStore(state => state.items.length);
  // Usuario: si cambia (login nuevo/restauración), recargar catálogo
  const user = useAuthStore(state => state.user);

  // Ref del input de búsqueda para el atajo Ctrl+K (desktop)
  const searchRef = useRef<TextInput>(null);

  // Columnas del catálogo: fijo (4) en móvil, reactivo en desktop
  const numColumns = desktop ? getGridColumns(breakpoint) : 4;

  // Atajos de escritorio (WINDOWS_PLAN §6.3)
  useShortcut(event => {
    if (!desktop) {
      return false;
    }
    if (event.key === 'k' && event.ctrlKey) {
      searchRef.current?.focus();
      return true;
    }
    if (event.key === ' ' && event.ctrlKey) {
      setCartOpen(open => !open);
      return true;
    }
    return false;
  });

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

  /* ── Bloques reutilizables (header + catálogo) ───────────────────── */

  const header = (
    <View style={styles.header}>
      <SearchInput
        placeholder="Buscar productos…"
        value={query}
        onChangeText={setQuery}
        inputRef={searchRef}
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
  );

  const catalog = loading ? (
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
      numColumns={numColumns}
      columnWrapperStyle={styles.row}
      contentContainerStyle={
        desktop
          ? {padding: spacing.md, paddingBottom: spacing.lg}
          : {padding: spacing.md, paddingBottom: 160}
      }
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
  );

  /* ── Modo escritorio: contenido + panel de carrito ────────────────── */

  if (desktop) {
    return (
      <View style={styles.desktopRow}>
        <View style={styles.desktopMain}>
          {header}
          {catalog}
        </View>
        <CartPanel visible={cartOpen} onClose={() => setCartOpen(false)} />
      </View>
    );
  }

  /* ── Modo móvil/tablet: chrome completo ───────────────────────────── */

  return (
    <GlassBackground>
      <TopAppBar title="Terminal de ventas" onAvatarPress={onAvatarPress} />

      {header}

      {catalog}

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
  // Desktop (WINDOWS_PLAN §5.2)
  desktopRow: {flex: 1, flexDirection: 'row'},
  desktopMain: {flex: 1},
});