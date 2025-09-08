import type { StateCreator } from "zustand";

export interface Orden {
  id: string;
  type: "qr" | "point";
  external_reference: string;
  description: string;
  total_amount: number;
  created_at: string;
}

export interface OrdenesSlice {
  ordenes: Orden[];
  ultimaOrdenCreada: Orden | null;
  setOrdenes: (ordenes: Orden[]) => void;
  setUltimaOrdenCreada: (orden: Orden) => void;
}
export const ordenesInitialState = {
  ordenes: [],
  ultimaOrdenCreada: null,
};

export const createOrdenesSlice: StateCreator<OrdenesSlice, [], [], OrdenesSlice> = (set) => ({
...ordenesInitialState,
  setOrdenes: (ordenes) => set({ ordenes }),
  setUltimaOrdenCreada: (orden) => set({ ultimaOrdenCreada: orden }),
});
