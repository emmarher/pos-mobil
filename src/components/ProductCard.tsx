/**
 * components/ProductCard.tsx — Tarjeta de producto del catálogo (spec 3.6).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Glass card con imagen (placeholder), nombre, precio destacado en indigo
 * y chips opcionales (Mayoreo / Báscula). Estado agotado con overlay.
 * ────────────────────────────────────────────────────────────────────────
 */
import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import GlassSurface from './GlassSurface';
import {Product} from '../models';
import {useTheme} from '../hooks/useTheme';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  testID?: string;
}

/** Placeholder visual del producto (inicial del nombre) */
function ProductThumb({product, size}: {product: Product; size: number}) {
  const {colors} = useTheme();
  return (
    <View
      style={[
        styles.thumb,
        {
          width: size,
          height: size,
          borderRadius: 12,
          backgroundColor: colors.primarySoft,
        },
      ]}>
      <Text style={[styles.thumbText, {color: colors.primary, fontSize: size * 0.4}]}>
        {product.name.charAt(0)}
      </Text>
    </View>
  );
}

export default function ProductCard({product, onPress, testID}: ProductCardProps) {
  const {colors, fonts, spacing} = useTheme();
  const out = product.stock <= 0;

  return (
    <TouchableOpacity testID={testID} onPress={onPress} activeOpacity={0.95}>
      {/* opacity alta → cards casi sólidas (glass muy sutil, texto legible) */}
      <GlassSurface opacity={0.94} style={styles.card}>
        <View style={[styles.thumbWrap, {marginBottom: spacing.sm}]}>
          <ProductThumb product={product} size={70} />
          {out && (
            <View style={styles.outOverlay}>
              <Text style={[styles.outText, {color: colors.onPrimary}]}>Agotado</Text>
            </View>
          )}
        </View>
        <Text
          numberOfLines={1}
          style={[styles.name, {color: colors.text, fontSize: fonts.regular}]}>
          {product.name}
        </Text>
        <Text
          style={[
            styles.price,
            {color: colors.primary, fontSize: fonts.medium},
          ]}>
          ${product.price.toFixed(2)}
        </Text>
        {/* Chips opcionales del producto */}
        <View style={styles.chips}>
          {product.is_scale_enabled && (
            <View style={[styles.miniChip, {backgroundColor: colors.primarySoft}]}>
              <Text style={[styles.miniChipText, {color: colors.primary, fontSize: fonts.micro}]}>
                Báscula
              </Text>
            </View>
          )}
        </View>
      </GlassSurface>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {padding: 20},
  thumbWrap: {alignItems: 'center', position: 'relative'},
  thumb: {alignItems: 'center', justifyContent: 'center'},
  thumbText: {fontWeight: '900'},
  outOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius:12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outText: {fontWeight: '800', fontSize: 13},
  name: {fontWeight: '600', marginTop: 2},
  price: {fontWeight: '800', marginTop: 2},
  chips: {flexDirection: 'row', marginTop: 6},
  miniChip: {borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2},
  miniChipText: {fontWeight: '700'},
});
