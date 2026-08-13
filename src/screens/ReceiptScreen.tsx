/**
 * screens/ReceiptScreen.tsx — Recibo digital / ticket (spec 4.5).
 *
 * ────────────────────────────────────────────────────────────────────────
 * El artefacto: contenedor que emula el ticket físico sobre fondo
 * traslúcido:
 *   - Encabezado de tienda + metadatos (fecha, hora, folio, cajero).
 *   - Ítems con desglose (nombre, cantidad × precio, total por ítem).
 *   - Subtotal, IVA (%) y TOTAL en indigo, peso 900.
 *   - Método de pago + código de autorización.
 *   - QR (placeholder) y borde inferior zig-zag (simula rasgado).
 * Acciones: "Compartir" (secundario) y "Imprimir ticket" (primario).
 * ────────────────────────────────────────────────────────────────────────
 */
import React from 'react';
import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';

import GlassBackground from '../components/GlassBackground';
import TopAppBar from '../components/TopAppBar';
import GlassSurface from '../components/GlassSurface';
import POSButton from '../components/POSButton';

import {useTheme} from '../hooks/useTheme';
import {MOCK_TICKET} from '../constants/mock-data';

export default function ReceiptScreen() {
  const {colors, fonts, spacing} = useTheme();

  const subtotal = MOCK_TICKET.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const tax = subtotal * MOCK_TICKET.taxRate;
  const total = subtotal + tax;

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

  return (
    <GlassBackground>
      {/* TopAppBar con menú hamburguesa + logo + alerta */}
      <TopAppBar
        title="Luxe Retail Co."
        avatarLabel="LR"
        leftSlot={
          <Text style={[styles.menuIcon, {color: colors.text}]}>☰</Text>
        }
        notificationCount={1}
      />

      <ScrollView contentContainerStyle={{padding: spacing.md, paddingBottom: 120, alignItems: 'center'}}>
        {/* ── Ticket emulado ─────────────────────────────────────────── */}
        <GlassSurface style={styles.ticket} elevation="raised">
          {/* Encabezado del negocio */}
          <Text style={[styles.storeName, {color: colors.text, fontSize: fonts.medium}]}>
            {MOCK_TICKET.store.name}
          </Text>
          <Text style={[styles.storeLine, {color: colors.textSecondary, fontSize: fonts.small}]}>
            {MOCK_TICKET.store.address}
          </Text>
          <Text style={[styles.storeLine, {color: colors.textSecondary, fontSize: fonts.small}]}>
            {MOCK_TICKET.store.phone}
          </Text>

          <View style={[styles.dashed, {borderColor: colors.border}]} />

          {/* Metadatos */}
          {(
            [
              ['Fecha', MOCK_TICKET.meta.date],
              ['Hora', MOCK_TICKET.meta.time],
              ['Folio', MOCK_TICKET.meta.folio],
              ['Cajero', MOCK_TICKET.meta.cashier],
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

          {/* Ítems */}
          {MOCK_TICKET.items.map(item => (
            <View key={item.name} style={styles.itemRow}>
              <Text style={[styles.itemName, {color: colors.text, fontSize: fonts.regular}]}>
                {item.name}
              </Text>
              <View style={styles.itemLine}>
                <Text style={[styles.itemQty, {color: colors.textSecondary, fontSize: fonts.small}]}>
                  {item.quantity} × ${item.unitPrice.toFixed(2)}
                </Text>
                <Text style={[styles.itemTotal, {color: colors.text, fontSize: fonts.regular}]}>
                  ${(item.quantity * item.unitPrice).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}

          <View style={[styles.dashed, {borderColor: colors.border}]} />

          {/* Totales */}
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, {color: colors.textSecondary, fontSize: fonts.regular}]}>
              Subtotal
            </Text>
            <Text style={[styles.totalValue, {color: colors.text, fontSize: fonts.regular}]}>
              ${subtotal.toFixed(2)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, {color: colors.textSecondary, fontSize: fonts.regular}]}>
              IVA ({MOCK_TICKET.taxRate * 100}%)
            </Text>
            <Text style={[styles.totalValue, {color: colors.text, fontSize: fonts.regular}]}>
              ${tax.toFixed(2)}
            </Text>
          </View>
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

          {/* Pago */}
          <View style={styles.paymentBlock}>
            <Text style={[styles.metaLabel, {color: colors.textSecondary, fontSize: fonts.small}]}>
              Pago: {MOCK_TICKET.payment.method}
            </Text>
            <Text style={[styles.metaValue, {color: colors.text, fontSize: fonts.small}]}>
              Autorización {MOCK_TICKET.payment.authorization}
            </Text>
          </View>

          {/* QR (placeholder del folio) */}
          <View style={[styles.qrBox, {borderColor: colors.border}]}>
            <Text style={[styles.qrText, {color: colors.textSecondary}]}>
              ▦▦▦▦▦▦▦▦
            </Text>
            <Text style={[styles.qrSub, {color: colors.textSecondary, fontSize: fonts.micro}]}>
              {MOCK_TICKET.meta.folio}
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
