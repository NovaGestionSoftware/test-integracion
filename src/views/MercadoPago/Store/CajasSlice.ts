import type { StateCreator } from "zustand";
import type { CajaLite } from "../Componentes/Cajas/CajasFetcher";

export interface Caja {
  id: string;
  name: string;
  external_id: string;
  store_id: string; // este sería el `external_store_id`
}

export interface CajasSlice {
  cajas: CajaLite[] | null;
  isLoadingCajas: boolean;
  ultimaCajaCreada: CajaLite | null;
  cajaSeleccionada: CajaLite | null;
  setUltimaCajaCreada: (caja: CajaLite) => void;
  setCajaSeleccionada: (caja: CajaLite) => void;
  setCajas: (cajas: CajaLite[]) => void;
  setLoadingCajas: (loading: boolean) => void;
}

export const cajasInitialState = {
  cajas: null,
  isLoadingCajas: false,
  ultimaCajaCreada: null,
  cajaSeleccionada: null,
};

export const createCajasSlice: StateCreator<CajasSlice, [], [], CajasSlice> = (set) => ({
  ...cajasInitialState,
  setCajaSeleccionada: (caja) => set({ cajaSeleccionada: caja }),
  setCajas: (cajas) => set({ cajas, isLoadingCajas: false }),
  setLoadingCajas: (loading) => set({ isLoadingCajas: loading }),
  setUltimaCajaCreada: (caja) => set({ ultimaCajaCreada: caja }),
});
