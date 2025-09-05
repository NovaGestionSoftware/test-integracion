import type { StateCreator } from "zustand";

export interface AmountSlice {
  amount: string;
  parsedAmount: number;

  setAmount: (value: string) => void;
}

export const amountInitialState: Pick<AmountSlice, "amount" | "parsedAmount"> = {
  amount: "",
  parsedAmount: NaN,
};

export const createAmountSlice: StateCreator<AmountSlice> = (set) => ({
  ...amountInitialState,

  setAmount: (value) => {
    // normalizamos coma a punto
    const n = Number(String(value).replace(",", "."));
    const parsed = Number.isFinite(n) ? n : NaN;

    set({
      amount: value,
      parsedAmount: parsed,
    });
  },
});
