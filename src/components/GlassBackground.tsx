/**
 * components/GlassBackground.tsx — Fondo glass con blobs orgánicos (spec 2.4).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Plano fondo (z: 0): #F8F9FF + formas orgánicas difuminadas en
 * indigo/esmeralda/ámbar al 8-12%. El blur de las superficies glass las
 * atraviesa. Renderiza detrás del contenido (posición absoluta).
 * ────────────────────────────────────────────────────────────────────────
 */
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useTheme} from '../hooks/useTheme';

/** Blob decorativo: círculo grande difuminado con opacidad baja */
function Blob({
  size,
  top,
  left,
  right,
  bottom,
  color,
}: {
  size: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  color: string;
}) {
  return (
    <View
      style={[
        styles.blob,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          top,
          left,
          right,
          bottom,
        },
      ]}
    />
  );
}

export default function GlassBackground({children}: {children: React.ReactNode}) {
  const {colors} = useTheme();

  return (
    <View style={[styles.root, {backgroundColor: colors.background}]}>
      {/* Plano fondo: blobs orgánicos (nunca interactivos) */}
      <View style={styles.blobs} pointerEvents="none">
        <Blob size={320} top={-80} right={-60} color={colors.blob} />
        <Blob size={260} top={200} left={-100} color={colors.secondarySoft} />
        <Blob size={200} bottom={80} right={-40} color={colors.warningSoft} />
        <Blob size={180} bottom={220} left={-50} color={colors.primarySoft} />
      </View>
      {/* Plano contenido */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
  blobs: {...StyleSheet.absoluteFillObject},
  blob: {position: 'absolute'},
  content: {flex: 1},
});
