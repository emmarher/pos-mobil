# Diseño UI/UX — POS Mobile v4 (Glassmorphism)

> Documento de diseño del frontend `pos-mobile/`. Fuente de verdad visual para la
> implementación de pantallas React Native. El comportamiento y el vocabulario de
> dominio siguen el `PRD_POS_v4_completo.md` y las convenciones del repo
> (terminología en español: folio, cortes de caja, báscula, mayoreo, vuelto).
> Versión: 1.0 — 2026-08-12.

---

## 1. Visión y principios

POS es un punto de venta moderno para retail con estética **Glassmorphism**: superficies
translúcidas con desenfoque que transforman una herramienta financiera densa en una
interfaz clara, vibrante y agradable de usar en pantalla táctil.

**Principios rectores:**

1. **El dinero manda.** Montos, totales y métricas clave usan pesos heavy/bold y
   tipografía grande. El ojo llega primero al número.
2. **Tres toques para vender** (RNF-005). El flujo de cobro se resuelve en máximo 3
   toques: escanear/buscar → agregar → confirmar. Nada intermedia.
3. **Legibilidad a distancia.** Tableta 10" en mostrador: contraste alto, botones
   grandes (≥48px), jerarquía visual explícita.
4. **El ticket es el artefacto.** La venta culmina en un recibo que emula el papel
   térmico; es el momento de mayor foco visual de la sesión.
5. **Glassmorphism con propósito.** El cristal define capas y profundidad; nunca
   sacrifica legibilidad. El texto siempre vive sobre superficies con suficiente
   contraste.

---

## 2. Sistema de diseño

### 2.1 Paleta de color

La paleta base del producto (indigo / esmeralda / ámbar) se expande en escalas
utilizables con roles semánticos. Los neutros se tiñen ligeramente hacia el indigo
para que las superficies se sientan parte de la marca.

**Escala primaria — Indigo (`#4648D4`)**

| Token | Valor | Uso |
|-------|-------|-----|
| `indigo-100` | `#ECECFB` | Tintes de selección, fondo de chips activos |
| `indigo-200` | `#D5D6F6` | Borde de elementos activos |
| `indigo-500` | `#6E70E0` | Hover de acciones primarias |
| `indigo-600` | `#4648D4` | **Primary** — botones, elementos seleccionados, acentos del ticket |
| `indigo-700` | `#3839A9` | Estado presionado (pressed) |
| `indigo-800` | `#2A2B7D` | Texto de marca sobre fondo claro |

**Escala secundaria — Esmeralda (`#006C49`)**

| Token | Valor | Uso |
|-------|-------|-----|
| `emerald-100` | `#E0F4EC` | Fondo de chips de estado "En stock" |
| `emerald-500` | `#00995F` | Iconos de éxito / hover |
| `emerald-600` | `#006C49` | **Secondary** — estados de éxito, stock disponible |
| `emerald-700` | `#005239` | Texto "En stock" sobre fondo claro |

**Terciario — Ámbar (warning)**

| Token | Valor | Uso |
|-------|-------|-----|
| `amber-100` | `#FEF3C7` | Fondo de chips "Stock bajo" |
| `amber-500` | `#F59E0B` | Indicadores de alerta (barras, dot) |
| `amber-600` | `#D97706` | Iconos de advertencia |
| `amber-700` | `#B45309` | Texto "Stock bajo" sobre fondo claro |

**Semánticos de estado**

| Rol | Valor | Uso |
|-----|-------|-----|
| `success` | `#006C49` | Operaciones exitosas, stock disponible |
| `warning` | `#D97706` | Alertas, stock bajo |
| `error` | `#C62828` | Errores, "Agotado", saldo negativo |
| `info` | `#4648D4` | Mensajes informativos |

**Neutros (teñidos de indigo)**

| Token | Valor | Uso |
|-------|-------|-----|
| `background` | `#F8F9FF` | Fondo base de pantallas |
| `surface` | `rgba(255,255,255,0.60)` | Superficies glass (sobre blobs de color) |
| `text-primary` | `#171832` | Texto principal |
| `text-secondary` | `#5A5D7A` | SKUs, etiquetas, textos informativos |
| `text-disabled` | `#A5A7C0` | Deshabilitado |
| `border` | `rgba(70,72,212,0.12)` | Bordes estándar |
| `border-glass` | `rgba(255,255,255,0.65)` | Borde brillante de superficies glass |

> **Nota de contraste (Grey Test):** `indigo-600` y `emerald-600` tienen luminancia
> casi idéntica; en escala de grises se confunden. Regla de uso: **el color nunca
> lleva el significado solo**. Los estados (En stock / Stock bajo / Agotado) siempre
> combinan color + etiqueta de texto + (cuando aplique) icono.

### 2.2 Tipografía

**Familia:** Mona Sans (variable, pesos 400–900). Fallback: Hanken Grotesk →
`system-ui` sans-serif. Se cargan como assets de React Native (archivos `.ttf`).

**Escala tipográfica** (diseñada para tableta 10" a distancia de mostrador):

| Token | Tamaño | Peso | Uso |
|-------|--------|------|-----|
| `display` | 40 | 800/900 | Montos TOTALES, métricas hero |
| `title-xl` | 28 | 700 | Títulos de pantalla |
| `title` | 20 | 700 | Títulos de sección, tarjetas |
| `body` | 16 | 400/500 | Texto general, precios de catálogo |
| `label` | 13 | 500/600 | SKUs, etiquetas, metadatos del ticket |
| `micro` | 11 | 500 | Timestamps, notas de pie |

**Reglas de uso:**

- Montos y métricas clave: `display`, peso 800/900, siempre en `indigo-600` cuando
  son el dato protagonista (TOTAL del ticket).
- Etiquetas, SKUs y texto informativo: peso 400/500, `text-secondary`.
- Interlineado: cuerpo 1.4, párrafos informativos 1.5, micro 1.3.
- El texto claro sobre indigo (botones) usa peso 600 y un toque de letter-spacing
  (compensa el grosor óptico).

### 2.3 Espaciado y rejilla

- **Base de 4px**, ritmo 1-4-9: micro (4), componentes/cards (16), secciones (36).
- Márgenes laterales de pantalla: **16px**; contenido de ticket: **24px**.
- **Catálogo de productos:** cuadrícula de **2 columnas** (portrait), gap 12px.
- **Lista de inventario:** filas de altura fija 64px, divididas con separadores sutiles.
- Touch targets mínimos: **48×48px** (cómodo en tablet táctil, RNF-005).

### 2.4 Superficies glass (receta)

Toda superficie glass se construye con la misma receta:

```ts
// GlassSurface
{
  backgroundColor: 'rgba(255,255,255,0.55)',   // translúcido
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.65)',       // borde claro brillante
  // + blur de fondo (backdrop-filter) → react-native-blur
  borderRadius: 20,
  // + sombra suave difusa:
  shadowColor: 'rgba(23,24,50,0.12)',
  shadowRadius: 24,
  shadowOffset: { width: 0, height: 8 },
}
```

**Modelo de 3 planos:**

- **Plano fondo (z: 0):** `#F8F9FF` + formas orgánicas de color (blobs difuminados en
  indigo/esmeralda/ámbar al 8–12% de opacidad). El blur del glass las atraviesa.
- **Plano contenido (z: 1):** tarjetas glass, listas, inputs.
- **Plano atención (z: 2):** modales, bottom sheets, FAB del carrito. Siempre con
  blur más fuerte (30px) y sombra elevada.

### 2.5 Radios, sombras e iconos

| Elemento | Radio |
|----------|-------|
| Botones | 14 (primario grande: 16) |
| Chips | 999 (píldora) |
| Tarjetas / glass | 20 |
| Inputs | 14 |
| Bottom sheet / modal | 24 (esquinas superiores) |
| Ticket | 16 (con borde zig-zag inferior, ver 3.8) |

**Sombras:** difusas, con tinte indigo. Cards `0 8px 24px rgba(23,24,50,0.10)`; FAB y
modales `0 16px 40px rgba(23,24,50,0.18)`.

**Iconos:** set lineal consistente, 24px, grosor de trazo 1.75
(recomendado: MaterialCommunityIcons o Lucide). Iconos universales (check, cámara,
campana) sin espejar; los direccionales (back, chevron) se invierten en RTL.

---

## 3. Componentes base

### 3.1 TopAppBar

- Altura 64px + `safe-area-inset-top`.
- Fondo: glass (`rgba(255,255,255,0.55)` + blur 20px), borde inferior sutil.
- Contenido: [avatar/logo 40px] · título centrado-izquierda · acciones a la derecha
  (notificación con badge de alerta).
- Avatar: círculo 40px con iniciales ("UP"), fondo indigo, texto blanco.

### 3.2 BottomNavBar

- Altura 64px + `safe-area-inset-bottom`, glass con blur, borde superior sutil.
- 3 secciones fijas: **Caja**, **Inventario**, **Reportes** (ícono + etiqueta 12px).
- Estado activo: ícono y etiqueta en `indigo-600`, pastilla de fondo `indigo-100`.

### 3.3 Botones

| Variante | Fondo | Texto | Uso |
|----------|-------|-------|-----|
| `primary` | `indigo-600` | blanco 600 | Acción principal (Autenticar, Confirmar venta, Imprimir ticket) |
| `secondary` | `surface` glass | `text-primary` | Acciones alternas (Compartir ticket) |
| `ghost` | transparente | `indigo-600` | Links y acciones terciarias ("¿Necesitas ayuda?") |
| `danger` | `error` | blanco | Destructivo (Cancelar venta) |

- Alto mínimo 52px, radio 14; primario con flecha opcional ("Autenticar →").
- Estados: idle, hover (indigo-500), pressed (indigo-700), disabled (opacidad 0.4),
  loading (spinner blanco), focused (anillo 2px offset).

### 3.4 Chips de filtro (categorías)

- Píldora de 32px de alto, `surface` glass, texto `label`.
- Activo: fondo `indigo-600`, texto blanco; inactivo: texto `text-secondary`.
- Scroll horizontal; mínimo 2 visibles con indicador de desbordamiento.

### 3.5 Campo de búsqueda

- Input 48px, glass, icono lupa a la izquierda, placeholder como **ejemplo** de
  formato ("Buscar productos…"), etiqueta visible arriba si aplica.
- Debounce 300ms (RNF-001); estado "buscando" con spinner sutil.
- El placeholder nunca sustituye a la etiqueta.

### 3.6 Tarjeta de producto (catálogo)

- Glass card, imagen de producto 96px arriba (16:9 o 1:1), nombre (`body` 600),
  precio (`title` 700, indigo-600).
- Chips opcionales: "Mayoreo", "Báscula" (para productos MASS/CAJ).
- Estado agotado: imagen en escala de grises + overlay "Agotado".

### 3.7 FAB (carrito / agregar)

- Círculo 64px, `indigo-600`, sombra elevada, z-plano atención.
- Badge numérico: círculo 22px ámbar con contador de ítems, anclado arriba-derecha.
- Icono: carrito (Caja) o `+` (Inventario).

### 3.8 StatusChip (estado de stock)

| Estado | Fondo | Texto | Icono |
|--------|-------|-------|-------|
| En stock | `emerald-100` | `emerald-700` | check |
| Stock bajo | `amber-100` | `amber-700` | alerta |
| Agotado | `error` al 10% | `error` | `×` |

Chip píldora, texto `micro`/`label` 600. Siempre texto + color (Grey Test).

### 3.9 KPI card (métricas rápidas)

- Glass card con label (`label`, secundario), valor (`display` 32–40, 800), y
  tendencia (flecha + % en emerald/error).
- Variante de alerta: valor en `error` y borde ámbar/rojo (ej. "Agotados").

### 3.10 Ticket / recibo digital

Contenedor que emula el ticket físico sobre fondo traslúcido:

- **Encabezado:** logo/ícono de tienda, nombre del negocio (`title` 800),
  dirección y teléfono (`micro`, secundario).
- **Metadatos:** Fecha, Hora, Folio (ID de ticket), Cajero — pares label/valor,
  `label`, separados por línea punteada.
- **Ítems:** nombre (`body` 600) + línea "cantidad × precio unitario" (`label`,
  secundario) + total por ítem (`body` 600, alineado a la derecha).
- **Totales:** Subtotal, Impuestos (IVA 16%), **TOTAL** (`display` 28–32, 900,
  `indigo-600`), sobre línea punteada superior.
- **Pago:** método de pago + código de autorización (`label`).
- **QR:** 96px (devoluciones / detalle en línea) con folio codificado.
- **Borde inferior zig-zag:** `clip-path` de sierra (repite un triángulo de 8px)
  para simular el rasgado del papel; el fondo del ticket es blanco al 95% con sombra.

---

## 4. Pantallas y flujos

### 4.1 Autenticación (Login) — patrón *Decide*

**Objetivo:** acceso enfocado, sin distracciones. Una sola acción dominante.

```
┌──────────────────────────────┐
│   (blob indigo suave)        │
│                              │
│        ◯ logo 72px           │
│     "Sistema POS" (title)    │
│   "Punto de venta v4" (label)│
│                              │
│   ┌────────────────────────┐ │
│   │ ID de operador         │ │  ← glass input
│   └────────────────────────┘ │
│   ┌────────────────────────┐ │
│   │ PIN (secure, numpad)   │ │
│   └────────────────────────┘ │
│                              │
│   ┌────────────────────────┐ │
│   │  Autenticar →  (52px)  │ │  ← primary, full width
│   └────────────────────────┘ │
│   "¿Necesitas ayuda?" (ghost)│
│                              │
└──────────────────────────────┘
```

- **Contenido:** ID de operador (código de tenant) + PIN (4–6 dígitos, teclado
  numérico). Sin bottom nav (flujo previo al login).
- **Estados:** error de credenciales (mensaje + borde `error` en el input PIN),
  licencia vencida → navega a LicenseBlockScreen (bloqueo total, CA-004), límite
  de dispositivos → alerta con copy del servidor.
- **Accesibilidad:** autofocus en ID de operador; botón 52px para dedo/toque grueso.

### 4.2 Terminal de Ventas (Caja) — patrón *Operate/Explore*

**Objetivo:** cobrar rápido. Búsqueda global, catálogo visual y carrito siempre
accesible.

```
┌──────────────────────────────┐
│ [UP]  POS Terminal     🔔    │  ← TopAppBar glass
├──────────────────────────────┤
│ 🔍 Buscar productos…         │  ← búsqueda global (debounce 300ms)
├──────────────────────────────┤
│ (Todos) (Comida) (Bebidas)…  │  ← chips de categoría, scroll horizontal
├──────────────────────────────┤
│ ┌─────────┐  ┌─────────┐     │
│ │  img    │  │  img    │     │  ← grid 2 columnas
│ │ Coca…   │  │ Sabri…  │     │
│ │ $18.50  │  │ $9.00   │     │
│ └─────────┘  └─────────┘     │
│ ┌─────────┐  ┌─────────┐     │
│ │  img    │  │  img    │     │
│ │ Leche…  │  │ Huevo…  │     │
│ │ $28.00  │  │ $78.00  │     │
│ └─────────┘  └─────────┘     │
│                              │
│              (🛒 3)          │  ← FAB carrito con badge
├──────────────────────────────┤
│  [Caja]  [Inventario] [Reportes] │  ← BottomNavBar
└──────────────────────────────┘
```

- **TopAppBar:** avatar "UP", título "POS Terminal", notificación (alertas de stock).
- **Catálogo:** tap en producto → hoja inferior (bottom sheet) con cantidad, tipo de
  precio (Público/Mayoreo), y para MASS: lectura de báscula o peso manual; para CAJ:
  peso por caja (alternate_quantity).
- **FAB carrito:** badge numérico con conteo de ítems; al abrir → bottom sheet del
  carrito (items, cliente opcional, métodos de pago, confirmar).
- **Ventas a crédito:** selector de cliente con límite disponible visible.
- **Estados:** catálogo vacío (empty state con "Agrega tu primer producto"), sin
  servidor (banner + reintento 5s, RNF-002), stock insuficiente (error 422 del
  backend mostrado en el sheet).

### 4.3 Gestión de Inventario — patrón *Monitor/Compare*

**Objetivo:** monitorear stock y ubicar problemas de un vistazo.

```
┌──────────────────────────────┐
│ [UP]  Inventario        🔔   │
├──────────────────────────────┤
│ 🔍 Buscar productos, SKUs… [⚙] │  ← búsqueda + filtro avanzado
├──────────────────────────────┤
│ ┌────────────┐ ┌────────────┐│
│ │ Total Items│ │ Agotados   ││  ← KPI cards
│ │  1,248 ▲4% │ │  14 ⚠      ││
│ └────────────┘ └────────────┘│
│ ┌────────────┐ ┌────────────┐│
│ │ Categorías │ │            ││
│ │  24 activas│ │            ││
│ └────────────┘ └────────────┘│
├──────────────────────────────┤
│ Product Catalog    [⇅] [▦]   │  ← controles vista grid/lista
│ ─────────────────────────────│
│ [img] Coca-Cola 600ml  [En stock]  │
│       SKU-0001  Stock: 120         │
│ ─────────────────────────────│
│ [img] Sabritas 45g     [Stock bajo]│
│       SKU-0002  Stock: 5           │
│ ─────────────────────────────│
│ [img] Galaxy S24       [Agotado]   │
│       SKU-0101  Stock: 0           │
├──────────────────────────────┤
│                     (＋ FAB)  │  ← agregar producto
├──────────────────────────────┤
│  [Caja]  [Inventario] [Reportes] │
└──────────────────────────────┘
```

- **KPIs:** Total Items (1,248, tendencia ▲4%), Agotados (14, rojo/ámbar, con alerta),
  Categorías (24 activas).
- **Fila de lista:** imagen 48px, nombre, SKU (`label`), stock actual, StatusChip.
- **Vista grid/lista** conmutable (persistida en memoria de sesión).
- **FAB `+`:** alta de producto → bottom sheet con formulario (nombre, categoría,
  unidad, precio, stock inicial).
- **Filtro avanzado:** sheet con categoría, rango de stock, estado (en stock/bajo/
  agotado), ubicación.

### 4.4 Corte de Caja (Fin de turno) — patrón *Compare/Decide*

**Objetivo:** conciliar lo esperado vs. lo real en segundos.

```
┌──────────────────────────────┐
│ [UP]  Corte de caja     🔔   │
├──────────────────────────────┤
│  Resumen de ventas           │
│ ┌──────────────────────────┐ │
│ │ Hoy            vs. ayer  │ │
│ │ $12,480.00      $11,205  │ │  ← comparativo de periodos
│ │ ▓▓▓▓▓▓▓░░  +11.4%        │ │  ← barra comparativa
│ └──────────────────────────┘ │
│  Flujo de caja               │
│ ┌──────────────────────────┐ │
│ │ Esperado    $5,230.00     │ │
│ │ Contado     $5,240.00     │ │
│ │ Diferencia  +$10.00  ✔   │ │  ← faltante/sobrante
│ └──────────────────────────┘ │
│  Desglose por método         │
│ ┌──────────────────────────┐ │
│ │ 💵 Efectivo    $4,980.00  │ │
│ │ 💳 Tarjeta    $7,500.00   │ │
│ └──────────────────────────┘ │
│  [Reimprimir corte] [Cerrar turno] │  ← primary al final
└──────────────────────────────┘
```

- **Comparativo:** KPI con valor actual vs. periodo anterior y delta (+/-) con color.
- **Reconciliación:** Esperado vs. Contado con Diferencia resaltada (sobrante
  emerald, faltante error).
- **Desglose:** por método de pago (Efectivo/Tarjeta/Transferencia/Crédito), filas
  con icono + monto `title` 700.
- **Cierre:** "Cerrar turno" primario (permiso `cashier:cut_own`); "Reimprimir
  corte" secundario. El corte diario (admin) usa la misma pantalla con permiso
  `cashier:cut_all` y desglose por vendedor.

### 4.5 Recibo Digital (Vista de ticket) — artefacto

**Objetivo:** el recibo fiel al papel, listo para compartir o imprimir.

```
┌──────────────────────────────┐
│ ☰   Luxe Retail Co.     🔔   │  ← TopAppBar (menú, logo, alerta)
├──────────────────────────────┤
│      (fondo traslúcido)      │
│  ┌────────────────────────┐  │
│  │   Luxe Retail Co.      │  │  ← "papel" blanco 95%
│  │   Av. Reforma 123      │  │
│  │   Tel. 555-1234        │  │
│  │ ────────────────────── │  │
│  │ Fecha   12/08/2026     │  │
│  │ Hora    14:32:05       │  │
│  │ Folio   V-000123       │  │
│  │ Cajero  Ana G.         │  │
│  │ ────────────────────── │  │
│  │ Coca-Cola 600ml   $18.50│  │
│  │   2 × $18.50    $37.00 │  │
│  │ Sabritas 45g      $9.00│  │
│  │   1 × $9.00      $9.00 │  │
│  │ ────────────────────── │  │
│  │ Subtotal          $46.00│  │
│  │ IVA (16%)          $7.36│  │
│  │ ━━━━━━━━━━━━━━━━━━━━━━ │  │
│  │ TOTAL          $53.36  │  │  ← display 900 indigo
│  │ ────────────────────── │  │
│  │ Efectivo              │  │
│  │ Autorización 123456    │  │
│  │   [▦▦▦ QR 96px ▦▦▦]   │  │  ← QR del folio
│  │ ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼  │  │  ← borde zig-zag
│  └────────────────────────┘  │
│  [Compartir]  [Imprimir ticket] │  ← secundario + primario
└──────────────────────────────┘
```

- **Ticket:** fondo blanco al 95% + sombra suave sobre el fondo traslúcido; borde
  inferior en sierra (zig-zag 8px) simulando rasgado.
- **TOTAL:** `display`, peso 900, `indigo-600`, único elemento en color protagonista
  del ticket.
- **QR:** folio (ID de ticket) para devoluciones o consulta en línea.
- **Acciones:** "Compartir" (secundario, comparte imagen/PDF) y "Imprimir ticket"
  (primario → encola `POST /print-jobs`, RF-IM-002).
- **Estados:** impresión en cola (confirmación + opción reimprimir), impresión
  fallida (reintento hasta 3, luego fallback "imprimir luego").

---

## 5. Estados y microinteracciones

**Los 9 estados por componente** (idle, hover, active, focused, loading, empty,
error, disabled, overflow) se diseñan en paralelo — un componente que solo tiene
estado idle es un boceto.

**Entrada de elementos (3 beats):** aparece con scale 0.95/opacidad 0 → 150ms
scale 1.02/opacidad 0.8 → 250ms settle scale 1. Aplicar a modales, sheets y FAB.

**Cascade:** `delay = index × 20ms` al revelar grillas/listas; el ojo percibe
uniformidad exacta como "robótico".

**Movimiento:** animar solo `transform` y `opacity`; curvas decelerantes
(cubic-bezier expo/quint out). Salidas al 70% de la duración de entrada.

**Reduced motion:** no es opcional — preferencia del sistema → transiciones de 100ms
o instantáneas. Ajuste manual en ajustes: Sin movimiento / Reducido / Estándar /
Mejorado.

**Feedback táctil:** vibración sutil en confirmación de venta y error (Haptics).

---

## 6. Accesibilidad

- **Contraste:** texto ≥ 4.5:1 (AA); UI y estados ≥ 3:1. Texto blanco sobre
  `indigo-600` = 6.6:1 ✔; sobre `emerald-600` = 6.4:1 ✔.
- **Nunca color solo:** los estados llevan etiqueta + icono (Grey Test / daltónicos).
  Simular deuteranopía/protanopía/tritanopía en la revisión.
- **Touch targets ≥ 48×48px**; el área visual puede ser menor, el área de golpe
  siempre mayor.
- **Focus rings:** 2–3px, offset, contraste 3:1; visibles en navegación por teclado
  (Windows).
- **Inputs ≥ 16px** de fuente (evita zoom automático en iOS).
- **Safe areas:** respetar `safe-area-inset-top/bottom` (notch Android, barra RNW).
- **Dark mode:** segundo tema autorizado, no una inversión. Superficies oscuras
  tintadas de indigo, acentos con croma ligeramente reducido (ver `theme.ts`).

---

## 7. Especificaciones técnicas (React Native)

| Especificación | Valor |
|----------------|-------|
| Orientación | **Portrait** (fija) |
| Resolución mínima | 1280×800 @ 213dpi (RNF-006) |
| Navegación global | TopAppBar (títulos/acciones/perfil) + BottomNavBar (Caja, Inventario, Reportes) |
| Blur de fondo | `@react-native-community/blur` (equivalente a `backdrop-filter`) |
| Formas orgánicas | `react-native-linear-gradient` + blur en capa de fondo (z: 0) |
| Fuentes | Mona Sans `.ttf` (400–900) + fallback Hanken Grotesk; registro en app |
| Tokens | `src/constants/theme.ts` + `src/constants/design-tokens.ts` (paleta, radios, sombras, escalas) |
| Iconos | MaterialCommunityIcons (línea, 24px) |
| QR | `react-native-qrcode-svg` (ticket, emparejamiento RF-DS-003) |
| Estados de red | reintento 5s servidor (RNF-002); polling impresión 2s; heartbeat báscula 500ms |
| Carrito | solo memoria (Zustand), nunca persistido (RF-VE-001) |

**Decisiones registradas:**

- UI copy final en **español** (convención del repo). Mapeo de los labels de
  referencia: `Authenticate →` = "Autenticar →", `Search products…` = "Buscar
  productos…", `POS Terminal` = "Terminal de ventas" (título) / "Caja" (nav),
  `Need help logging in?` = "¿Necesitas ayuda para iniciar sesión?".
- El avatar "UP" del encabezado es un placeholder de iniciales del cajero.
- Paleta de tercer nivel (ámbar) no especificada por el cliente: se adopta la escala
  amber estándar (500/600/700) anclada a `#D97706` como base warning.

---

## 8. Checklist de implementación

- [ ] Tokens en `constants/design-tokens.ts` (colores, tipografía, radios, sombras, blur)
- [ ] Componentes glass base (Card, Button, Chip, Input, StatusChip, KPI, FAB, Top/BottomNav)
- [ ] Blobs orgánicos de fondo + blur (z: 0 / z: 1 / z: 2)
- [ ] Pantallas: Login → Terminal (Caja) → Inventario → Corte de caja → Recibo
- [ ] Estados 9 por componente crítico (botones, chips, inputs)
- [ ] Empty/loading/error states en catálogo, inventario y ticket
- [ ] Dark mode autorizado + reduced motion
- [ ] Verificación contraste AA + simulación daltónicos
- [ ] QA en 1280×800 (emulador POS_Tablet) y 360×800 (teléfono)
