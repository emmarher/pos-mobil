/**
 * components/CartSheet.tsx — Carrito de la venta (RF-VE-001..005).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Hoja inferior que muestra el carrito en memoria (Zustand):
 *   - Ítems con cantidad, precio unitario y subtotal.
 *   - Totales derivados (subtotal, descuento, total).
 *   - Método de pago (efectivo por defecto; múltiples métodos RF-VE-004).
 *   - Confirmar venta → POST /sales (buildSalePayload + createSale).
 * Tras el éxito, limpia el carrito y cierra.
 * ────────────────────────────────────────────────────────────────────────
 */
import React, {useEffect, useState} from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useTheme} from '../hooks/useTheme';
import {useCartStore} from '../stores/cart.store';
import {PaymentMethod} from '../models';
import {createSale} from '../api/endpoints';
import {ApiError} from '../api/client';
import POSButton from './POSButton';
import {RootStackParamList} from '../navigation';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

interface CartSheetProps {
  visible: boolean;
  onClose: () => void;
}

/** Métodos de pago disponibles (RF-VE-004) */
const PAYMENT_METHODS: {method: PaymentMethod; label: string; icon: string}[] = [
  {method: 'CASH', label: 'Efectivo', icon: '💵'},
  {method: 'CARD', label: 'Tarjeta', icon: '💳'},
  {method: 'TRANSFER', label: 'Transferencia', icon: '🏦'},
  {method: 'CREDIT', label: 'Crédito', icon: '📒'},
];

export default function CartSheet({visible, onClose}: CartSheetProps) {
  const {colors, fonts, spacing, radius} = useTheme();
  const navigation = useNavigation<Nav>();

  const items = useCartStore(state => state.items);
  const removeItem = useCartStore(state => state.removeItem);
  const clearCart = useCartStore(state => state.clearCart);
  const addPayment = useCartStore(state => state.addPayment);
  const payments = useCartStore(state => state.payments);
  const buildSalePayload = useCartStore(state => state.buildSalePayload);

  const [method, setMethod] = useState<PaymentMethod>('CASH');
  const [submitting, setSubmitting] = useState(false);

  // Reset método al abrir
  useEffect(() => {
    if (visible) {
      setMethod('CASH');
    }
  }, [visible]);

  // Totales derivados de los ítems (sin suscribirse a objetos nuevos)
  const t = React.useMemo(() => {
    const sub = items.reduce((s, it) => s + it.subtotal, 0);
    const disc = items.reduce((s, it) => s + it.discount, 0);
    return {
      itemCount: items.length,
      unitCount: items.reduce((s, it) => s + it.quantity, 0),
      subtotal: sub,
      discount: disc,
      total: Math.max(0, sub - disc),
    };
  }, [items]);

  /* Confirmar venta: construir payload y enviarlo (RF-VE) */
  const handleConfirm = async () => {
    if (items.length === 0) {
      return;
    }
    // Asegurar que exista al menos un pago por el total
    const existing = payments.reduce((s, p) => s + p.amount, 0);
    const remaining = Math.max(0, t.total - existing);
    if (remaining > 0) {
      addPayment({method, amount: remaining});
    }

    setSubmitting(true);
    try {
      const payload = buildSalePayload();
      const sale = await createSale(payload);
      // Capturar items ANTES de limpiar el carrito (para el recibo)
      const soldItems = items;
      const saleMethod = method;
      clearCart();
      onClose();
      // Navegar al recibo digital con los datos REALES de la venta
      navigation.navigate('Receipt', {
        sale,
        items: soldItems,
        paymentMethod: saleMethod,
      });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'No se pudo registrar la venta.';
      Alert.alert('Error al vender', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={[styles.sheet, {backgroundColor: colors.surfaceSolid}]}>
        {/* Manija */}
        <View style={[styles.handle, {backgroundColor: colors.border}]} />

        <Text style={[styles.title, {color: colors.text, fontSize: fonts.medium}]}>
          Carrito · {t.itemCount} {t.itemCount === 1 ? 'ítem' : 'ítems'} ·{' '}
          {t.unitCount} {t.unitCount === 1 ? 'unidad' : 'unidades'}
        </Text>

        <ScrollView style={styles.items} contentContainerStyle={{paddingBottom: 8}}>
          {items.length === 0 ? (
            <Text
              style={[
                styles.empty,
                {color: colors.textSecondary, fontSize: fonts.regular},
              ]}>
              El carrito está vacío
            </Text>
          ) : (
            items.map(item => (
              <View
                key={item.key}
                style={[styles.itemRow, {borderBottomColor: colors.border}]}>
                <View style={styles.itemInfo}>
                  <Text
                    numberOfLines={1}
                    style={[styles.itemName, {color: colors.text, fontSize: fonts.regular}]}>
                    {item.product.name}
                  </Text>
                  <Text style={[styles.itemQty, {color: colors.textSecondary, fontSize: fonts.small}]}>
                    {item.quantity} × ${item.unitPrice.toFixed(2)}
                  </Text>
                </View>
                <Text style={[styles.itemTotal, {color: colors.text, fontSize: fonts.regular}]}>
                  ${item.subtotal.toFixed(2)}
                </Text>
                <TouchableOpacity
                  onPress={() => removeItem(item.key)}
                  style={styles.removeBtn}
                  testID={`remove-${item.key}`}>
                  <Text style={[styles.removeText, {color: colors.danger}]}>✕</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>

        {/* Método de pago */}
        <Text style={[styles.methodLabel, {color: colors.textSecondary, fontSize: fonts.small}]}>
          Método de pago
        </Text>
        <View style={styles.methods}>
          {PAYMENT_METHODS.map(m => (
            <TouchableOpacity
              key={m.method}
              onPress={() => setMethod(m.method)}
              style={[
                styles.methodChip,
                {
                  borderRadius: radius.round,
                  backgroundColor: method === m.method ? colors.primary : colors.surface,
                  borderColor: method === m.method ? colors.primary : colors.border,
                },
              ]}
              testID={`pay-${m.method}`}>
              <Text style={styles.methodIcon}>{m.icon}</Text>
              <Text
                style={[
                  styles.methodText,
                  {
                    color: method === m.method ? colors.onPrimary : colors.textSecondary,
                    fontSize: fonts.small,
                  },
                ]}>
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Totales */}
        <View style={[styles.totalRow, {marginTop: spacing.md}]}>
          <Text style={[styles.totalLabel, {color: colors.textSecondary, fontSize: fonts.regular}]}>
            Subtotal
          </Text>
          <Text style={[styles.totalValue, {color: colors.text, fontSize: fonts.regular}]}>
            ${t.subtotal.toFixed(2)}
          </Text>
        </View>
        {t.discount > 0 && (
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, {color: colors.textSecondary, fontSize: fonts.regular}]}>
              Descuento
            </Text>
            <Text style={[styles.totalValue, {color: colors.success, fontSize: fonts.regular}]}>
              −${t.discount.toFixed(2)}
            </Text>
          </View>
        )}
        <View style={[styles.grandRow, {marginTop: 4}]}>
          <Text style={[styles.grandLabel, {color: colors.text, fontSize: fonts.medium}]}>
            TOTAL
          </Text>
          <Text style={[styles.grandValue, {color: colors.primary, fontSize: fonts.xlarge}]}>
            ${t.total.toFixed(2)}
          </Text>
        </View>

        <POSButton
          title={submitting ? 'Registrando…' : 'Confirmar venta'}
          onPress={handleConfirm}
          loading={submitting}
          disabled={items.length === 0}
          large
          style={{marginTop: spacing.md}}
          testID="btn-confirm-sale"
        />
        <POSButton
          title="Cerrar"
          onPress={onClose}
          variant="ghost"
          style={{marginTop: spacing.sm}}
          testID="btn-close-cart"
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {flex: 1, backgroundColor: 'rgba(0,0,0,0.4)'},
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '92%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {fontWeight: '800', textAlign: 'center', marginBottom: 12},
  // En landscape (pantalla baja) el sheet es más corto: el ScrollView debe
  // encogerse y scrollar, no quedar cortado por un maxHeight fijo.
  items: {flexShrink: 1, marginBottom: 12},
  empty: {textAlign: 'center', paddingVertical: 24},
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  itemInfo: {flex: 1, marginRight: 8},
  itemName: {fontWeight: '600'},
  itemQty: {fontWeight: '500', marginTop: 2},
  itemTotal: {fontWeight: '600'},
  removeBtn: {padding: 8, marginLeft: 8},
  removeText: {fontWeight: '800'},
  methodLabel: {fontWeight: '600', marginBottom: 6},
  methods: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  methodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  methodIcon: {marginRight: 4},
  methodText: {fontWeight: '600'},
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  totalLabel: {fontWeight: '500'},
  totalValue: {fontWeight: '600'},
  grandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 6,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  grandLabel: {fontWeight: '800'},
  grandValue: {fontWeight: '900'},
});
