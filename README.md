# PosMobile — Frontend React Native (POS v4)

Cliente móvil del **Sistema Punto de Venta Multiplataforma (POS) v4.0** según el
[PRD_POS_v4_completo.md](../PRD_POS_v4_completo.md).

Este proyecto es el **frontend** (`pos-mobile/`). El backend Fastify vive en
`pos-server/` (proyecto separado, no monorepo). **Todo cambio debe quedar
restringido a esta carpeta.**

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | React Native **CLI** 0.84.1 (NO Expo) |
| Plataformas | Android 8.0+ (API 26) · Windows 10/11 64-bit |
| Estado | Zustand 5 (carrito en memoria, nunca persistido) |
| Navegación | React Navigation (native-stack) |
| Almacenamiento local | AsyncStorage (IP + última fecha de licencia) |
| Tokens | react-native-keychain (encriptado, degrada a AsyncStorage) |
| Discovery UDP | react-native-udp (Android) / dgram (Windows) |
| Node | **20** (ver `.nvmrc`) |

## Requisitos del entorno

- **Node.js 20** (`.nvmrc` fijado; `nvm use` lo activa).
- **JDK 17** (`openjdk@17`).
- **Android SDK**: `platforms;android-36`, `build-tools;36.0.0`,
  `platform-tools`, `ndk;27.1.12297006`, `cmake;3.22.1`.
- **watchman** (recomendado).
- **PowerShell Core (`pwsh`)** solo si vas a tocar la generación de `windows/`.

Variables de entorno (ya configuradas en `~/.zshrc`):

```sh
export JAVA_HOME="/usr/local/opt/openjdk@17"
export ANDROID_HOME="/usr/local/share/android-commandlinetools"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
```

## Puesta en marcha

### Orden correcto (Android)

El error `Error: device is still booting` en `app:installDebug` ocurre cuando
Gradle intenta instalar el APK **antes de que el emulador termine de arrancar**.
El boot del AVD (45s+) puede ser más lento que la compilación (73s). La regla:
**siempre esperar `sys.boot_completed=1` antes de instalar**.

```sh
cd pos-mobile
nvm use                 # activa Node 20 (lee .nvmrc)
npm install             # solo la primera vez

# 1) Servidor de Metro (terminal 1) — primero, para que la app cargue el bundle
npm start

# 2) Emulador (terminal 2) — si no está encendido
nohup emulator -avd POS_Tablet -no-audio -no-boot-anim -gpu host -no-snapshot-load &

# 3) ESPERAR el boot completo ANTES de compilar/instalar (clave)
adb wait-for-device
adb shell 'while [ "$(getprop sys.boot_completed)" != "1" ]; do sleep 2; done'

# 4) Ahora sí, compilar + instalar + lanzar (terminal 2)
npx react-native run-android
```

> Si el emulador ya está encendido pero `run-android` falla igual por timing,
> instala el APK ya compilado y lánzalo directamente:
> ```sh
> adb install -r android/app/build/outputs/apk/debug/app-debug.apk
> adb shell am start -n com.posmobile/.MainActivity
> ```

**Solo build del APK debug** (sin instalar):

```sh
npx react-native build-android --mode=debug
```

### Debugging (Android)

- **Metro en otra terminal**: `npm start` sirve el bundle JS por el puerto
  8081. La app debug la descarga en caliente; editar código recarga con
  **R** (doble **R** fuerza reload completo).
- **DevMenu**: sacude el dispositivo o `adb shell input keyevent 82`
  (menu) para abrir el menú de desarrollo (reload, debug JS, etc.).
- **Logs de la app**: `adb logcat` filtra por la app:
  `adb logcat --pid=$(adb shell pidof com.posmobile)`. Los `console.log`
  aparecen en la terminal de Metro.
- **Debugger JS**: en el DevMenu, "Debug" abre Chrome DevTools; con React
  DevTools standalone puedes inspeccionar el árbol de componentes.
- **Reinstalar sin recompilar** (cuando el APK ya existe): `adb install -r
  android/app/build/outputs/apk/debug/app-debug.apk && adb shell am start
  -n com.posmobile/.MainActivity`.

### Windows (requiere PC con Visual Studio)

```sh
cd pos-mobile
nvm use
npm install

# 1) Servidor de Metro (terminal 1)
npm start

# 2) Terminal 2 — compilar + instalar + lanzar en la PC Windows
npm run windows
```

Ver sección [Windows (React Native Windows 0.84)](#windows-react-native-windows-084)
para requisitos y debugging.

## Emulador Android (AVD) — pasos manuales

Si no tienes el emulador instalado o quieres recrear el AVD desde cero:

```sh
# 1) Activar entorno
export JAVA_HOME="/usr/local/opt/openjdk@17"
export ANDROID_HOME="/usr/local/share/android-commandlinetools"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"

# 2) Instalar emulador + system image (descarga grande ~1.5 GB; usar nohup
#    para que no muera al cerrarse la terminal)
yes | sdkmanager --licenses
nohup sdkmanager "emulator" "system-images;android-36;google_apis;x86_64" &

# 3) Crear el AVD (tablet; el warning de devices.xml es inofensivo)
echo "no" | avdmanager create avd --name "POS_Tablet" \
  --package "system-images;android-36;google_apis;x86_64" --device "pixel_tablet"

# 4) OPTIMIZAR RENDIMIENTO (clave en Mac Intel): bajar la resolución
#    enorme por defecto (2560x1600 satura la GPU integrada y congela)
CONFIG=~/.android/avd/POS_Tablet.avd/config.ini
sed -i '' 's/hw.lcd.width=2560/hw.lcd.width=1280/'  "$CONFIG"
sed -i '' 's/hw.lcd.height=1600/hw.lcd.height=800/' "$CONFIG"
sed -i '' 's/hw.lcd.density=320/hw.lcd.density=213/' "$CONFIG"
sed -i '' 's/hw.ramSize=2G/hw.ramSize=3G/'          "$CONFIG"
sed -i '' 's/showDeviceFrame=yes/showDeviceFrame=no/' "$CONFIG"

# 5) Lanzar (flags: sin audio, sin animación de boot, GPU host, boot limpio)
export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$PATH"
nohup emulator -avd POS_Tablet -no-audio -no-boot-anim -gpu host -no-snapshot-load &

# 6) Esperar el boot y correr la app
adb wait-for-device
adb shell 'while [ "$(getprop sys.boot_completed)" != "1" ]; do sleep 2; done'
npm run android
```

> **Notas de rendimiento (Mac Intel):**
> - La resolución `1280x800 @ 213dpi` es la mínima del PRD y reduce ~5x los
>   píxeles que renderiza la GPU integrada. El boot baja de ~115s a ~45s.
> - `hw.gpu.enabled=yes` + `-gpu host` usan la GPU del host.
> - Verificar aceleración con: `emulator -accel-check` (debe decir `HVF` OK).

> **Troubleshooting:**
> - **`Task :app:installDebug FAILED` / `Error: device is still booting`**: el
>   emulador no había terminado de arrancar. Espera el boot antes de instalar:
>   `adb wait-for-device && adb shell 'while [ "$(getprop sys.boot_completed)" != "1" ]; do sleep 2; done'`
>   y vuelve a `npx react-native run-android` (o instala el APK ya compilado
>   con `adb install -r`).
> - **Metro muere con "node_modules/node_modules: No such file"**: es un bug de
>   watchman + los `watchFolders` del template RNW (rutas inexistentes). El
>   `metro.config.js` ya está corregido; si reaparece:
>   `watchman shutdown-server && pkill -9 watchman` y reinicia Metro.
> - **"Property 'Buffer' doesn't exist"** al descubrir el servidor: Hermes no
>   define `Buffer` global. `udp-discovery.ts` ya envía strings (react-native-udp
>   los convierte a Buffer internamente); no volver a usar `Buffer.from` ahí.
> - **Emulador congelado / arranque lento**: verifica aceleración con
>   `emulator -accel-check` (debe decir `HVF` OK) y que el AVD use
>   `1280x800 @ 213dpi` (pasos en la sección de emulador).
> - **"device offline" en adb**: reinicia el servidor de adb:
>   `adb kill-server && adb start-server`.

## Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `npm start` | Metro bundler |
| `npm run android` | Compila e instala en Android |
| `npm run windows` | Compila y corre en Windows (RNW) |
| `npm run lint` | ESLint |
| `npm test` | Jest (con mocks de módulos nativos) |
| `npm run test:windows` | Jest con preset de RNW |
| `node scripts/generate-windows.js` | Regenera la carpeta `windows/` desde el template RNW |

## Estructura del proyecto

```
pos-mobile/
├── android/                # Proyecto nativo Android
├── windows/                # Proyecto nativo Windows (RNW 0.84)
├── scripts/
│   └── generate-windows.js # Genera windows/ desde el template oficial
├── src/
│   ├── api/
│   │   ├── client.ts       # Cliente HTTP (timeout, 401→refresh, errores)
│   │   ├── discovery.ts    # Orden de descubrimiento: IP→UDP→QR→manual (RF-DS)
│   │   └── endpoints.ts    # Todos los endpoints del servidor (sección 8.2 PRD)
│   ├── components/         # Sistema de diseño glass (spec UI_UX_DESIGN.md)
│   │   ├── GlassSurface.tsx, GlassBackground.tsx   # Superficies + blobs
│   │   ├── TopAppBar.tsx, BottomNavBar.tsx         # Navegación global
│   │   ├── SearchInput.tsx, FilterChip.tsx         # Búsqueda y filtros
│   │   ├── StatusChip.tsx, KpiCard.tsx, ProductCard.tsx, Fab.tsx
│   │   └── POSButton.tsx
│   ├── constants/          # theme.ts (glass/indigo), app.ts, mock-data.ts
│   ├── hooks/              # useTheme
│   ├── models/             # Tipos espejo de la API (productos, ventas, …)
│   ├── navigation/         # Stack: Conexión → Login → Dashboard
│   ├── screens/            # Connection, Login, Dashboard (tabs),
│   │   #                     PosTerminal, Inventory, CashierCut, Receipt, Reports
│   ├── services/
│   │   └── udp-discovery.ts# Broadcast "POS_DISCOVER" por plataforma
│   ├── stores/             # Zustand
│   │   ├── auth.store.ts   # JWT + refresh + licencia (bloqueo) [RF-AU]
│   │   ├── cart.store.ts   # Carrito en MEMORIA (nunca persistido) [RF-VE-001]
│   │   ├── sync.store.ts   # Estado de UI de sync [RF-SY]
│   │   └── server.store.ts # Estado del servidor descubierto [RF-DS]
│   └── utils/
├── App.tsx                 # Raíz: restaura sesión, tema, navegador
├── UI_UX_DESIGN.md         # Design spec (Glassmorphism, paleta, pantallas)
├── index.js                # Entry point
├── jest.config.js          # Jest con transform de paquetes ESM
└── jest.setup.js           # Mocks de módulos nativos
```

## Reglas de arquitectura (no negociables)

1. **Sin base de datos local.** Todo dato viene por HTTP del servidor
   Fastify (puerto 3000). Servidor caído → "Servidor no disponible" con
   reintento cada 5s (RNF-002).
2. **Carrito solo en memoria.** `cart.store.ts` no persiste nada; la venta
   se envía únicamente en la confirmación con `POST /sales` (RF-VE-001).
3. **Vocabulario de dominio en español:** folio, cortes de caja, báscula,
   mayoreo, venta por peso (CAJ), clientes a crédito, vuelto.
4. **Los screens no hardcodean URLs.** Todo pasa por `src/api/`.
5. **El servidor es la fuente de verdad** de precios, descuentos y crédito;
   los stores solo reflejan estado para la UX.
6. **Métodos de pago:** Efectivo (vuelto), Tarjeta/Transferencia
   (reference_code), Crédito (límite → PENDING), Voucher. Múltiples por venta.

## Flujo de primera configuración (sección 7.1 del PRD)

```
Iniciar app → ¿IP guardada? → Sí: conectar → Login
                             → No / 3 fallos: UDP broadcast "POS_DISCOVER":5000
                                             → QR pairing pos://connect
                                             → IP manual
Login: tenant_code + PIN → validar licencia + dispositivos → Dashboard
```

## Windows (React Native Windows 0.84)

- La carpeta `windows/` se genera con `node scripts/generate-windows.js`
  (réplica del `init-windows` oficial, que en macOS no puede ejecutarse).
- **Compilar requiere una PC Windows** con Visual Studio 2026 + Windows SDK
  y `npx @react-native-community/cli run-windows` (script `npm run windows`).
- Si RNW llegara a un límite duro, el PRD contempla Electron como Plan B
  (no cambiar sin consultar).

### Requisitos (en la PC Windows)

| Requisito | Detalle |
|-----------|---------|
| Visual Studio 2026 | Carga de trabajo **"Desarrollo para escritorio con C++"** |
| Windows SDK | 10.0.22621 o superior |
| Node.js | 20 (mismo `.nvmrc`) |
| PowerShell | 5.1 o 7 (pwsh) |

### Orden correcto (Windows)

```powershell
# 1) Terminal 1 — Metro bundler
cd pos-mobile
nvm use
npm start

# 2) Terminal 2 — compilar, instalar y lanzar la app de escritorio
cd pos-mobile
nvm use
npm run windows          # = npx @react-native-community/cli run-windows
```

> Si la carpeta `windows/` no existe o está corrupta, regenérala:
> `node scripts/generate-windows.js` y repite `npm run windows`.

### Debugging (Windows)

- **Metro en otra terminal**: la app Windows se conecta a Metro por el
  puerto 8081 igual que Android. Si la app abre sin contenido, revisa que
  `npm start` esté corriendo y que el firewall permita 8081.
- **DevTools**: con la app corriendo, presiona `Ctrl+Shift+D` (DevMenu de
  RNW) para recargar el bundle, abrir el inspector de React DevTools o
  cambiar de servidor de Metro.
- **Logs**: los `console.log` salen en la terminal de Metro. Errores nativos
  (C++) se ven en el **Output/Depurador de Visual Studio** o con el
  Depurador de eventos de Windows.
- **Reconstrucción limpia** (ante estados raros): cierra la app,
  `npx react-native-windows` cache y vuelve a correr `npm run windows`.

## Testing

```sh
npm test          # jest.config.js (mocks de módulos nativos en jest.setup.js)
npm run lint
npx tsc --noEmit  # verificación de tipos
```

## Documentación de referencia

- `PRD_POS_v4_completo.md` — fuente de verdad de requisitos y flujos.
- `esquema_BD_POS_v4_completo.sql` — esquema SQL (contrato de datos).
- `CHANGELOG.md` — historial de cambios de este frontend.
