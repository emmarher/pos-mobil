/**
 * components/TopAppBar.tsx — Barra superior glass (spec 3.1).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Contenido:
 *   - Avatar circular con iniciales (ej. "UP").
 *   - Título de la pantalla.
 * (La notificación 🔔 está deshabilitada/comentada.)
 * Altura 64px + safe-area-inset-top; fondo glass con borde inferior sutil.
 * ────────────────────────────────────────────────────────────────────────
 */
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../hooks/useTheme';

interface TopAppBarProps {
  title: string;
  /** Iniciales del cajero (avatar, ej. "UP") */
  avatarLabel?: string;
  onAvatarPress?: () => void;
  /** Elemento izquierdo alternativo (menú hamburguesa, back) */
  leftSlot?: React.ReactNode;
  style?: ViewStyle;
}

export default function TopAppBar({
  title,
  avatarLabel = 'UP',
  onAvatarPress,
  leftSlot,
  style,
}: TopAppBarProps) {
  const insets = useSafeAreaInsets();
  const {colors, fonts} = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 8,
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        },
        style,
      ]}>
      {/* Lado izquierdo: slot opcional (menú/back) o avatar */}
      <View style={styles.left}>
        {leftSlot ?? (
          <TouchableOpacity
            onPress={onAvatarPress}
            style={[styles.avatar, {backgroundColor: colors.primary}]}
            testID="appbar-avatar">
            <Text style={[styles.avatarText, {color: colors.onPrimary}]}>
              {avatarLabel}
            </Text>
          </TouchableOpacity>
        )}
        <Text
          numberOfLines={1}
          style={[styles.title, {color: colors.text, fontSize: fonts.medium}]}>
          {title}
        </Text>
      </View>

      {/* Acciones a la derecha */}
      {/* NOTIFICACIÓN DESHABILITADA (se elimina el ícono 🔔 del navbar).
      {showNotification && (
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={onNotificationPress}
            style={styles.notificationBtn}
            testID="appbar-notification">
            <Text style={[styles.bell, {color: colors.text}]}>🔔</Text>
            {notificationCount > 0 && (
              <View
                style={[styles.badge, {backgroundColor: colors.warning}]}
                testID="appbar-notification-badge">
                <Text style={styles.badgeText}>{notificationCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}
      */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  left: {flexDirection: 'row', alignItems: 'center', flex: 1},
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {fontWeight: '800', fontSize: 16},
  title: {fontWeight: '700', flexShrink: 1},
  actions: {flexDirection: 'row', alignItems: 'center'},
  notificationBtn: {padding: 8, position: 'relative'},
  bell: {fontSize: 22},
  badge: {
    position: 'absolute',
    top: 2,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {color: '#FFFFFF', fontSize: 10, fontWeight: '800'},
});
