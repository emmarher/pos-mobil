/**
 * screens/ConnectionScreen.tsx — Conexión al servidor (RF-DS, spec glass).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Qué hace esta pantalla:
 *   - Al montar, ejecuta el descubrimiento del servidor con el orden
 *     del PRD: 1) IP guardada → 2) UDP broadcast → 3) QR → 4) manual.
 *   - Si el servidor no responde, muestra "Servidor no disponible" y
 *     reintenta automáticamente cada 5s (RNF-002).
 *   - Ofrece alternativas manuales: IP+puerto y emparejamiento por QR.
 * Rediseñada con estética glass (fondo + tarjetas).
 * ────────────────────────────────────────────────────────────────────────
 *
 * Secciones:
 *   1) Hooks y estado local
 *   2) Descubrimiento automático + reintento 5s
 *   3) Acciones manuales (IP manual, QR)
 *   4) Render (UI)
 */
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import POSButton from '../components/POSButton';
import GlassBackground from '../components/GlassBackground';
import GlassSurface from '../components/GlassSurface';
import {RootStackParamList} from '../navigation';
import {useTheme} from '../hooks/useTheme';
import {useServerStore} from '../stores/server.store';
import {discoverServer, applyServer} from '../api/discovery';
import {SERVER_RETRY_MS} from '../constants/app';

/* Tipo del navegador para navegación tipada */
type Nav = NativeStackNavigationProp<RootStackParamList, 'Connection'>;

export default function ConnectionScreen() {
  /* ── 1) HOOKS Y ESTADO LOCAL ─────────────────────────────────────── */

  const theme = useTheme();
  const {colors, fonts, spacing} = theme;
  const navigation = useNavigation<Nav>();

  // Estado del servidor (Zustand): status/lastError/setLastError
  const status = useServerStore(state => state.status);
  const lastError = useServerStore(state => state.lastError);
  const setLastError = useServerStore(state => state.setLastError);

  // Estado local del formulario de conexión manual
  const [searching, setSearching] = useState(false);
  const [manualIp, setManualIp] = useState('');
  const [manualPort, setManualPort] = useState('3000');

  /* ── 2) DESCUBRIMIENTO AUTOMÁTICO + REINTENTO CADA 5s (RNF-002) ─── */

  /**
   * Ejecuta el discovery (IP guardada → UDP → etc.). Si encuentra el
   * servidor, avanza a la pantalla de Login.
   * Guard con useRef: evita disparos en paralelo y el bucle rápido que
   * reiniciaba el efecto por el cambio de `searching`.
   */
  const searchingRef = useRef(false);
  const runDiscovery = useCallback(async () => {
    if (searchingRef.current) {
      return; // ya hay una búsqueda en curso
    }
    searchingRef.current = true;
    setSearching(true);
    const found = await discoverServer();
    searchingRef.current = false;
    setSearching(false);
    if (found) {
      // TODO: aquí se validaría el tenant y se pasa a Login.
      navigation.replace('Login');
    }
  }, [navigation]);

  /**
   * Efecto de reintento: corre discovery una vez al montar y programa un
   * interval de SERVER_RETRY_MS (5s). NO depende de `searching` (eso
   * causaba un bucle inmediato); usa una ref para evitar solapamientos.
   */
  useEffect(() => {
    if (status === 'connected') {
      return;
    }
    let cancelled = false;
    runDiscovery();
    const timer = setInterval(() => {
      if (!cancelled) {
        runDiscovery();
      }
    }, SERVER_RETRY_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [status, runDiscovery]);

  /* ── 3) ACCIONES MANUALES (RF-DS-004 QR RF-DS-003) ───────────────── */

  /** Conecta con IP + puerto ingresados por el usuario (último recurso) */
  const handleManualConnect = useCallback(async () => {
    const ip = manualIp.trim();
    if (!ip) {
      Alert.alert('IP requerida', 'Ingresa la dirección IP del servidor.');
      return;
    }
    const port = parseInt(manualPort, 10) || 3000;
    setLastError(null);
    await applyServer({ip, port});
    navigation.replace('Login');
  }, [manualIp, manualPort, navigation, setLastError]);

  /** Emparejamiento por QR: pendiente de cámara (RF-DS-003) */
  const handleQrPairing = useCallback(() => {
    // TODO(RF-DS-003): abrir cámara y parsear pos://connect?ip=X&port=Y&tenant=Z
    Alert.alert('Emparejamiento QR', 'Disponible en próxima iteración.');
  }, []);

  /* ── 4) RENDER (UI) ──────────────────────────────────────────────── */

  const serverDown = status === 'failed' && !searching;

  return (
    <GlassBackground>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, {padding: spacing.lg}]}>
        {/* Encabezado */}
        <Text style={[styles.title, {color: colors.text, fontSize: fonts.xxlarge}]}>
          Sistema POS
        </Text>
        <Text style={[styles.subtitle, {color: colors.textSecondary, fontSize: fonts.medium}]}>
          Buscando servidor en la red local…
        </Text>

        {/* Banner de servidor no disponible con auto-reintento (RNF-002) */}
        {serverDown && (
          <GlassSurface
            style={[styles.banner, {backgroundColor: colors.dangerSoft}]}>
            <Text style={[styles.bannerTitle, {color: colors.danger, fontSize: fonts.medium}]}>
              Servidor no disponible
            </Text>
            <Text style={[styles.bannerSub, {color: colors.danger, fontSize: fonts.small}]}>
              Reintentando automáticamente cada 5 segundos
            </Text>
          </GlassSurface>
        )}

        {lastError ? (
          <Text style={[styles.error, {color: colors.danger, fontSize: fonts.small}]}>
            {lastError}
          </Text>
        ) : null}

        {/* Búsqueda automática */}
        <POSButton
          title={searching ? 'Buscando servidor…' : 'Buscar servidor'}
          onPress={runDiscovery}
          loading={searching}
          large
          testID="btn-buscar-servidor"
        />

        <View style={styles.divider} />

        {/* Conexión manual (RF-DS-004) */}
        <GlassSurface style={styles.form}>
          <Text style={[styles.sectionTitle, {color: colors.text, fontSize: fonts.medium}]}>
            Conexión manual
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.input,
                borderColor: colors.border,
                color: colors.text,
                fontSize: fonts.regular,
              },
            ]}
            placeholder="IP del servidor (ej. 192.168.1.10)"
            placeholderTextColor={colors.textDisabled}
            value={manualIp}
            onChangeText={setManualIp}
            keyboardType="decimal-pad"
            autoCapitalize="none"
            testID="input-ip-manual"
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.input,
                borderColor: colors.border,
                color: colors.text,
                fontSize: fonts.regular,
              },
            ]}
            placeholder="Puerto (3000)"
            placeholderTextColor={colors.textDisabled}
            value={manualPort}
            onChangeText={setManualPort}
            keyboardType="number-pad"
            testID="input-puerto-manual"
          />
          <POSButton
            title="Conectar con IP manual"
            onPress={handleManualConnect}
            variant="secondary"
            testID="btn-ip-manual"
          />
        </GlassSurface>

        <View style={styles.divider} />

        {/* Emparejamiento por QR (RF-DS-003) */}
        <POSButton
          title="Escanear código QR de emparejamiento"
          onPress={handleQrPairing}
          variant="ghost"
          testID="btn-qr-pairing"
        />
      </ScrollView>
    </GlassBackground>
  );
}

/* ── Estilos de la pantalla ─────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: {flex: 1},
  content: {justifyContent: 'center'},
  title: {textAlign: 'center', fontWeight: '800', marginTop: 32},
  subtitle: {textAlign: 'center', marginVertical: 12},
  banner: {borderRadius: 12, padding: 16, marginVertical: 12},
  bannerTitle: {textAlign: 'center', fontWeight: '700'},
  bannerSub: {textAlign: 'center', marginTop: 4},
  error: {textAlign: 'center', marginVertical: 8},
  divider: {height: 1, marginVertical: 16},
  form: {padding: 16},
  sectionTitle: {fontWeight: '700', marginBottom: 8},
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
});
