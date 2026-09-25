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
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import {useTheme} from '../hooks/useTheme';
import {PriceType, Product} from '../models';
import {getProductPrices} from '../constants/mock-data';
import {useCartStore} from '../stores/cart.store';
import POSButton from './POSButton';
import DesktopDialog from './DesktopDialog';

interface ProductSheetProps {
  product: Product | null;
  onClose: () => void;
  /** Tipos de precio reales (GET /price-types) para mapear nombres */
  priceTypes?: PriceType[];
}

export default function ProductSheet({
  product,
  onClose,
  priceTypes,
}: ProductSheetProps) {
  const {colors, fonts, spacing, radius} = useTheme();
  const addItem = useCartStore(state => state.addItem);

  // Cantidad local; se resetea al abrir con un producto nuevo
  const [quantity, setQuantity] = useState(1);
  const [lastKey, setLastKey] = useState<string | null>(null);
  // Precio seleccionado (default: precio 1 = Público)
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);

  // Reset cantidad + precio cuando cambia el producto (o al cerrar)
  React.useEffect(() => {
    const key = product?.id ?? null;
    if (key !== lastKey) {
      setQuantity(1);
      setSelectedPriceId(null); // null → el precio 1 (Público) por defecto
      setLastKey(key);
    }
  }, [product, lastKey]);

  if (!product) {
    return null;
  }

  const stock = product.stock;
  const outOfStock = stock <= 0;
  const canDecrement = quantity > 1;
  const canIncrement = quantity < stock;

  // Precios disponibles (por defecto 3: Público/Mayoreo/Especial)
  const availablePrices = getProductPrices(product, priceTypes);
  // Seleccionado: si null → precio 1 (Público), si no → el elegido
  const selectedPrice =
    availablePrices.find(p => p.priceType.id === selectedPriceId) ??
    availablePrices[0];
  const unitPrice = selectedPrice.price;

  /* Confirmar: construir CartItem y agregarlo al store (RF-VE-001) */
  const handleConfirm = () => {
    if (outOfStock) {
      return; // no permitir agregar productos agotados
    }
    addItem({
      key: `${product.id}-${Date.now().toString(36)}`,
      product,
      quantity,
      priceType: selectedPrice.priceType,
      unitPrice,
      discount: 0,
      subtotal: unitPrice * quantity,
      baseQuantity: quantity * product.unit_conversion,
      isCaj: false,
    });
    onClose();
  };

  // Cuerpo compartido entre la hoja móvil y el diálogo de escritorio
  const body = (
    <>
      <Text style={[styles.title, {color: colors.text, fontSize: fonts.medium}]}>
        {product.name}
      </Text>
        <Text style={[styles.sku, {color: colors.textSecondary, fontSize: fonts.small}]}>
          {product.sku} · Stock: {stock}
        </Text>

        {/* Aviso de agotado */}
        {outOfStock && (
          <View style={[styles.outBadge, {backgroundColor: colors.dangerSoft}]}>
            <Text style={[styles.outText, {color: colors.danger, fontSize: fonts.small}]}>
              Producto agotado
            </Text>
          </View>
        )}

        <View style={[styles.priceRow, {marginTop: spacing.md}]}>
          <Text style={[styles.price, {color: colors.primary, fontSize: fonts.xlarge}]}>
            ${unitPrice.toFixed(2)}
          </Text>
          <Text style={[styles.unit, {color: colors.textSecondary, fontSize: fonts.small}]}>
            / {selectedPrice.priceType.name}
          </Text>
        </View>

        {/* Selector de tipo de precio (3 precios del producto) */}
        {availablePrices.length > 1 && (
          <View style={[styles.priceTypes, {marginTop: spacing.md}]}>
            {availablePrices.map(({priceType, price}) => {
              const isSelected = priceType.id === selectedPrice.priceType.id;
              return (
                <TouchableOpacity
                  key={priceType.id}
                  onPress={() => setSelectedPriceId(priceType.id)}
                  style={[
                    styles.priceChip,
                    {
                      borderRadius: radius.md,
                      backgroundColor: isSelected
                        ? colors.primary
                        : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  testID={`price-${priceType.code}`}>
                  <Text
                    style={[
                      styles.priceChipName,
                      {
                        color: isSelected ? colors.onPrimary : colors.textSecondary,
                        fontSize: fonts.small,
                      },
                    ]}>
                    {priceType.name}
                  </Text>
                  <Text
                    style={[
                      styles.priceChipValue,
                      {
                        color: isSelected ? colors.onPrimary : colors.primary,
                        fontSize: fonts.regular,
                      },
                    ]}>
                    ${price.toFixed(2)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

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
            ${(unitPrice * quantity).toFixed(2)}
          </Text>
        </View>

        <POSButton
          title={outOfStock ? 'Agotado' : 'Agregar al carrito'}
          onPress={handleConfirm}
          disabled={outOfStock}
          large
          style={{marginTop: spacing.md}}
          testID="btn-confirm-add"
        />
        <POSButton
          title="Cancelar"
          onPress={onClose}
          variant="danger"
          style={{marginTop: spacing.sm}}
          testID="btn-cancel-add"
        />
    </>
  );

  // Escritorio: diálogo centrado con fade (WINDOWS_PLAN §5.2)
  if (Platform.OS === 'windows' || Platform.OS === 'macos') {
    return (
      <DesktopDialog visible onClose={onClose} onEnter={handleConfirm}>
        {body}
      </DesktopDialog>
    );
  }

  // Móvil/tablet: hoja inferior (spec 3.x)
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={[styles.sheet, {backgroundColor: colors.surfaceSolid}]}>
        {/* Manija */}
        <View style={[styles.handle, {backgroundColor: colors.border}]} />
        {body}
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
  outBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'center',
    marginTop: 8,
  },
  outText: {fontWeight: '700'},
  priceRow: {flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center'},
  price: {fontWeight: '800'},
  unit: {marginLeft: 4},
  priceTypes: {flexDirection: 'row', gap: 8, justifyContent: 'center', flexWrap: 'wrap'},
  priceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  priceChipName: {fontWeight: '600'},
  priceChipValue: {fontWeight: '800'},
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
