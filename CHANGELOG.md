# Changelog — PosMobile (frontend POS v4)

Todas las fechas son `YYYY-MM-DD`. Formato inspirado en
[Keep a Changelog](https://keepachangelog.com/es/1.0.0/).

## [0.2.0] — 2026-08-12 — Tema Glassmorphism + pantallas principales (UI/UX)

### Añadido

- **Design System implementado** (spec `UI_UX_DESIGN.md`):
  - `constants/theme.ts` reescrito: paleta Indigo `#4648D4` (primary),
    Esmeralda `#006C49` (success), Ámbar (warning), fondo `#F8F9FF`,
    neutros teñidos de indigo, dark mode autorizado (no inversión).
  - Tokens de tipografía (display/micro), espaciado 1-4-9, radios y
    configuración de blur (glass).
- **Componentes base** en `src/components/`:
  - `GlassSurface` (superficie translúcida + borde brillante + sombra),
    `GlassBackground` (fondo con blobs orgánicos de color),
    `TopAppBar` (avatar + título + notificación con badge),
    `BottomNavBar` (Caja/Inventario/Reportes con estado activo y badge de carrito),
    `SearchInput` (búsqueda glass con debounce), `FilterChip` (categorías),
    `StatusChip` (En stock / Stock bajo / Agotado — siempre texto + color),
    `KpiCard` (métrica con tendencia y variante de alerta),
    `ProductCard` (grid del catálogo con precio destacado),
    `Fab` (carrito con badge numérico / agregar).
- **Pantallas**:
  - `PosTerminalScreen` (Caja): búsqueda global, chips de categoría,
    catálogo grid 2 columnas, FAB carrito con badge, estados vacío/agotado.
  - `InventoryScreen` (Inventario): KPIs (total/agotados/categorías),
    lista de catálogo con StatusChip, FAB "+".
  - `CashierCutScreen` (Corte de caja): comparativo hoy vs. ayer,
    reconciliación esperado/contado con faltante/sobrante, desglose por método.
  - `ReceiptScreen` (Recibo digital): ticket emulado con metadatos, ítems,
    subtotal/IVA/TOTAL en indigo 900, QR placeholder y borde zig-zag.
  - `ReportsScreen` (Reportes): vista previa de métricas (placeholder).
- **Dashboard refactorizado**: contenedor de pestañas (Caja/Inventario/Reportes)
  con estado centralizado; cada pantalla renderiza su `BottomNavBar`.
- **Login rediseñado** (spec 4.1): logo, "ID de operador" + PIN, botón
  "Autenticar →", enlace de ayuda; mantiene el `POST /auth/login` real.
- `ConnectionScreen` y `LicenseBlockScreen` migradas al fondo glass.
- **Datos mock** en `constants/mock-data.ts` (catálogo, inventario, corte,
  ticket) hasta conectar la API real (Fases 3-5).

### Corregido

- **Test de App reparado**: `act` no existe en la compilación de React 19
  de RN 0.84 (ni en react-test-renderer 19.2.3); el test usa un shim que
  ejecuta el callback. `npm test` vuelve a dar 1/1 PASS.

### Verificado

- `tsc --noEmit` 0 errores · `npm run lint` 0 errores (8 warnings de inline
  styles, consistentes con el estilo previo) · `npm test` 1/1 PASS.

### Pendiente

- **Fase 3**: login contra servidor real (endpoints tipados, falta probar contra pos-server).
- **Fase 4**: conexión del catálogo/terminal a `GET /products`; carrito real (Zustand, RF-VE-001).
- **Fase 5**: `POST /sales`, impresión delegada (polling 2s), báscula (heartbeat 500ms), QoS.
- Blur real con `@react-native-community/blur` (GlassSurface ya deja el contrato).


## [0.1.0] — 2026-08-11 — Fase 0 y 1 (bases + hello world)

### Añadido

- Proyecto **React Native CLI** (no Expo) **0.84.1** en `pos-mobile/`,
  alineado a la versión soportada por React Native Windows 0.84.
- `.nvmrc` con **Node 20** (preferencia del equipo).
- Toolchain de desarrollo instalado y documentado en `README.md`:
  - JDK 17 (`openjdk@17`), Android SDK (platform 36, build-tools 36.0.0,
    platform-tools, NDK 27.1, CMake 3.22.1), watchman, PowerShell Core.
  - Variables `JAVA_HOME`, `ANDROID_HOME` y `ANDROID_SDK_ROOT` en `~/.zshrc`.
- Carpeta `windows/` (React Native Windows) generada desde el template oficial
  `cpp-app` mediante `scripts/generate-windows.js` (réplica del `init-windows`
  que en macOS no puede ejecutarse). Incluye `.sln`, proyecto C++,
  `metro.config.js` y `jest.config.windows.js`.
- Dependencias core:
  - `zustand` (carrito en memoria), `@react-native-async-storage/async-storage`,
    `@react-navigation/native` + `native-stack`, `react-native-screens`,
    `react-native-gesture-handler`, `react-native-keychain`,
    `react-native-udp`, `react-native-device-info`, `react-native-windows`.
- Esqueleto `src/` según el layout del PRD:
  - `constants/`: `theme.ts` (tema claro/oscuro para tableta 10") y `app.ts`
    (puertos 3000/5000, timeouts, polling 2s, heartbeat 500ms, debounce 300ms).
  - `models/`: tipos espejo de la API (productos, ventas, pagos, print jobs,
    escala, QoS, cliente, licencia).
  - `stores/`: `auth.store.ts` (JWT+refresh en Keychain, licencia con gracia
    de 72h y bloqueo), `cart.store.ts` (carrito en memoria, contrato
    "never persist"), `sync.store.ts` (estado UI de sync), `server.store.ts`
    (descubrimiento RF-DS).
  - `api/`: `client.ts` (wrapper HTTP con timeout, 401→refresh, errores
    tipados), `discovery.ts` (orden IP→UDP→QR→manual), `endpoints.ts`
    (catálogo de endpoints de la sección 8.2 del PRD).
  - `services/udp-discovery.ts`: broadcast `POS_DISCOVER` por plataforma.
  - `navigation/`: stack Conexión → Login → Dashboard (+ LicenseBlock).
  - `screens/`: `ConnectionScreen`, `LoginScreen`, `DashboardScreen`,
    `LicenseBlockScreen` (placeholders funcionales de primera configuración).
  - `components/POSButton.tsx`: botón de gran tamaño para tablet (RNF-005).
  - `hooks/useTheme.ts`: acceso al tema claro/oscuro.
- `App.tsx`: restaura sesión y valida licencia al arrancar; monta el navegador
  y aplica tema claro/oscuro.
- Infraestructura de verificación:
  - `tsc --noEmit` limpio.
  - ESLint limpio (`npm run lint`) — con override de Jest en `.eslintrc.js`.
  - Jest funcionando con `jest.setup.js` (mocks de módulos nativos:
    keychain, async-storage, device-info, udp, gesture-handler).
- Documentación inline por bloques/secciones en todo el código `src/`
  (stores, api, services, navigation, screens, components, hooks,
  constants, models, App.tsx, jest.setup.js) para que cada archivo sea
  entendible sin leer el PRD. Mantiene el estándar de "Contenido: 1) … 2) …".

### Pendiente

- **Fase 2**: completar discovery (prueba de conectividad con `/health`,
  polling de reintento 5s ya esbozado en ConnectionScreen).
- **Fase 3**: Login contra servidor real (el endpoint `POST /auth/login` ya
  está tipado en `endpoints.ts`).
- **Fase 4**: Dashboard + Nueva Venta (búsqueda de productos con debounce,
  carrito, tipos de precio, MASS/COUNT/CAJ).
- **Fase 5**: confirmación `POST /sales`, impresión delegada (polling 2s),
  báscula (heartbeat 500ms) y encuesta QoS.

## [0.1.1] — 2026-08-11 — App corriendo en emulador Android (Fase 1 completa)

### Añadido

- **Emulador Android funcional**: instalados `emulator` (37.1.11) y la system
  image `system-images;android-36;google_apis;x86_64` (descarga manual vía
  `sdkmanager` con `nohup`; ver README para pasos paso a paso).
- **AVD `POS_Tablet`** (perfil pixel_tablet) optimizado para Mac Intel:
  - Resolución **1280x800 @ 213dpi** (antes 2560x1600 @ 320dpi — saturaba la
    GPU integrada y congelaba el emulador). Boot: **115s → 45s**.
  - RAM **3 GB**, GPU host, sin marco de dispositivo, sin audio.
- **Primer arranque de la app**: instalado `app-debug.apk` y lanzada
  `com.posmobile/.MainActivity`; la **ConnectionScreen** renderiza completa
  (título, "Buscando servidor…", conexión manual y QR) — verificado con
  `uiautomator dump` (el modelo no soporta leer imágenes).
- `metro.config.js` corregido:
  - Eliminados los `watchFolders` del template RNW que apuntaban a rutas
    inexistentes (`node_modules/node_modules`, `node_modules/packages`) y
    causaban crash de Metro vía watchman.
  - Documentado el troubleshooting de watchman en el propio archivo.
- `udp-discovery.ts`: se eliminó el uso del global `Buffer` (no existe en
  Hermes — crash "Property 'Buffer' doesn't exist"). `send()` recibe string
  y react-native-udp lo convierte a Buffer utf8 internamente.
- README: nueva sección **"Emulador Android (AVD) — pasos manuales"** con la
  instalación completa, optimización de rendimiento y troubleshooting.

### Verificado

- `tsc --noEmit` OK · `npm run lint` OK · `npm test` 1/1 PASS.
- Metro estable (bundle HTTP 200, 0 errores) con file-map por defecto.
- App sin errores de runtime en emulador.

### Pendiente

- **Fase 2**: completar discovery (prueba de conectividad con `/health`).
- **Fase 3**: Login contra servidor real.
- **Fase 4**: Dashboard + Nueva Venta.
- **Fase 5**: `POST /sales` + impresión delegada + báscula + QoS.
