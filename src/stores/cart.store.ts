/**
 * cart.store.ts — Carrito en memoria del cajero (RF-VE-001).
 *
 * ────────────────────────────────────────────────────────────────────────
 * CONTRATO CRÍTICO (no negociable):
 * El carrito SOLO vive en memoria (Zustand). NUNCA se persiste en
 * AsyncStorage/DB local y NUNCA se envía al servidor hasta que el
 * cajero confirma la venta (POST /sales). Si esto se rompe, se viola
 * RF-VE-001.
 * ────────────────────────────────────────────────────────────────────────
 *
 * Contenido:
 *   1) Tipos de salida derivados  (CartTotals)
 *   2) Contrato del store         (CartState)
 *   3) Implementación Zustand     (useCartStore)
 */
import {create} from 'zustand';
import {
  CartItem,
  CreateSalePayload,
  Customer,
  PriceType,
  SalePayment,
} from '../models';

/* ──────────────────────────────────────────────────────────────────────
 * 1) TIPOS DERIVADOS
 *    Totales calculados del carrito, usados por la UI y por el payload
 *    de POST /sales.
 * ────────────────────────────────────────────────────────────────────── */
export interface CartTotals {
  /** Suma de subtotales de ítems (sin descuento) */
  subtotal: number;
  /** Suma de descuentos aplicados por ítem */
  discount: number;
  /** Total a cobrar = max(0, subtotal - discount) */
  total: number;
  /** Número de ítems en el carrito */
  itemCount: number;
}

/* ──────────────────────────────────────────────────────────────────────
 * 2) CONTRATO DEL STORE (CartState)
 *    Define estado + acciones. Toda mutación del carrito pasa por aquí
 *    para que el flujo de venta sea predecible y testeable.
 * ────────────────────────────────────────────────────────────────────── */
export interface CartState {
  /** Ítems en el carrito (RF-VE-002, paso 6: "Agregar al carrito") */
  items: CartItem[];
  /** Tipo de precio seleccionado (default = is_default del servidor) */
  priceType: PriceType | null;
  /** Cliente asociado (opcional; requerido para venta a crédito) */
  customer: Customer | null;
  /** Métodos de pago: se permiten varios por venta (RF-VE-004) */
  payments: SalePayment[];
  /** Vuelto calculado para pagos en efectivo */
  change: number;

  /** Selecciona el tipo de precio activo del carrito */
  setPriceType: (priceType: PriceType) => void;
  /** Agrega un ítem al final del carrito */
  addItem: (item: CartItem) => void;
  /** Ajusta un ítem existente (cantidad, peso, precio, descuento…) */
  updateItem: (key: string, patch: Partial<CartItem>) => void;
  /** Quita un ítem del carrito */
  removeItem: (key: string) => void;
  /** Asocia/desasocia el cliente de la venta */
  setCustomer: (customer: Customer | null) => void;
  /** Agrega un método de pago (ej. $200 efectivo + $300 tarjeta) */
  addPayment: (payment: SalePayment) => void;
  /** Quita un método de pago por índice */
  removePayment: (index: number) => void;
  /** Calcula el vuelto dado el monto recibido en efectivo */
  computeChange: (cashReceived: number) => void;
  /** Vacía el carrito tras confirmar la venta (o al cancelar) */
  clearCart: () => void;
  /** Construye el payload listo para POST /sales (SIN enviarlo) */
  buildSalePayload: () => CreateSalePayload;
  /** Totales derivados del estado actual */
  totals: () => CartTotals;
  /** Suma pagada (efectivo+tarjeta+transferencia+voucher; crédito NO cuenta) */
  paidAmount: () => number;
}

/* ──────────────────────────────────────────────────────────────────────
 * 3) IMPLEMENTACIÓN ZUSTAND
 *    Nota: `set` muta el estado, `get` lee el estado actual.
 *    El carrito empieza vacío en cada arranque de la app (memoria).
 * ────────────────────────────────────────────────────────────────────── */
export const useCartStore = create<CartState>((set, get) => ({
  /* Estado inicial: carrito vacío */
  items: [],
  priceType: null,
  customer: null,
  payments: [],
  change: 0,

  /* ── Mutaciones básicas del carrito ─────────────────────────────── */

  setPriceType: priceType => set({priceType}),

  addItem: item => set(state => ({items: [...state.items, item]})),

  updateItem: (key, patch) =>
    set(state => ({
      items: state.items.map(it =>
        it.key === key ? {...it, ...patch} : it,
      ),
    })),

  removeItem: key =>
    set(state => ({items: state.items.filter(it => it.key !== key)})),

  /* ── Cliente y pagos ────────────────────────────────────────────── */

  setCustomer: customer => set({customer}),

  addPayment: payment =>
    set(state => ({payments: [...state.payments, payment]})),

  removePayment: index =>
    set(state => ({
      payments: state.payments.filter((_, i) => i !== index),
    })),

  /**
   * Vuelto en efectivo (RF-VE-004):
   *   change = cashReceived - (total - lo ya cubierto por otros métodos)
   * Se toma el total del carrito, se resta lo pagado por tarjeta/
   * transferencia/voucher y sobre lo restante se compara con el efectivo
   * recibido. Nunca negativo (se satura en 0).
   */
  computeChange: cashReceived => {
    const {totals, paidAmount} = get();
    const cashPayments = get()
      .payments.filter(p => p.method === 'CASH')
      .reduce((sum, p) => sum + p.amount, 0);
    const remaining = totals().total - paidAmount() + cashPayments;
    set({change: Math.max(0, cashReceived - remaining)});
  },

  /** Reseteo completo: carrito vacío (post-venta o cancelación) */
  clearCart: () =>
    set({items: [], priceType: null, customer: null, payments: [], change: 0}),

  /* ── Payload y cálculos derivados ────────────────────────────────── */

  /**
   * Mapea el estado del carrito al contrato de POST /sales.
   * IMPORTANTE: esta función SOLO construye el objeto; el envío lo
   * dispara la UI al confirmar (ver Fase 5). No muta nada.
   */
  buildSalePayload: () => {
    const {items, customer, payments, totals} = get();
    return {
      customer_id: customer?.id,
      items: items.map(it => ({
        product_id: it.product.id,
        quantity: it.quantity,
        // Modo CAJ (RF-VE-003): alternate_quantity = peso en kg
        alternate_quantity: it.weightKg,
        unit_price: it.unitPrice,
        discount: it.discount,
        subtotal: it.subtotal,
        base_quantity: it.baseQuantity,
        price_type_id: it.priceType.id,
      })),
      payments: payments.map(p => ({
        method: p.method,
        amount: p.amount,
        reference_code: p.reference_code,
      })),
      subtotal: totals().subtotal,
      total_discount: totals().discount,
      total: totals().total,
    };
  },

  /** Totales derivados: subtotal, descuento, total (nunca negativo). */
  totals: () => {
    const {items} = get();
    const subtotal = items.reduce((sum, it) => sum + it.subtotal, 0);
    const discount = items.reduce((sum, it) => sum + it.discount, 0);
    return {
      subtotal,
      discount,
      total: Math.max(0, subtotal - discount),
      itemCount: items.length,
    };
  },

  /**
   * Monto ya cubierto por métodos "líquidos". El crédito NO cuenta:
   * al ser PENDING, no reduce el efectivo necesario (RF-VE-005).
   */
  paidAmount: () =>
    get()
      .payments.filter(p => p.method !== 'CREDIT')
      .reduce((sum, p) => sum + p.amount, 0),
}));
