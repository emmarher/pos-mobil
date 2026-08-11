/**
 * screens/DashboardScreen.tsx — Dashboard principal (placeholder).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Qué hace esta pantalla:
 *   - Punto de entrada del vendedor tras login.
 *   - Muestra el negocio, el usuario y una grilla de accesos.
 *   - En próximas iteraciones: Nueva Venta, Carrito activo, Cortes de
 *     caja, Reportes, inventario y alertas (RF-IN-006).
 * ────────────────────────────────────────────────────────────────────────
 *
 * Secciones:
 *   1) Hooks y estado (auth store)
 *   2) Render (UI): header + grilla de tarjetas + logout
 */
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import POSButton from '../components/POSButton';
import {useTheme} from '../hooks/useTheme';
import {useAuthStore} from '../stores/auth.store';

export default function DashboardScreen() {
  /* ── 1) HOOKS Y ESTADO (AUTH STORE) ──────────────────────────────── */

  const theme = useTheme();
  const {colors, fonts} = theme;
  // Datos de sesión activa: usuario y tenant del login
  const {user, tenant} = useAuthStore();
  const logout = useAuthStore(state => state.logout);

  /* ── 2) RENDER (UI) ──────────────────────────────────────────────── */

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Header: negocio + vendedor */}
      <View style={styles.header}>
        <Text
          style={[
            styles.businessName,
            {color: colors.text, fontSize: fonts.xlarge},
          ]}>
          {tenant?.business_name ?? 'Mi Negocio'}
        </Text>
        <Text
          style={[
            styles.welcome,
            {color: colors.textSecondary, fontSize: fonts.regular},
          ]}>
          Bienvenido, {user?.name}
        </Text>
      </View>

      {/* Grilla de accesos (placeholders de las secciones del POS) */}
      <View style={styles.grid}>
        <View style={[styles.card, {backgroundColor: colors.surface}]}>
          <Text
            style={[
              styles.cardTitle,
              {color: colors.text, fontSize: fonts.large},
            ]}>
            Nueva Venta
          </Text>
          <Text
            style={[
              styles.cardSub,
              {color: colors.textSecondary, fontSize: fonts.small},
            ]}>
            Venta rápida por escáner o búsqueda
          </Text>
        </View>
        <View style={[styles.card, {backgroundColor: colors.surface}]}>
          <Text
            style={[
              styles.cardTitle,
              {color: colors.text, fontSize: fonts.large},
            ]}>
            Carrito
          </Text>
          <Text
            style={[
              styles.cardSub,
              {color: colors.textSecondary, fontSize: fonts.small},
            ]}>
            En memoria, sin persistir (RF-VE-001)
          </Text>
        </View>
        <View style={[styles.card, {backgroundColor: colors.surface}]}>
          <Text
            style={[
              styles.cardTitle,
              {color: colors.text, fontSize: fonts.large},
            ]}>
            Cortes de Caja
          </Text>
          <Text
            style={[
              styles.cardSub,
              {color: colors.textSecondary, fontSize: fonts.small},
            ]}>
            Por turno y diario global (RF-CC)
          </Text>
        </View>
        <View style={[styles.card, {backgroundColor: colors.surface}]}>
          <Text
            style={[
              styles.cardTitle,
              {color: colors.text, fontSize: fonts.large},
            ]}>
            Reportes
          </Text>
          <Text
            style={[
              styles.cardSub,
              {color: colors.textSecondary, fontSize: fonts.small},
            ]}>
            Estadísticas rápidas y ventas
          </Text>
        </View>
      </View>

      {/* Salida de sesión */}
      <POSButton
        title="Cerrar sesión"
        onPress={logout}
        variant="ghost"
        style={styles.logout}
        testID="btn-logout"
      />
    </View>
  );
}

/* ── Estilos de la pantalla ─────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: {flex: 1, padding: 24},
  header: {marginBottom: 32},
  businessName: {fontWeight: '800'},
  welcome: {marginTop: 4},
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    width: '47%',
    borderRadius: 16,
    padding: 20,
    minHeight: 140,
    justifyContent: 'center',
  },
  cardTitle: {fontWeight: '700'},
  cardSub: {marginTop: 6},
  logout: {marginTop: 32},
});
