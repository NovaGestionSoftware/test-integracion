import type { StateCreator } from "zustand";

/** === Tipos mínimos para la orden === */
export type QrMode = "static" | "dynamic" | "hybrid";

/** Resumen de lo que esperamos guardar de una orden */
export interface MpOrder {
  id: string;
  status?: string;
  // Agregá campos que te devuelva la API si querés mostrarlos
  // p.ej. qr_image, payer, ticket_url, etc.
  [k: string]: any;
}

export interface OrdersSlice {
  // Preferencias/inputs antes de crear la orden
  qrMode: QrMode;            // aplica si method === 'qr'
  terminalId: string | null; // aplica si method === 'point'
  shouldPrint: boolean;      // aplica si method === 'point'

  // Tracking de la orden actual
  currentOrderId: string | null;
  currentOrder: MpOrder | null;

  // Setters sincrónicos
  setQrMode: (mode: QrMode) => void;
  setTerminalId: (id: string | null) => void;
  setShouldPrint: (val: boolean) => void;

  setCurrentOrderId: (id: string | null) => void;
  setCurrentOrder: (order: MpOrder | null) => void;

  resetOrder: () => void;
}

/** Estado inicial */
export const ordersInitialState: Pick<
  OrdersSlice,
  "qrMode" | "terminalId" | "shouldPrint" | "currentOrderId" | "currentOrder"
> = {
  qrMode: "dynamic",
  terminalId: null,
  shouldPrint: false,
  currentOrderId: null,
  currentOrder: null,
};

/** Factory del slice */
export const createOrdersSlice: StateCreator<OrdersSlice> = (set) => ({
  ...ordersInitialState,

  setQrMode: (mode) => set({ qrMode: mode }),
  setTerminalId: (id) => set({ terminalId: id }),
  setShouldPrint: (val) => set({ shouldPrint: val }),

  setCurrentOrderId: (id) => set({ currentOrderId: id }),
  setCurrentOrder: (order) => set({ currentOrder: order }),

  resetOrder: () => set({ currentOrderId: null, currentOrder: null }),
});
