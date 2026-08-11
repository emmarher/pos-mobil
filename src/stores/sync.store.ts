/**
 * sync.store.ts — Estado de UI de sincronización (RF-SY).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Qué hace este store:
 *   SOLO refleja el progreso de sync para la interfaz (p. ej. el badge
 *   "Sincronizando…"). La lógica real de sync (PUSH/PULL/ACK) vive en el
 *   servidor; este store NO ejecuta sync por sí mismo.
 * ────────────────────────────────────────────────────────────────────────
 *
 * Contenido:
 *   1) Contrato del store (SyncState)
 *   2) Implementación Zustand
 */
import {create} from 'zustand';

/* ──────────────────────────────────────────────────────────────────────
 * 1) CONTRATO DEL STORE
 * ────────────────────────────────────────────────────────────────────── */
export interface SyncState {
  /** Última sincronización exitosa (timestamp) */
  lastSyncAt: number | null;
  /** Comandos pendientes por subir (source=LOCAL) */
  pendingCount: number;
  /** Si una sincronización está en curso */
  syncing: boolean;
  /** Último error de sync (para mostrar en UI) */
  lastError: string | null;
  /** Conectividad detectada */
  isOnline: boolean;

  setSyncing: (syncing: boolean) => void;
  setLastSync: (at: number) => void;
  setPendingCount: (count: number) => void;
  setLastError: (error: string | null) => void;
  setOnline: (online: boolean) => void;
  /** Limpia todo el estado (p. ej. al cambiar de servidor) */
  reset: () => void;
}

/* ──────────────────────────────────────────────────────────────────────
 * 2) IMPLEMENTACIÓN ZUSTAND
 * ────────────────────────────────────────────────────────────────────── */
export const useSyncStore = create<SyncState>(set => ({
  /* Estado inicial: nunca sincronizado */
  lastSyncAt: null,
  pendingCount: 0,
  syncing: false,
  lastError: null,
  isOnline: false,

  /* ── Setters simples (actualizan el estado visible en UI) ───────── */

  setSyncing: syncing => set({syncing}),
  setLastSync: at => set({lastSyncAt: at}),
  setPendingCount: count => set({pendingCount: count}),
  setLastError: error => set({lastError: error}),
  setOnline: online => set({isOnline: online}),

  /* ── Reset total ────────────────────────────────────────────────── */

  reset: () =>
    set({
      lastSyncAt: null,
      pendingCount: 0,
      syncing: false,
      lastError: null,
      isOnline: false,
    }),
}));
