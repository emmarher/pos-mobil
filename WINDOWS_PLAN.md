# Plan — POS para Windows (escritorio RNW 0.84)

> Documento de estructura, diseño y planificación de la app **Windows** de
> `pos-mobile/`, derivado de la versión Android. Toda la lógica de negocio,
> el dominio y los tokens visuales son **compartidos** (`src/`); aquí se
> plantea **qué cambia y qué hay que crear** para que la misma base funcione
> como app de escritorio.
> Referencias: `UI_UX_DESIGN.md` (spec visual), `README.md` (arquitectura),
> `PRD_POS_v4_completo.md` (requisitos RF-*). Versión: 1.0 — 2026-08-17.

---

## 1. Contexto y alcance

**Baseline (ya existe):**

- RN CLI 0.84 + `react-native-windows` 0.84 con carpeta `windows/` generada
  (`node scripts/generate-windows.js`) y script `npm run windows`.
- La versión Android se diseñó para **tableta portrait 1280×800 táctil**
  (spec 2.3, RNF-006): BottomNavBar, FAB, bottom sheets, grid fijo, touch
  targets 48px.

**Objetivo Windows:** el mismo POS como **app de escritorio** en Windows
10/11: ventana redimensionable, uso con ratón + teclado, y si la terminal lo
tiene, pantalla táctil. No es un "port" aparte: es la misma base `src/` con
un **shell y una capa de interacción que se adaptan por plataforma**.

**Principios rectores (heredados del spec 2.1):**

1. El dinero manda: montos en `display`/900 indigo, sin cambios.
2. Tres pasos para vender (RNF-005): escanear/buscar → agregar → confirmar.
3. Ratón + teclado son ciudadanos de primera clase: hover, focus rings,
   atajos, orden de tabulación.
4. La ventana se redimensiona: el layout **responde**, no se estira.
5. El ticket sigue siendo el artefacto (ReceiptScreen compartido).

---

## 2. Qué ya funciona en Windows sin cambios

| Capa | Estado en Windows | Detalle |
|------|-------------------|---------|
| `src/api/*` (client, endpoints, discovery) | ✅ | `fetch`, `AbortController`, `URL` nativos en el runtime Node de RNW |
| `src/services/udp-discovery.ts` | ✅ | Rama `Platform.OS === 'windows'` usa `dgram` de Node (ya implementada) |
| `src/stores/*` (Zustand) | ✅ | JS puro; carrito en memoria (RF-VE-001) |
| AsyncStorage | ✅ | `@react-native-async-storage/async-storage` con soporte RNW |
| React Navigation + native-stack | ✅ | `react-native-screens` y `react-native-gesture-handler` soportan RNW |
| `react-native-safe-area-context` | ✅ | En ventana devuelve insets 0 (sin notch) |
| Tema, tokens, `useTheme` | ✅ | `constants/theme.ts` es cross-platform |
| Fuentes | ✅ | Sin `.ttf` cargados: usa `system-ui` → **Segoe UI** en Windows (buen fallback) |
| ReceiptScreen, Login, Connection, etc. | ✅ (lógica) | Solo requiere adaptación de presentación (ver §5) |
| `Modal` de RN | ✅ | RNW lo soporta; `animationType="slide"` debe pasar a "fade"/"none" (§5) |

**Conclusión:** el núcleo (auth, discovery, carrito, venta, recibo) **no se
toca**. El trabajo está en 3 frentes: (a) config nativa de la ventana,
(b) shell/layout responsivo, (c) adaptación de la capa de interacción.

---

## 3. Decisiones de arquitectura (Android → Windows)

| Aspecto | Android (actual) | Windows (propuesto) | Justificación |
|---------|------------------|---------------------|---------------|
| Orientación | Portrait fija | Libre, ventana redimensionable | Ventana nativa de escritorio |
| Navegación global | BottomNavBar (64px) | **Rail lateral** (`AppShell`) conmutable a BottomNavBar en ventanas angostas | Patrón estándar escritorio (Fluent NavigationView); evita barra móvil en pantalla ancha |
| Presentación de detalle | Bottom sheets (`Modal` slide) | **Diálogos centrados** + paneles acoplables | El ratón no "desliza"; los diálogos con botones Aceptar/Cancelar son lo esperado |
| Carrito | FAB flotante + sheet | **Panel acoplable derecho** (drawer) en Caja; FAB solo en pantallas angostas | El carrito es el flujo más usado: visible de forma persistente en ancho |
| Catálogo | Grid fijo `numColumns={4}` | Grid **reactivo** (`numColumns` por breakpoint, min 4) | Aprovechar el ancho; mantener legibilidad (RNF-005) |
| Teclado numérico | `keyboardType="number-pad"` (PIN, puerto) | `TextInput` estándar + validación | No hay teclado en pantalla en escritorio |
| Título de app | `StatusBar` | **Barra de título nativa** de la ventana | RNW expone `TitleBar` (módulo `TitleBar`) |
| Touch targets | 48px mín. | 48px en táctil; **min 32px + 8px gap** con ratón; estado `hover` | Focus/hover con ratón, sin sacrificar modo táctil |
| Shortcuts | — | **Atajos de teclado** globales | Flujo de caja rápido con teclado (§4.3) |
| Blur glass | Translúcido + blur real (pendiente `@react-native-community/blur`) | **Sin blur real**: usar las mismas superficies `rgba` (ya implementadas) | RNW no tiene blur nativo; el glass ya degrada con translucidez + borde brillante |

**Regla:** todo lo que sea puramente de presentación vive en componentes
que se ramifican con `Platform.OS === 'windows'` (o `useIsDesktop()`).
Ninguna pantalla cambia su lógica.

---

## 4. Estructura propuesta

Se añade una capa de **layout + interacción de escritorio** sin tocar la
arquitectura existente. No se reestructura `src/`; se agregan piezas:

```
src/
├── layout/                          # NUEVO — shell de escritorio
│   ├── AppShell.tsx                 # Rail lateral + TopAppBar + contenido
│   ├── Breakpoints.ts               # Constantes de breakpoint (ancho de ventana)
│   ├── useIsDesktop.ts              # hook: Platform.OS === 'windows' + ancho
│   ├── useWindowBreakpoint.ts       # hook: 'narrow' | 'medium' | 'wide'
│   └── ShortcutsContext.tsx         # Registro central de atajos (Enter/Esc/Ctrl+…)
├── components/
│   ├── DesktopDialog.tsx            # NUEVO — Modal "fade" centrado (sustituye sheets)
│   ├── CartPanel.tsx                # NUEVO — panel derecho acoplable del carrito
│   ├── SideNavRail.tsx              # NUEVO — rail Caja/Inventario/Reportes (desktop)
│   ├── GridRow.tsx                  # NUEVO — fila catálogo/listado densa (desktop)
│   └── (BottomNavBar, Fab, CartSheet… siguen igual para Android)
├── screens/
│   ├── PosTerminalScreen.tsx        # MODIFICAR — grid reactivo + CartPanel en wide
│   ├── InventoryScreen.tsx          # MODIFICAR — filas densas en wide, resto igual
│   └── (Connection, Login, Receipt) # MODIFICAR leve: focus inicial y Enter=aceptar
└── native/                          # NUEVO — wrappers por plataforma (opcional)
    └── window.ts                    # título, tamaño mínimo, maximizar (RNW TitleBar)
```

**Reglas de la capa:**

1. **`src/layout/*` solo se monta en Windows** (`Platform.OS === 'windows'`);
   Android/tablet sigue con su árbol actual (cero regresión).
2. Los componentes NUEVOS no dependen de Android; los EXISTENTES no cambian
   su API (se añaden props opcionales, p. ej. `onClose`/`escToClose`).
3. El grid reactivo usa `useWindowDimensions` (RN core) — sin librerías nuevas.
4. Los atajos se registran en `ShortcutsContext`; no se esparcen en pantallas.

---

## 5. Diseño adaptativo (layout de escritorio)

### 5.1 Breakpoints (ventana)

| Breakpoint | Ancho | Comportamiento |
|------------|-------|----------------|
| `narrow` | < 900px | Mantiene patrón móvil: BottomNavBar, FAB, sheets. Útil si la ventana se encoge |
| `medium` | 900–1279px | Rail lateral + grid 4–6 columnas + sheets como diálogos |
| `wide` | ≥ 1280px | Rail lateral + **CartPanel** derecho fijo + grid 6–8 columnas |

Tamaño mínimo de ventana propuesto: **1024×640** (evita layouts rotos;
configurable en `native/window.ts`). Altura objetivo de trabajo: 768px.

### 5.2 Shell (wide/medium)

```
┌──────────────────────────────────────────────────────────────────────┐
│ ┌────┐  ┌────────────────────────────────────────────────────────┐  │
│ │Rail│  │ TopAppBar: [avatar] Terminal de ventas     [⌨ atajos] │  │
│ │    │  ├───────────────────────────────────────────┬────────────┤  │
│ │🛒   │  │ 🔍 Buscar productos…                      │            │  │
│ │📦   │  │ (Todos)(Comida)(Bebidas)…                 │  CARRITO   │  │
│ │📊   │  │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐           │  (panel)   │  │
│ │    │  │ │ img │ │ img │ │ img │ │ img │           │ 3 ítems    │  │
│ │[UP]│  │ │Coca…│ │Sabr…│ │Lech…│ │Huev…│           │ $53.36     │  │
│ │    │  │ │$18.5│ │$9.0 │ │$28  │ │$78  │           │ [Confirmar]│  │
│ │    │  │ └─────┘ └─────┘ └─────┘ └─────┘           │            │  │
│ │    │  │          (grid reactivo 6–8 cols)          │            │  │
│ └────┘  └───────────────────────────────────────────┴────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

- **Rail lateral** (`SideNavRail`): ancho 72px, glass, ícono + etiqueta
  vertical; estado activo con pastilla `primarySoft` (mismos tokens 3.2).
  Altura completa, debajo del TopAppBar.
- **CartPanel**: 320–360px, `surfaceSolid`/glass, con los mismos contenidos
  del CartSheet (items, cliente, métodos de pago, TOTAL, Confirmar). Se abre
  por el rail o `Ctrl+Space`; **no** es un modal.
- **TopAppBar** sin inset-top (insets=0) y con el título de la ventana nativo
  (RNW `TitleBar`) — el header de la app es solo contenido.

### 5.3 Pantallas re-montadas

- **Login / Connection** (spec 4.1): tarjeta glass centrada, `maxWidth≈420px`
  en el centro de la ventana; autofocus en "ID de operador" y **Enter =
  Autenticar** (atajo local).
- **Terminal (Caja)** (§5.2): grid reactivo; al hacer clic en producto →
  **diálogo** de cantidad (DesktopDialog) con Enter=aceptar, Esc=cancelar.
- **Inventario** (spec 4.3): en `wide`, filas densas `GridRow`
  (imagen 40px · nombre/SKU · stock · StatusChip · [Editar]); KPIs iguales.
  El formulario de alta pasa a diálogo.
- **Corte de caja / Reportes / Recibo**: pantallas compartidas, solo se
  centran con `maxWidth` (960px) en ventana ancha. El recibo conserva su
  zig-zag y TOTAL indigo 900 sin cambios.

---

## 6. Modelo de interacción Windows

### 6.1 Ratón

- **Hover**: estado `hover` (indigo-500 en primarios, sombra elevada en
  tarjetas) vía `onMouseEnter`/`onMouseLeave` (soportados por RNW en RN core).
  No cambiar layout con hover — solo color/sombra.
- **Cursor**: `default`/`pointer` según interactividad (evitar `pointer` en
  texto). En RNW se estiliza con `props.cursor`/`cursor: 'pointer'`.
- **Doble clic** en producto de Caja = agregar 1 unidad directo (atajo RNF-005).

### 6.2 Teclado y foco

- **Focus rings** 2–3px, offset, contraste 3:1 (ya exigidos en spec 6 para
  Windows); visibles con Tab, invisibles con ratón.
- **Orden de tabulación** explícito en cada pantalla: acciones primero
  (buscar → catálogo → confirmar), nada fuera de orden.
- **Diálogos**: al abrir, foco en la acción principal; Esc cierra; Enter acepta.

### 6.3 Atajos globales (ShortcutsContext)

| Atajo | Acción | Pantalla |
|-------|--------|----------|
| `Ctrl+K` | Foco en búsqueda | Caja / Inventario |
| `Enter` | Confirmar (diálogo/sheet/pago) | Caja |
| `Esc` | Cerrar diálogo / panel | Global |
| `Ctrl+Space` | Alternar CartPanel | Caja |
| `Ctrl+1/2/3` | Cambiar pestaña (Caja/Inventario/Reportes) | Global post-login |
| `Ctrl+O` | Abrir corte de caja | Global |

> Los atajos **no** deben colisionar con los de Metro/DevTools en dev
> (`Ctrl+D` DevMenu, `Ctrl+Shift+D` — se evitan).

### 6.4 Accesibilidad

- Ratón + teclado + táctil simultáneos (ventana táctil): targets ≥ 44px en
  todo caso; estados nunca solo color (Grey Test heredado).
- Contraste AA heredado (§6 spec); el rail usa etiqueta + ícono.
- **Reduced motion** del sistema aplica a diálogos (fade rápido, sin slide).

---

## 7. Adaptación de componentes (tabla de decisión)

| Componente Android | En Windows | Acción |
|--------------------|------------|--------|
| `BottomNavBar` | — | Se mantiene solo en `narrow`; en medium/wide lo sustituye `SideNavRail`. Misma API/`NavTab` |
| `Fab` (carrito) | — | Solo `narrow`; en medium/wide el carrito es `CartPanel`. Sin cambios de API |
| `CartSheet` (`Modal slide`) | → | `CartPanel` (wide) o `DesktopDialog` (medium). Reutiliza su contenido interno si se extrae a `CartContent.tsx` |
| `ProductSheet` / `ProductFormSheet` | → | `DesktopDialog` (fade, centrado, `maxWidth`), `animationType="fade"`/`"none"` |
| `ProductCard` | Grid reactivo | Solo cambiar el contenedor (columnas); la tarjeta es igual |
| `GlassSurface` / `GlassBackground` | Translúcido sin blur | Sin cambios: ya usa `rgba` (el blur real nunca se instaló) |
| `TopAppBar` | Barra de contenido | Quitar inset-top en Windows (insets=0). Igual componente, condicional `insets.top` |
| `SearchInput`, `FilterChip`, `StatusChip`, `KpiCard`, `POSButton` | ✓ | Sin cambios (solo añadir `hover`/`focus` a POSButton si falta) |
| `StatusBar` (App.tsx) | No-op | Sin cambios (RNW lo ignora) |

**Extracción recomendada:** mover el cuerpo de `CartSheet` a
`components/CartContent.tsx` (items, métodos de pago, totales) para que
`CartPanel` (desktop) y `CartSheet` (Android) lo compartan sin duplicar.

---

## 8. Huecos de módulos nativos y mitigaciones

| Módulo | Soporte RNW | Acción / mitigación |
|--------|-------------|---------------------|
| `react-native-keychain` (tokens) | Parcial/limitado | El store ya degrada a AsyncStorage (README); en Windows se **fuerza la ruta AsyncStorage** o se valida con un smoke-test al boot (no bloquear login) |
| `react-native-device-info` (`getUniqueId`) | Limitado (devuelve valores genéricos en escritorio) | Ya hay fallback: `device.ts` persiste un ID propio en AsyncStorage (RF-AU-004). En Windows tomar esa ruta directo |
| `react-native-udp` | No (Android) | Ya resuelto: `dgram` de Node en Windows (§2) |
| QR emparejamiento (cámara, RF-DS-003) | Sin cámara RNW lista | En Windows el discovery queda: **IP guardada → UDP → manual**. QR/webcam = futuro (módulo nativo o `react-native-webview` + lector JS) |
| Báscula USB/serial (RF-BA) | No soportado nativo | Futuro: módulo Win32 (`serialport`/native) o caja de texto manual para peso. No bloquea v1 |
| `@react-native-community/blur` | No | No usar; el glass degrada con translucidez (ya es el estado actual) |
| Impresión (RF-IM-002) | — | Sin cambio: la impresión es **delegada** (`POST /print-jobs` + polling, servidor) |
| `react-native-qrcode-svg` | Sí (SVG puro) | Sin cambios si se agrega en el recibo |

---

## 9. Configuración nativa Windows (`windows/`)

### 9.1 Identidad y capacidades (`Package.appxmanifest`)

- **Capabilities:** añadir `privateNetworkClientServer` (UDP broadcast
  `POS_DISCOVER` y HTTP local a `pos-server`) además de `internetClient`.
  Mantener `runFullTrust`.
- **Identity/DisplayName:** pasar a **"Sistema POS"** (o nombre final del
  producto) en `Properties/DisplayName` y `uap:VisualElements/DisplayName`;
  `Publisher` y `PublisherDisplayName` según certificado real del cliente.
- **TargetDeviceFamily:** `Windows.Desktop MinVersion=10.0.17763.0` ya está;
  revisar `MaxVersionTested` con el SDK instalado (22621+).

### 9.2 Iconos y ventana

- Sustituir los PNG por defecto en `PosMobile.Package/Images/` por los
  íconos de marca (Square150x150, Square44x44, Wide310x150, Splash,
  StoreLogo) usando la paleta indigo del spec.
- `native/window.ts` (RNW `TitleBar`): título de ventana, tamaño mínimo
  1024×640, maximizable, y tema de la barra (claro/oscuro acorde a `useColorScheme`).

### 9.3 `app.json`

- Mantener `name: PosMobile` (identidad de registro). El nombre visible en
  Windows lo da el manifest, no `displayName`.

---

## 10. Build, run y publish

### 10.1 Requisitos (PC Windows)

- Visual Studio 2026 con carga "Desarrollo para escritorio con C++"; Windows
  SDK 10.0.22621+; Node 20 (`.nvmrc`); PowerShell 5.1/7.

### 10.2 Orden de trabajo (dev)

```powershell
# Terminal 1 — Metro
cd pos-mobile
nvm use
npm start

# Terminal 2 — compilar + instalar + lanzar
nvm use
npm run windows        # npx @react-native-community/cli run-windows
```

Regenerar nativo solo si se toca la solución: `node scripts/generate-windows.js`.

### 10.3 Publicación

| Opción | Cuándo | Nota |
|--------|--------|------|
| **Unpacked/`win32-x64`** (exe autocontenido) | Terminal interna/instalación local | Más simple, sin Store; despliegue por carpeta o instalador |
| **MSIX** (AppX con firma) | Distribución formal / MS Store | Requiere certificado + ajuste de manifest §9.1 |

> Decisión abierta: evaluar `react-native-windows` "Bundle desde Metro vs
> release" (Metro para dev, `--release` para los terminales).

---

## 11. Hoja de ruta (fases)

- [ ] **A — Config nativa**: manifest (capacidades `privateNetworkClientServer`,
      DisplayName), iconos de marca, `native/window.ts` (título, tamaño mín).
      *Criterio de salida:* la app compila y abre con identidad correcta.
- [ ] **B — Shell responsivo**: `src/layout/*` (AppShell, breakpoints,
      `useIsDesktop`, `useWindowBreakpoint`), `SideNavRail`, TopAppBar sin
      inset en Windows. *Salida:* rail + pestañas funcionando, window resize ok.
- [ ] **C — Interacción**: `DesktopDialog`, `ShortcutsContext` (atajos §6.3),
      hover/focus en botones, grid reactivo en Caja, filas densas en Inventario.
      *Salida:* flujo vender 100% con ratón y con teclado (RNF-005).
- [ ] **D — Carrito desktop**: extraer `CartContent.tsx`, `CartPanel` (wide),
      diálogo en medium, FAB/sheet solo en narrow. *Salida:* venta completa
      sin tocar el sheet móvil.
- [ ] **E — Huecos nativos**: forzar ruta AsyncStorage de keychain en Windows,
      device-id propio (device.ts), revisar QR webcam (futuro). *Salida:*
      login + licencia (RF-AU-003) estables en Windows.
- [ ] **F — QA y publish**: verificar estados (empty/loading/error) en
      breakpoints, contraste AA, atajos sin colisión con Metro, build release
      y paquete unpacked/MSIX.

**Prerequisito transversal:** regresión Android — cada fase debe mantener
`npm test` + `npm run lint` + `tsc --noEmit` y la app tablet intacta (la
capa desktop es aditiva, `Platform.OS` gate).

---

## 12. Riesgos y decisiones abiertas

| Tema | Riesgo | Decisión |
|------|--------|----------|
| Blur glass en Windows | No hay blur nativo | Aceptar translucidez `rgba` actual; documentado en spec §2.4 (sin cambio) |
| Keychain en Windows | Soporte parcial | Forzar fallback AsyncStorage; tokens cifrados es mejora futura |
| QR por cámara en Windows | Sin módulo listo | Discovery Windows = IP/UDP/manual (RF-DS-004); QR webcam = fase futura |
| Báscula USB | Sin módulo | Peso manual en diálogo como v1; serialport/módulo Win32 como mejora |
| BottomNav vs Rail | Cambio de paradigma UX | Mantener ambos (breakpoint); decisión final con el cliente |
| Ventana mínima | Terminals con 1366×768 | Mínimo 1024×640 garantiza layout OK en 1366×768 |
| "Reportes" oculto por permisos | Ya resuelto en Dashboard | El rail respeta `visibleTabs` igual que BottomNavBar |

---

## 13. Resumen ejecutivo

1. **Código compartido:** toda la lógica (auth, discovery UDP con `dgram`,
   carrito en memoria, venta, recibo) ya es cross-platform — no se reescribe.
2. **Se crea** una capa de escritorio en `src/layout/` (shell responsivo,
   rail lateral, panel de carrito, diálogos, atajos) **gatillada por
   `Platform.OS === 'windows'`**, sin regresión en Android.
3. **Se configura** el proyecto nativo `windows/`: capacidades de red local,
   identidad/display name, iconos de marca y título/tamaño de ventana.
4. **Se resuelven** los huecos de módulos nativos con los fallbacks que el
   código ya tiene (AsyncStorage para tokens/device-id, `dgram` para UDP).
5. **Entregable:** 6 fases incrementales (§11), cada una con criterio de
   salida y regresión Android verificada.