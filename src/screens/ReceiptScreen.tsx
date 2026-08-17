/**
 * screens/ReceiptScreen.tsx — Recibo digital / ticket (spec 4.5).
 *
 * ────────────────────────────────────────────────────────────────────────
 * El artefacto: contenedor que emula el ticket físico sobre fondo
 * traslúcido. Usa los datos REALES de la venta confirmada:
 *   - SaleResponse del POST /sales (folio, subtotal, total, created_at).
 *   - Ítems del carrito vendido (nombre, cantidad × precio, subtotal).
 *   - Método de pago usado.
 *   - Nombre del negocio del tenant autenticado.
 * Acciones: "Compartir" (secundario) y "Imprimir ticket" (primario).
 * ────────────────────────────────────────────────────────────────────────
 */
import React from 'react';
import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useRoute, RouteProp, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import GlassBackground from '../components/GlassBackground';
import TopAppBar from '../components/TopAppBar';
import GlassSurface from '../components/GlassSurface';
import POSButton from '../components/POSButton';

import {useTheme} from '../hooks/useTheme';
import {useAuthStore} from '../stores/auth.store';
import {RootStackParamList} from '../navigation';

type Route = RouteProp<RootStackParamList, 'Receipt'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'Receipt'>;

export default function ReceiptScreen() {
  const {colors, fonts, spacing} = useTheme();
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const tenant = useAuthStore(state => state.tenant);

  const {sale, items, paymentMethod} = route.params;

  // Totales reales de la venta (fuente de verdad: el servidor)
  const subtotal = sale.subtotal;
  const total = sale.total;
  const discount = sale.total_discount ?? 0;

  // Metadatos: fecha/hora de la venta (created_at del servidor)
  const created = new Date(sale.created_at);
  const dateStr = created.toLocaleDateString('es-MX');
  const timeStr = created.toLocaleTimeString('es-MX');

  const printTicket = () => {
    // TODO(Fase 5): encolar POST /print-jobs (RF-IM-002)
    Alert.alert('Imprimir ticket', 'Encolando en la cola de impresión…', [
      {text: 'OK', onPress: () => console.log('print job encolado')},
    ]);
  };

  const shareTicket = () => {
    // TODO: compartir imagen/PDF del ticket
    console.log('Compartir ticket');
  };

  const close = () => navigation.goBack();

  return (
    <GlassBackground>
      {/* TopAppBar con menú hamburguesa + logo + alerta */}
      <TopAppBar
        title={tenant?.business_name || 'POS'}
        avatarLabel="LR"
        leftSlot={
          <Text style={[styles.menuIcon, {color: colors.text}]}>☰</Text>
        }
      />

      <ScrollView contentContainerStyle={{padding: spacing.md, paddingBottom: 120, alignItems: 'center'}}>
        {/* ── Ticket emulado ─────────────────────────────────────────── */}
        <GlassSurface style={styles.ticket} elevation="raised">
          {/* Encabezado del negocio (del tenant autenticado) */}
          <Text style={[styles.storeName, {color: colors.text, fontSize: fonts.medium}]}>
            {tenant?.business_name || 'POS'}
          </Text>
          <Text style={[styles.storeLine, {color: colors.textSecondary, fontSize: fonts.small}]}>
            {tenant?.address || ''}
          </Text>
          <Text style={[styles.storeLine, {color: colors.textSecondary, fontSize: fonts.small}]}>
            {tenant?.phone || ''}
          </Text>

          <View style={[styles.dashed, {borderColor: colors.border}]} />

          {/* Metadatos reales de la venta */}
          {(
            [
              ['Fecha', dateStr],
              ['Hora', timeStr],
              ['Folio', sale.folio],
            ] as const
          ).map(([label, value]) => (
            <View key={label} style={styles.metaRow}>
              <Text style={[styles.metaLabel, {color: colors.textSecondary, fontSize: fonts.small}]}>
                {label}
              </Text>
              <Text style={[styles.metaValue, {color: colors.text, fontSize: fonts.small}]}>
                {value}
              </Text>
            </View>
          ))}

          <View style={[styles.dashed, {borderColor: colors.border}]} />

          {/* Ítems vendidos (del carrito real) */}
          {items.map(item => (
            <View key={item.key} style={styles.itemRow}>
              <Text style={[styles.itemName, {color: colors.text, fontSize: fonts.regular}]}>
                {item.product.name}
              </Text>
              <View style={styles.itemLine}>
                <Text style={[styles.itemQty, {color: colors.textSecondary, fontSize: fonts.small}]}>
                  {item.quantity} × ${item.unitPrice.toFixed(2)}
                </Text>
                <Text style={[styles.itemTotal, {color: colors.text, fontSize: fonts.regular}]}>
                  ${item.subtotal.toFixed(2)}
                </Text>
              </View>
            </View>
          ))}

          <View style={[styles.dashed, {borderColor: colors.border}]} />

          {/* Totales reales del servidor */}
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, {color: colors.textSecondary, fontSize: fonts.regular}]}>
              Subtotal
            </Text>
            <Text style={[styles.totalValue, {color: colors.text, fontSize: fonts.regular}]}>
              ${subtotal.toFixed(2)}
            </Text>
          </View>
          {discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, {color: colors.textSecondary, fontSize: fonts.regular}]}>
                Descuento
              </Text>
              <Text style={[styles.totalValue, {color: colors.success, fontSize: fonts.regular}]}>
                −${discount.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={[styles.grandRow, {borderTopColor: colors.border}]}>
            <Text style={[styles.grandLabel, {color: colors.text, fontSize: fonts.medium}]}>
              TOTAL
            </Text>
            <Text
              style={[
                styles.grandValue,
                {color: colors.primary, fontSize: fonts.xlarge},
              ]}>
              ${total.toFixed(2)}
            </Text>
          </View>

          {/* Pago (método usado en la venta) */}
          <View style={styles.paymentBlock}>
            <Text style={[styles.metaLabel, {color: colors.textSecondary, fontSize: fonts.small}]}>
              Pago: {paymentMethod}
            </Text>
          </View>

          {/* QR (placeholder del folio) */}
          <View style={[styles.qrBox, {borderColor: colors.border}]}>
            <Text style={[styles.qrText, {color: colors.textSecondary}]}>
              ▦▦▦▦▦▦▦▦
            </Text>
            <Text style={[styles.qrSub, {color: colors.textSecondary, fontSize: fonts.micro}]}>
              {sale.folio}
            </Text>
          </View>
        </GlassSurface>

        {/* Borde zig-zag inferior (rasgado de papel) */}
        <View style={[styles.zigzag, {backgroundColor: colors.background}]}>
          {Array.from({length: 28}).map((_, i) => (
            <View
              key={i}
              style={[
                styles.zag,
                {borderBottomColor: colors.surfaceSolid},
              ]}
            />
          ))}
        </View>

        {/* Acciones */}
        <View style={[styles.actions, {marginTop: spacing.md}]}>
          <POSButton title="Compartir" variant="secondary" onPress={shareTicket} style={styles.actionBtn} testID="btn-share" />
          <POSButton title="Imprimir ticket" onPress={printTicket} style={styles.actionBtn} testID="btn-print" />
        </View>
        <POSButton
          title="Volver a Productos"
          onPress={close}
          variant="ghost"
          style={{marginTop: spacing.sm}}
          testID="btn-back-products"
        />
      </ScrollView>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  menuIcon: {fontSize: 26, paddingHorizontal: 12},
  ticket: {
    width: '100%',
    maxWidth: 420,
    padding: 24,
    paddingBottom: 20,
    alignItems: 'center',
  },
  storeName: {fontWeight: '800', textAlign: 'center'},
  storeLine: {textAlign: 'center', marginTop: 2},
  dashed: {
    alignSelf: 'stretch',
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    marginVertical: 12,
  },
  metaRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  metaLabel: {fontWeight: '500'},
  metaValue: {fontWeight: '600'},
  itemRow: {alignSelf: 'stretch', marginBottom: 8},
  itemName: {fontWeight: '600'},
  itemLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  itemQty: {fontWeight: '500'},
  itemTotal: {fontWeight: '600'},
  totalRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  totalLabel: {fontWeight: '500'},
  totalValue: {fontWeight: '600'},
  grandRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 6,
  },
  grandLabel: {fontWeight: '800'},
  grandValue: {fontWeight: '900'},
  paymentBlock: {
    alignSelf: 'stretch',
    alignItems: 'center',
    marginTop: 14,
  },
  qrBox: {
    width: 120,
    height: 120,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  qrText: {fontSize: 32, letterSpacing: 2},
  qrSub: {fontWeight: '600', marginTop: 6},
  zigzag: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 420,
    marginTop: -1,
    overflow: 'hidden',
  },
  zag: {
    flex: 1,
    height: 12,
    borderBottomWidth: 12,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{rotate: '180deg'}],
  },
  actions: {flexDirection: 'row', gap: 12, width: '100%', maxWidth: 420},
  actionBtn: {flex: 1},
});
