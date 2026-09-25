/**
 * navigation/types.ts — Tipos de rutas del stack raíz (compartido entre
 * el navigator nativo (Android/iOS) y el navigator JS (Windows)).
 */
import type {CartItem, SaleResponse} from '../models';

export type RootStackParamList = {
  Connection: undefined;
  Login: undefined;
  Dashboard: undefined;
  LicenseBlock: undefined;
  /** Recibo digital tras confirmar la venta (datos reales del POST /sales) */
  Receipt: {
    sale: SaleResponse;
    items: CartItem[];
    paymentMethod: string;
  };
};