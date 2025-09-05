// store.ts
import { create } from "zustand";
import {
  createSucursalesSlice,
  sucursalesInitialState,
  type SucursalesSlice,
} from "./SucursalSlice";
import {
  cajasInitialState,
  createCajasSlice,
  type CajasSlice,
} from "./CajasSlice";
import {
  createOrdenesSlice,
  ordenesInitialState,
  type OrdenesSlice,
} from "./OrdenesSlice";
import { createUiSlice, uiInitialState, type UiSlice } from "./UiSlice";

// ⬇️ NUEVO
import {
  createMethodSlice,
  methodInitialState,
  type MethodSlice,
} from "./MethodSlice";
import { amountInitialState, createAmountSlice, type AmountSlice } from "./AmountSlice";

type MercadoPagoStore = SucursalesSlice &
  CajasSlice &
  OrdenesSlice &
  UiSlice &
  MethodSlice &
  AmountSlice & {
    resetStore: () => void;
  };

const initialState = {
  ...sucursalesInitialState,
  ...cajasInitialState,
  ...ordenesInitialState,
  ...uiInitialState,
  ...methodInitialState,
  ...amountInitialState,
};

export const useMercadoPagoStore = create<MercadoPagoStore>()(
  (set, get, store) => ({
    ...createSucursalesSlice(set, get, store),
    ...createCajasSlice(set, get, store),
    ...createOrdenesSlice(set, get, store),
    ...createUiSlice(set, get, store),
    ...createMethodSlice(set, get, store),
       ...createAmountSlice(set, get, store),
    resetStore: () => set(initialState),
  })
);
