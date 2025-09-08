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

import { createUiSlice, uiInitialState, type UiSlice } from "./UiSlice";

// ⬇️ NUEVO
import {
  createMethodSlice,
  methodInitialState,
  type MethodSlice,
} from "./MethodSlice";
import {
  amountInitialState,
  createAmountSlice,
  type AmountSlice,
} from "./AmountSlice";
import { createOrdersSlice, ordersInitialState, type OrdersSlice } from "./OrderSlice";

type MercadoPagoStore = SucursalesSlice &
  CajasSlice &
  UiSlice &
  MethodSlice &
  AmountSlice &
  OrdersSlice & {
    resetStore: () => void;
  };

const initialState = {
  ...sucursalesInitialState,
  ...cajasInitialState,
  ...ordersInitialState,
  ...uiInitialState,
  ...methodInitialState,
  ...amountInitialState,
  ...ordersInitialState,
};

export const useMercadoPagoStore = create<MercadoPagoStore>()(
  (set, get, store) => ({
    ...createSucursalesSlice(set, get, store),
    ...createCajasSlice(set, get, store),
    ...createUiSlice(set, get, store),
    ...createMethodSlice(set, get, store),
    ...createAmountSlice(set, get, store),
    ...createOrdersSlice(set, get, store),
    resetStore: () => set(initialState),
  })
);
