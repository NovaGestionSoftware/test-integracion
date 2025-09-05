import type { StateCreator } from "zustand";
import type { SucursalLite } from "../Componentes/Sucursales/SucursalesFetcher";

export interface Sucursal {
  id: string;
  name: string;
  external_id: string;
  location: {
    address_line: string;
    latitude: number;
    longitude: number;
    reference: string;
  };
}

export interface SucursalesSlice {
  sucursales: SucursalLite[] | null;
  ultimaSucursalCreada: SucursalLite | null;
  sucursalSeleccionada: SucursalLite | null;
  isLoadingSucursales: boolean;
  setSucursales: (sucursales: SucursalLite[]) => void;
  setUltimaSucursalCreada: (sucursal: SucursalLite) => void;
  setSucursalSeleccionada: (sucursal: SucursalLite) => void;
  setLoadingSucursales: (loading: boolean) => void;
}

export const sucursalesInitialState = {
  sucursales: null,
  ultimaSucursalCreada: null,
  sucursalSeleccionada: null,
  isLoadingSucursales: false,
};

export const createSucursalesSlice: StateCreator<SucursalesSlice, [], [], SucursalesSlice> = (set) => ({
  ...sucursalesInitialState,

  setSucursales: (sucursales) => set({ sucursales, isLoadingSucursales: false }),
  setUltimaSucursalCreada: (sucursal) => set({ ultimaSucursalCreada: sucursal }),
  setSucursalSeleccionada: (sucursal) => set({ sucursalSeleccionada: sucursal }),
  setLoadingSucursales: (loading) => set({ isLoadingSucursales: loading }),
});
