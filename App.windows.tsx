/**
 * App.windows.tsx — Raíz de la aplicación POS (plataforma Windows).
 *
 * ────────────────────────────────────────────────────────────────────────
 * En Windows NO se usa react-native-screens (módulo Old Architecture
 * incompatible con RNW 0.84 New Arch), por lo que se omite el import de
 * enableScreens y el navigator proviene de ./src/navigation que Metro
 * resuelve a index.windows.tsx (stack navigator 100% JS).
 * ────────────────────────────────────────────────────────────────────────
 */
import React, {useEffect} from 'react';
import {StatusBar, StyleSheet, useColorScheme} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import AppNavigator from './src/navigation';
import {useAuthStore} from './src/stores/auth.store';
import {posTheme, ThemeMode} from './src/constants/theme';
import {applyWindowConfig} from './src/native/window';

function App() {
  /* ── 1) ARRANQUE: RESTAURAR SESIÓN + VALIDAR LICENCIA ─────────────── */

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

  /* ── 2) RENDER: CONTENEDORES RAÍZ + NAVEGADOR ─────────────────────── */

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