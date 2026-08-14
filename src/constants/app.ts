/**
 * constants/app.ts — Constantes globales de la aplicación POS.
 *
 * ────────────────────────────────────────────────────────────────────────
 * Qué contiene este módulo:
 *   Puertos, protocolos, timeouts y claves de almacenamiento según el
 *   PRD. Centralizar aquí evita valores mágicos en el código.
 *
 * Secciones:
 *   1) Puertos y protocolos de red
 *   2) Timeouts y reintentos
 *   3) Parámetros de búsqueda y polling
 *   4) Claves de AsyncStorage
 *   5) Deep links
 */

/* ── 1) PUERTOS Y PROTOCOLOS DE RED ─────────────────────────────────── */

/** Puerto HTTP del servidor Fastify local */
export const API_PORT = 3000;

/** Puerto UDP para discovery del servidor (RF-DS-001) */
export const UDP_DISCOVERY_PORT = 5000;

/** Mensaje de descubrimiento UDP (RF-DS-001) */
export const UDP_DISCOVERY_MESSAGE = 'POS_DISCOVER';

/* ── 2) TIMEOUTS Y REINTENTOS ───────────────────────────────────────── */

/**
 * Timeout HTTP por petición (ms).
 * 15s: la primera consulta de /products en SQLite tarda ~6s (joins a
 * categorías/unidades); con 5s se abortaba antes de recibir la respuesta.
 */
export const HTTP_TIMEOUT_MS = 15000;

/** Reintento de conexión cuando el servidor está caído (ms) — RNF-002 */
export const SERVER_RETRY_MS = 5000;

/** Días de gracia offline para licencia (RF-AU-003) */
export const LICENSE_GRACE_DAYS = 3;

/* ── 3) PARÁMETROS DE BÚSQUEDA Y POLLING ────────────────────────────── */

/** Cantidad de fallos consecutivos antes de reactivar UDP broadcast (RF-DS-002) */
export const FAILED_CONNECTIONS_TO_REACTIVATE_UDP = 3;

/** Debounce de búsqueda de productos por nombre (RF-CA-006) */
export const SEARCH_DEBOUNCE_MS = 300;

/** Límite de resultados de búsqueda de productos (RF-CA-006) */
export const SEARCH_LIMIT = 20;

/** Polling de impresión delegada (RF-IM-002) */
export const PRINT_POLLING_MS = 2000;

/** Heartbeat de báscula delegada (RF-BA-002) */
export const SCALE_HEARTBEAT_MS = 500;

/** TTL de la encuesta QoS post-venta (RF-QS-001) */
export const QOS_EXPIRY_MS = 5 * 60 * 1000;

/* ── 4) CLAVES DE ASYNCSTORAGE ──────────────────────────────────────── */

/** Clave de AsyncStorage para la IP guardada del servidor */
export const STORAGE_SERVER_IP = 'pos.server_ip';

/** Clave de AsyncStorage para el puerto guardado del servidor */
export const STORAGE_SERVER_PORT = 'pos.server_port';

/** Clave de AsyncStorage para el último vencimiento de licencia conocido */
export const STORAGE_LICENSE_EXPIRY = 'pos.license_expiry';

/* ── 5) DEEP LINKS ──────────────────────────────────────────────────── */

/** Esquema de deep link para emparejamiento QR (RF-DS-003) */
export const QR_SCHEME = 'pos://connect';
