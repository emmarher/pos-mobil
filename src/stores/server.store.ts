/**
 * server.store.ts — Estado del servidor descubierto (RF-DS).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Qué hace este store:
 *   Guarda el servidor activo (IP + puerto) y su estado de conexión.
 *   También cuenta los fallos consecutivos para reactivar el UDP
 *   broadcast (RF-DS-002).
 *
 * Orden de descubrimiento (implementado en src/api/discovery.ts):
 *   1) IP guardada en AsyncStorage
 *   2) UDP broadcast "POS_DISCOVER" puerto 5000
 *   3) QR pairing pos://connect?ip=X&port=Y&tenant=Z
 *   4) IP manual
 * ────────────────────────────────────────────────────────────────────────
 *
 * Contenido:
 *   1) Tipos (ServerInfo / ServerStatus)
 *   2) Contrato del store (ServerState)
 *   3) Implementación Zustand
 */
import {create} from 'zustand';

/* ──────────────────────────────────────────────────────────────────────
 * 1) TIPOS
 * ────────────────────────────────────────────────────────────────────── */
export interface ServerInfo {
  ip: string;
  port: number;
  tenantCode?: string | null;
  deviceName?: string | null;
  apiVersion?: string | null;
}

/** Estados visibles para la UI de conexión */
export type ServerStatus = 'idle' | 'connecting' | 'connected' | 'failed';

/* ──────────────────────────────────────────────────────────────────────
 * 2) CONTRATO DEL STORE
 * ────────────────────────────────────────────────────────────────────── */
export interface ServerState {
  /** Servidor activo (usado por client.ts para la base URL) */
  server: ServerInfo | null;
  status: ServerStatus;
  /** Fallos consecutivos de conexión (para reactivar UDP) */
  consecutiveFailures: number;
  lastError: string | null;

  setServer: (server: ServerInfo | null) => void;
  setStatus: (status: ServerStatus) => void;
  setLastError: (error: string | null) => void;
  /** Incrementa el contador de fallos (llamado por el discovery) */
  registerFailure: () => void;
  /** Resetea el contador tras una conexión exitosa */
  resetFailures: () => void;
}

/* ──────────────────────────────────────────────────────────────────────
 * 3) IMPLEMENTACIÓN ZUSTAND
 * ────────────────────────────────────────────────────────────────────── */
export const useServerStore = create<ServerState>(set => ({
  /* Estado inicial: sin servidor, sin errores */
  server: null,
  status: 'idle',
  consecutiveFailures: 0,
  lastError: null,

  /* ── Setters simples ────────────────────────────────────────────── */

  setServer: server => set({server}),
  setStatus: status => set({status}),
  setLastError: error => set({lastError: error}),

  /* ── Contador de fallos (RF-DS-002) ─────────────────────────────── */

  registerFailure: () =>
    set(state => ({consecutiveFailures: state.consecutiveFailures + 1})),

  resetFailures: () => set({consecutiveFailures: 0}),
}));
