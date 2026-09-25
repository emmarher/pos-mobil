/**
 * App.tsx — Raíz de la aplicación POS.
 *
 * ────────────────────────────────────────────────────────────────────────
 * Qué hace este módulo:
 *   - Restaura la sesión (tokens encriptados) y valida la licencia al
 *     arrancar (RF-AU-003).
 *   - Provee contenedores base: gesture handler, safe area y tema
 *     claro/oscuro.
 *   - Monta el navegador con el flujo: Conexión → Login → Dashboard.
 *
 * Secciones:
 *   1) Arranque: restauración de sesión + validación de licencia
 *   2) Render: contenedores raíz y navegador
 */
import React, {useEffect} from 'react';
import {StatusBar, StyleSheet, useColorScheme} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {enableScreens} from 'react-native-screens';

import AppNavigator from './src/navigation';
import {useAuthStore} from './src/stores/auth.store';
import {posTheme, ThemeMode} from './src/constants/theme';
import {applyWindowConfig} from './src/native/window';

// Activa navegación nativa optimizada (react-native-screens)
enableScreens();

function App() {
  /* ── 1) ARRANQUE: RESTAURAR SESIÓN + VALIDAR LICENCIA ────────────── */

  const scheme = useColorScheme();
  const mode: ThemeMode = scheme === 'dark' ? 'dark' : 'light';
  const theme = posTheme[mode];

  const restoreSession = useAuthStore(state => state.restoreSession);
  const validateLicense = useAuthStore(state => state.validateLicense);

  useEffect(() => {
    // Al arrancar: restaurar tokens y evaluar licencia (RF-AU-003)
    (async () => {
      await restoreSession();
      await validateLicense();
    })();
    // Ventana nativa (Windows): título, tamaño mínimo y colores del TitleBar
    applyWindowConfig(theme);
  }, [restoreSession, validateLicense, theme]);

  /* ── 2) RENDER: CONTENEDORES RAÍZ + NAVEGADOR ────────────────────── */

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar
          barStyle={theme.dark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
