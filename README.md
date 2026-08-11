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

```sh
cd pos-mobile
nvm use                 # activa Node 20 (lee .nvmrc)
npm install

# Android (emulador o dispositivo conectado)
npx react-native run-android

# Solo build del APK debug
npx react-native build-android --mode=debug

# Windows (requiere PC con Visual Studio; ver sección Windows)
npm run windows
```

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
> - **Metro muere con "node_modules/node_modules: No such file"**: es un bug de
>   watchman + los `watchFolders` del template RNW (rutas inexistentes). El
>   `metro.config.js` ya está corregido; si reaparece:
>   `watchman shutdown-server && pkill -9 watchman` y reinicia Metro.
> - **"Property 'Buffer' doesn't exist"** al descubrir el servidor: Hermes no
>   define `Buffer` global. `udp-discovery.ts` ya envía strings (react-native-udp
>   los convierte a Buffer internamente); no volver a usar `Buffer.from` ahí.

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
│   ├── components/         # UI reutilizable (POSButton, etc.)
│   ├── constants/          # theme.ts (claro/oscuro), app.ts (puertos, timeouts)
│   ├── hooks/              # useTheme
│   ├── models/             # Tipos espejo de la API (productos, ventas, …)
│   ├── navigation/         # Stack: Conexión → Login → Dashboard
│   ├── screens/            # Connection, Login, Dashboard, LicenseBlock
│   ├── services/
│   │   └── udp-discovery.ts# Broadcast "POS_DISCOVER" por plataforma
│   ├── stores/             # Zustand
│   │   ├── auth.store.ts   # JWT + refresh + licencia (bloqueo) [RF-AU]
│   │   ├── cart.store.ts   # Carrito en MEMORIA (nunca persistido) [RF-VE-001]
│   │   ├── sync.store.ts   # Estado de UI de sync [RF-SY]
│   │   └── server.store.ts # Estado del servidor descubierto [RF-DS]
│   └── utils/
├── App.tsx                 # Raíz: restaura sesión, tema, navegador
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
