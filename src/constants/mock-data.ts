/**
 * constants/mock-data.ts — Datos de demostración (mock).
 *
 * ────────────────────────────────────────────────────────────────────────
 * SOLO para desarrollo/UI preview: el servidor es la fuente de verdad
 * (regla de arquitectura 5). Estos datos alimentan las pantallas hasta
 * conectar la API real (Fases 3-5 del changelog).
 * Nunca usar en producción.
 * ────────────────────────────────────────────────────────────────────────
 */
import {Category, Product} from '../models';

/** Categorías de ejemplo (chips del catálogo) */
export const MOCK_CATEGORIES: Category[] = [
  {id: 'all', tenant_id: 'demo', name: 'Todos', prefix: 'ALL', display_order: 0, is_active: true, product_count: 0},
  {id: 'c-food', tenant_id: 'demo', name: 'Comida', prefix: 'COM', display_order: 1, is_active: true, product_count: 8},
  {id: 'c-drinks', tenant_id: 'demo', name: 'Bebidas', prefix: 'BEB', display_order: 2, is_active: true, product_count: 6},
  {id: 'c-electronics', tenant_id: 'demo', name: 'Electrónicos', prefix: 'ELE', display_order: 3, is_active: true, product_count: 4},
  {id: 'c-cleaning', tenant_id: 'demo', name: 'Limpieza', prefix: 'LIM', display_order: 4, is_active: true, product_count: 3},
];

/** Producto base (espejo de Product) */
function p(partial: Partial<Product> & Pick<Product, 'id' | 'name' | 'price' | 'stock'>): Product {
  return {
    id: partial.id,
    tenant_id: 'demo',
    category_id: partial.category_id ?? 'c-food',
    name: partial.name,
    barcode: partial.barcode ?? null,
    internal_code: partial.internal_code ?? 'P0001',
    sku: partial.sku ?? partial.internal_code ?? 'SKU-0001',
    description: partial.description ?? null,
    base_unit_id: 'u-pza',
    sale_unit_id: 'u-pza',
    unit_conversion: 1,
    price: partial.price,
    cost: partial.cost ?? 0,
    stock: partial.stock,
    min_stock: partial.min_stock ?? 5,
    max_stock: partial.max_stock ?? 500,
    is_scale_enabled: partial.is_scale_enabled ?? false,
    allow_fractional_sale: partial.allow_fractional_sale ?? false,
    is_active: partial.is_active ?? true,
  };
}

/** Catálogo del terminal de ventas (grid 2 columnas) */
export const MOCK_PRODUCTS: Product[] = [
  p({id: 'pr1', name: 'Coca-Cola 600ml', price: 18.5, stock: 120, category_id: 'c-drinks', internal_code: 'BEB0001', sku: 'SKU-BEB01', is_scale_enabled: false}),
  p({id: 'pr2', name: 'Sabritas 45g', price: 9.0, stock: 5, category_id: 'c-food', internal_code: 'COM0001', sku: 'SKU-COM01', min_stock: 10}),
  p({id: 'pr3', name: 'Leche Lala 1L', price: 28.0, stock: 40, category_id: 'c-drinks', internal_code: 'BEB0002', sku: 'SKU-BEB02'}),
  p({id: 'pr4', name: 'Huevo 30 pzas', price: 78.0, stock: 0, category_id: 'c-food', internal_code: 'COM0002', sku: 'SKU-COM02'}),
  p({id: 'pr5', name: 'Galaxy S24 128GB', price: 14999.0, stock: 12, category_id: 'c-electronics', internal_code: 'ELE0001', sku: 'SKU-ELE01'}),
  p({id: 'pr6', name: 'Cloro 1L', price: 24.0, stock: 60, category_id: 'c-cleaning', internal_code: 'LIM0001', sku: 'SKU-LIM01'}),
  p({id: 'pr7', name: 'Pan Bimbo 680g', price: 45.0, stock: 22, category_id: 'c-food', internal_code: 'COM0003', sku: 'SKU-COM03'}),
  p({id: 'pr8', name: 'Agua Bonafont 1L', price: 15.0, stock: 200, category_id: 'c-drinks', internal_code: 'BEB0003', sku: 'SKU-BEB03'}),
  p({id: 'pr9', name: 'Jabón Zote 200g', price: 18.0, stock: 3, category_id: 'c-cleaning', internal_code: 'LIM0002', sku: 'SKU-LIM02', min_stock: 8}),
  p({id: 'pr10', name: 'Audífonos Sony', price: 1299.0, stock: 8, category_id: 'c-electronics', internal_code: 'ELE0002', sku: 'SKU-ELE02'}),
];

/** Métricas del inventario (KPIs) */
export const MOCK_INVENTORY_KPIS = {
  totalItems: '1,248',
  totalItemsTrend: '+4%',
  outOfStock: '14',
  categories: '24 activas',
};

/** Ítems de la lista de inventario (name + sku + stock → StatusChip) */
export interface InventoryRow {
  id: string;
  name: string;
  sku: string;
  stock: number;
  minStock: number;
  /** Categoría (mismo id que MOCK_CATEGORIES) para el filtrado */
  category_id: string;
}

export const MOCK_INVENTORY: InventoryRow[] = [
  {id: 'i1', name: 'Coca-Cola 600ml', sku: 'SKU-BEB01', stock: 120, minStock: 20, category_id: 'c-drinks'},
  {id: 'i2', name: 'Sabritas 45g', sku: 'SKU-COM01', stock: 5, minStock: 10, category_id: 'c-food'},
  {id: 'i3', name: 'Galaxy S24 128GB', sku: 'SKU-ELE01', stock: 12, minStock: 3, category_id: 'c-electronics'},
  {id: 'i4', name: 'Huevo 30 pzas', sku: 'SKU-COM02', stock: 0, minStock: 10, category_id: 'c-food'},
  {id: 'i5', name: 'Jabón Zote 200g', sku: 'SKU-LIM02', stock: 3, minStock: 8, category_id: 'c-cleaning'},
  {id: 'i6', name: 'Leche Lala 1L', sku: 'SKU-BEB02', stock: 40, minStock: 15, category_id: 'c-drinks'},
];

/** Corte de caja (comparativo + reconciliación + desglose) */
export const MOCK_CUT = {
  today: {total: 12480.0, transactions: 86},
  yesterday: {total: 11205.0, transactions: 79},
  expectedCash: 5230.0,
  countedCash: 5240.0,
  byMethod: [
    {method: 'Efectivo', amount: 4980.0, icon: '💵'},
    {method: 'Tarjeta', amount: 7500.0, icon: '💳'},
    {method: 'Transferencia', amount: 0.0, icon: '🏦'},
    {method: 'Crédito', amount: 0.0, icon: '📒'},
  ],
};

/** Ticket (recibo digital) */
export const MOCK_TICKET = {
  store: {name: 'Luxe Retail Co.', address: 'Av. Reforma 123, CDMX', phone: 'Tel. 555-1234'},
  meta: {date: '12/08/2026', time: '14:32:05', folio: 'V-000123', cashier: 'Ana G.'},
  items: [
    {name: 'Coca-Cola 600ml', quantity: 2, unitPrice: 18.5},
    {name: 'Sabritas 45g', quantity: 1, unitPrice: 9.0},
    {name: 'Leche Lala 1L', quantity: 1, unitPrice: 28.0},
  ],
  taxRate: 0.16,
  payment: {method: 'Efectivo', authorization: '123456'},
};
