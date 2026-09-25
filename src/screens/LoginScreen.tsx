/**
 * screens/LoginScreen.tsx — Autenticación (spec 4.1).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Pantalla de login rediseñada con estética glass:
 *   - Logo circular + título "Sistema POS".
 *   - Campos: ID de operador (tenant) + PIN (4-6 dígitos, numérico).
 *   - Botón primario "Autenticar →" (spec: "Authenticate →").
 *   - Link de ayuda "¿Necesitas ayuda?" (ghost).
 * Envía POST /auth/login real (RF-AU-002); persiste sesión (Keychain).
 * ────────────────────────────────────────────────────────────────────────
 */
import React, {useCallback, useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import POSButton from '../components/POSButton';
import GlassBackground from '../components/GlassBackground';
import GlassSurface from '../components/GlassSurface';
import type {RootStackParamList} from '../navigation';
import {useTheme} from '../hooks/useTheme';
import {useAuthStore} from '../stores/auth.store';
import {login} from '../api/endpoints';
import {ApiError} from '../api/client';
import {getStableDeviceId} from '../utils/device';

/* Tipo del navegador para navegación tipada */
type Nav = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  /* ── 1) HOOKS Y ESTADO LOCAL ─────────────────────────────────────── */

  const theme = useTheme();
  const {colors, fonts, radius, spacing} = theme;
  const navigation = useNavigation<Nav>();

  // Persistir la sesión al confirmar el login (auth.store)
  const setSession = useAuthStore(state => state.setSession);

  const [tenantCode, setTenantCode] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  /* ── 2) ENVÍO DEL LOGIN (RF-AU-002) ──────────────────────────────── */

  const handleLogin = useCallback(async () => {
    // Validación mínima antes de tocar la red
    if (!tenantCode.trim() || !pin.trim()) {
      Alert.alert('Datos incompletos', 'Ingresa código de tenant y PIN.');
      return;
    }
    setLoading(true);
    try {
      // ID de dispositivo ESTABLE (persistido): si cambiara en cada login,
      // el backend lo contaría como dispositivo nuevo → DEVICE_LIMIT (RF-AU-004)
      const deviceId = await getStableDeviceId();
      // POST /auth/login → { token, refresh_token, user, tenant }
      const auth = await login({
        tenant_code: tenantCode.trim(),
        pin: pin.trim(),
        device_id: deviceId,
        device_name: 'Tablet POS',
        device_type: 'TABLET',
      });
      // Guarda JWT+refresh cifrados (Keychain) y navega al Dashboard
      await setSession(auth);
      navigation.replace('Dashboard');
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'No se pudo conectar con el servidor.';
      Alert.alert('Error de inicio de sesión', message);
    } finally {
      setLoading(false);
    }
  }, [tenantCode, pin, navigation, setSession]);

  /* ── 3) RENDER (UI) ──────────────────────────────────────────────── */

  return (
    <GlassBackground>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.content, {padding: spacing.lg}]}>
          {/* Logo + título */}
          <View style={styles.brand}>
            <View style={[styles.logo, {backgroundColor: colors.primary}]}>
              <Text style={[styles.logoText, {color: colors.onPrimary, fontSize: fonts.xlarge}]}>
                POS
              </Text>
            </View>
            <Text style={[styles.title, {color: colors.text, fontSize: fonts.xlarge}]}>
              Sistema POS
            </Text>
            <Text style={[styles.subtitle, {color: colors.textSecondary, fontSize: fonts.regular}]}>
              Punto de venta v4
            </Text>
          </View>

          {/* Formulario glass */}
          <GlassSurface style={styles.form} elevation="raised">
            <Text style={[styles.formLabel, {color: colors.textSecondary, fontSize: fonts.small}]}>
              ID de operador
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                  color: colors.text,
                  fontSize: fonts.regular,
                  borderRadius: radius.md,
                },
              ]}
              placeholder="Código de tenant"
              placeholderTextColor={colors.textDisabled}
              value={tenantCode}
              onChangeText={setTenantCode}
              autoCapitalize="characters"
              autoCorrect={false}
              testID="input-tenant-code"
            />

            <Text style={[styles.formLabel, {color: colors.textSecondary, fontSize: fonts.small}]}>
              PIN
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                  color: colors.text,
                  fontSize: fonts.regular,
                  borderRadius: radius.md,
                },
              ]}
              placeholder="PIN (4-6 dígitos)"
              placeholderTextColor={colors.textDisabled}
              value={pin}
              onChangeText={setPin}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
              testID="input-pin"
            />

            {/* Acción principal: "Autenticar →" */}
            <POSButton
              title={loading ? 'Validando…' : 'Autenticar →'}
              onPress={handleLogin}
              loading={loading}
              large
              style={styles.loginBtn}
              testID="btn-login"
            />

            {/* Enlace de ayuda (spec 4.1: "Need help logging in?") */}
            <POSButton
              title="¿Necesitas ayuda para iniciar sesión?"
              onPress={() => Alert.alert('Ayuda', 'Contacta al administrador del sistema.')}
              variant="ghost"
              testID="btn-help"
            />
          </GlassSurface>

          {/* Cambiar servidor (fallback RF-DS-004) */}
          <POSButton
            title="Cambiar servidor"
            onPress={() => navigation.replace('Connection')}
            variant="ghost"
            testID="btn-cambiar-servidor"
          />
        </View>
      </KeyboardAvoidingView>
    </GlassBackground>
  );
}

/* ── Estilos de la pantalla ─────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: {flex: 1},
  // maxWidth centrado: en escritorio (ventana ancha) el formulario no se estira
  content: {flex: 1, justifyContent: 'center', alignSelf: 'center', width: '100%', maxWidth: 480},
  brand: {alignItems: 'center', marginBottom: 32},
  logo: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {fontWeight: '900'},
  title: {fontWeight: '800', textAlign: 'center'},
  subtitle: {marginTop: 4, textAlign: 'center'},
  form: {padding: 24},
  formLabel: {fontWeight: '600', marginBottom: 6},
  input: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    fontWeight: '500',
  },
  loginBtn: {marginTop: 8},
});
