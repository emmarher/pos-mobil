/**
 * screens/LicenseBlockScreen.tsx — Bloqueo por licencia (RF-AU-003, CA-004).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Qué hace esta pantalla:
 *   - Licencia vencida → bloqueo TOTAL de la app.
 *   - Solo muestra: "Licencia vencida. Contacte a soporte."
 *   - No permite ninguna operación (sin botones de escape).
 * Rediseñada con estética glass (fondo + tarjeta).
 * ────────────────────────────────────────────────────────────────────────
 */
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import GlassBackground from '../components/GlassBackground';
import GlassSurface from '../components/GlassSurface';
import {useTheme} from '../hooks/useTheme';

export default function LicenseBlockScreen() {
  /* ── 1) RENDER (UI) ──────────────────────────────────────────────── */

  const theme = useTheme();
  const {colors, fonts} = theme;

  return (
    <GlassBackground>
      <View style={styles.container} testID="license-block-screen">
        <GlassSurface style={styles.card} elevation="raised">
          <Text style={[styles.icon, {fontSize: 56}]}>🔒</Text>
          <Text style={[styles.title, {color: colors.text, fontSize: fonts.xxlarge}]}>
            Licencia vencida
          </Text>
          <Text
            style={[
              styles.message,
              {color: colors.textSecondary, fontSize: fonts.medium},
            ]}>
            Contacte a soporte para renovar su licencia.
          </Text>
        </GlassSurface>
      </View>
    </GlassBackground>
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
  card: {padding: 32, alignItems: 'center', maxWidth: 480},
  icon: {marginBottom: 16},
  title: {fontWeight: '800', textAlign: 'center'},
  message: {textAlign: 'center', marginTop: 8},
});
