/**
 * components/ProductSheet.tsx — Hoja inferior para agregar producto (RF-VE-002).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Al tocar un producto en el catálogo se abre esta hoja:
 *   - Muestra nombre, precio y stock disponible.
 *   - Selector de cantidad (+/-) con validación contra stock.
 *   - Al confirmar, agrega al carrito (Zustand) y cierra.
 * El precio unitario usa el tipo de precio default (Público).
 * ────────────────────────────────────────────────────────────────────────
 */
import React, {useState} from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import {useTheme} from '../hooks/useTheme';
import {Product} from '../models';
import {MOCK_PRICE_TYPE} from '../constants/mock-data';
import {useCartStore} from '../stores/cart.store';
import POSButton from './POSButton';

interface ProductSheetProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductSheet({product, onClose}: ProductSheetProps) {
  const {colors, fonts, spacing, radius} = useTheme();
  const addItem = useCartStore(state => state.addItem);

  // Cantidad local; se resetea al abrir con un producto nuevo
  const [quantity, setQuantity] = useState(1);
  const [lastKey, setLastKey] = useState<string | null>(null);

  // Reset cantidad cuando cambia el producto (o al cerrar)
  React.useEffect(() => {
    const key = product?.id ?? null;
    if (key !== lastKey) {
      setQuantity(1);
      setLastKey(key);
    }
  }, [product, lastKey]);

  if (!product) {
    return null;
  }

  const stock = product.stock;
  const canDecrement = quantity > 1;
  const canIncrement = quantity < stock;

  /* Confirmar: construir CartItem y agregarlo al store (RF-VE-001) */
  const handleConfirm = () => {
    addItem({
      key: `${product.id}-${Date.now().toString(36)}`,
      product,
      quantity,
      priceType: MOCK_PRICE_TYPE,
      unitPrice: product.price,
      discount: 0,
      subtotal: product.price * quantity,
      baseQuantity: quantity * product.unit_conversion,
      isCaj: false,
    });
    onClose();
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={[styles.sheet, {backgroundColor: colors.surfaceSolid}]}>
        {/* Manija */}
        <View style={[styles.handle, {backgroundColor: colors.border}]} />

        <Text style={[styles.title, {color: colors.text, fontSize: fonts.medium}]}>
          {product.name}
        </Text>
        <Text style={[styles.sku, {color: colors.textSecondary, fontSize: fonts.small}]}>
          {product.sku} · Stock: {stock}
        </Text>

        <View style={[styles.priceRow, {marginTop: spacing.md}]}>
          <Text style={[styles.price, {color: colors.primary, fontSize: fonts.xlarge}]}>
            ${product.price.toFixed(2)}
          </Text>
          <Text style={[styles.unit, {color: colors.textSecondary, fontSize: fonts.small}]}>
            / {MOCK_PRICE_TYPE.name}
          </Text>
        </View>

        {/* Selector de cantidad */}
        <View style={[styles.qtyRow, {marginTop: spacing.lg}]}>
          <TouchableOpacity
            onPress={() => setQuantity(q => Math.max(1, q - 1))}
            disabled={!canDecrement}
            style={[
              styles.qtyBtn,
              {
                backgroundColor: colors.primarySoft,
                borderRadius: radius.md,
                opacity: canDecrement ? 1 : 0.4,
              },
            ]}
            testID="qty-minus">
            <Text style={[styles.qtyBtnText, {color: colors.primary, fontSize: fonts.large}]}>
              −
            </Text>
          </TouchableOpacity>

          <Text style={[styles.qtyValue, {color: colors.text, fontSize: fonts.xlarge}]}>
            {quantity}
          </Text>

          <TouchableOpacity
            onPress={() => setQuantity(q => Math.min(stock, q + 1))}
            disabled={!canIncrement}
            style={[
              styles.qtyBtn,
              {
                backgroundColor: colors.primarySoft,
                borderRadius: radius.md,
                opacity: canIncrement ? 1 : 0.4,
              },
            ]}
            testID="qty-plus">
            <Text style={[styles.qtyBtnText, {color: colors.primary, fontSize: fonts.large}]}>
              +
            </Text>
          </TouchableOpacity>
        </View>

        {/* Subtotal + confirmar */}
        <View style={[styles.totalRow, {marginTop: spacing.lg}]}>
          <Text style={[styles.totalLabel, {color: colors.textSecondary, fontSize: fonts.regular}]}>
            Subtotal
          </Text>
          <Text style={[styles.totalValue, {color: colors.text, fontSize: fonts.medium}]}>
            ${(product.price * quantity).toFixed(2)}
          </Text>
        </View>

        <POSButton
          title="Agregar al carrito"
          onPress={handleConfirm}
          large
          style={{marginTop: spacing.md}}
          testID="btn-confirm-add"
        />
        <POSButton
          title="Cancelar"
          onPress={onClose}
          variant="ghost"
          style={{marginTop: spacing.sm}}
          testID="btn-cancel-add"
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
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {fontWeight: '800', textAlign: 'center'},
  sku: {textAlign: 'center', marginTop: 2},
  priceRow: {flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center'},
  price: {fontWeight: '800'},
  unit: {marginLeft: 4},
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  qtyBtn: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {fontWeight: '700'},
  qtyValue: {fontWeight: '800', minWidth: 48, textAlign: 'center'},
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {fontWeight: '500'},
  totalValue: {fontWeight: '700'},
});
