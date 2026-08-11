/**
 * screens/LicenseBlockScreen.tsx — Bloqueo por licencia (RF-AU-003, CA-004).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Qué hace esta pantalla:
 *   - Licencia vencida → bloqueo TOTAL de la app.
 *   - Solo muestra: "Licencia vencida. Contacte a soporte."
 *   - No permite ninguna operación (sin botones de escape).
 * ────────────────────────────────────────────────────────────────────────
 *
 * Secciones:
 *   1) Render (UI) — única sección: mensaje de bloqueo centrado
 */
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {useTheme} from '../hooks/useTheme';

export default function LicenseBlockScreen() {
  /* ── 1) RENDER (UI) ──────────────────────────────────────────────── */

  const theme = useTheme();
  const {colors, fonts} = theme;

  return (
    <View
      style={[styles.container, {backgroundColor: colors.background}]}
      testID="license-block-screen">
      <View style={[styles.card, {backgroundColor: colors.surface}]}>
        <Text style={[styles.icon, {color: colors.danger}]}>🔒</Text>
        <Text
          style={[styles.title, {color: colors.text, fontSize: fonts.xxlarge}]}>
          Licencia vencida
        </Text>
        <Text
          style={[
            styles.message,
            {color: colors.textSecondary, fontSize: fonts.medium},
          ]}>
          Contacte a soporte para renovar su licencia.
        </Text>
      </View>
    </View>
  );
}

/* ── Estilos de la pantalla ─────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {borderRadius: 20, padding: 32, alignItems: 'center', maxWidth: 480},
  icon: {fontSize: 56, marginBottom: 16},
  title: {fontWeight: '800', textAlign: 'center'},
  message: {textAlign: 'center', marginTop: 8},
});
