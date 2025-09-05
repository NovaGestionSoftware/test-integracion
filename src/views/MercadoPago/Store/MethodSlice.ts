import type { StateCreator } from "zustand";

export type PaymentMethod = "QR" | "POINT";

export interface MethodSlice {
  method: PaymentMethod | "";
  setMethod: (method: PaymentMethod | "") => void;
}

export const methodInitialState: Pick<MethodSlice, "method"> = {
  method: "",
};

export const createMethodSlice: StateCreator<MethodSlice> = (set, _get, _store) => ({
  ...methodInitialState,
  setMethod: (method) => set({ method }),
});
