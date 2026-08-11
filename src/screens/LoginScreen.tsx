/**
 * screens/LoginScreen.tsx — Login de dispositivo (RF-AU-002).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Qué hace esta pantalla:
 *   - Captura tenant_code + PIN de usuario (4-6 dígitos).
 *   - Envía login al servidor, que valida licencia, límite de dispositivos
 *     (max_devices) y PIN; retorna JWT (24h) + refresh + config del tenant.
 *   - Guarda la sesión (Keychain) y navega al Dashboard.
 * ────────────────────────────────────────────────────────────────────────
 *
 * Secciones:
 *   1) Hooks y estado local
 *   2) Envío del login (handleLogin)
 *   3) Render (UI)
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
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {getUniqueId} from 'react-native-device-info';

import POSButton from '../components/POSButton';
import {RootStackParamList} from '../navigation';
import {useTheme} from '../hooks/useTheme';
import {useAuthStore} from '../stores/auth.store';
import {login} from '../api/endpoints';
import {ApiError} from '../api/client';

/* Tipo del navegador para navegación tipada */
type Nav = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  /* ── 1) HOOKS Y ESTADO LOCAL ─────────────────────────────────────── */

  const theme = useTheme();
  const {colors, fonts} = theme;
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
      // ID de dispositivo para el registro de capacidades
      let deviceId = 'dev-' + Date.now().toString(36);
      try {
        deviceId = await getUniqueId();
      } catch {
        /* sin device-info en todas las plataformas */
      }
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
    <KeyboardAvoidingView
      style={[styles.container, {backgroundColor: colors.background}]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.content}>
        {/* Encabezado */}
        <Text
          style={[styles.title, {color: colors.text, fontSize: fonts.xxlarge}]}>
          Iniciar sesión
        </Text>
        <Text
          style={[
            styles.subtitle,
            {color: colors.textSecondary, fontSize: fonts.medium},
          ]}>
          Ingresa el código de tu negocio y tu PIN
        </Text>

        {/* Credenciales: tenant + PIN numérico */}
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.input,
              borderColor: colors.border,
              color: colors.text,
              fontSize: fonts.large,
            },
          ]}
          placeholder="Código de tenant"
          placeholderTextColor={colors.textSecondary}
          value={tenantCode}
          onChangeText={setTenantCode}
          autoCapitalize="characters"
          autoCorrect={false}
          testID="input-tenant-code"
        />
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.input,
              borderColor: colors.border,
              color: colors.text,
              fontSize: fonts.large,
            },
          ]}
          placeholder="PIN (4-6 dígitos)"
          placeholderTextColor={colors.textSecondary}
          value={pin}
          onChangeText={setPin}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
          testID="input-pin"
        />

        {/* Acciones */}
        <POSButton
          title={loading ? 'Validando…' : 'Entrar'}
          onPress={handleLogin}
          loading={loading}
          large
          testID="btn-login"
        />

        <POSButton
          title="Cambiar servidor"
          onPress={() => navigation.replace('Connection')}
          variant="ghost"
          testID="btn-cambiar-servidor"
        />
      </View>
    </KeyboardAvoidingView>
  );
}

/* ── Estilos de la pantalla ─────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: {flex: 1},
  content: {flex: 1, justifyContent: 'center', padding: 24},
  title: {textAlign: 'center', fontWeight: '800', marginBottom: 8},
  subtitle: {textAlign: 'center', marginBottom: 24},
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
  },
});
