import type { StateCreator } from "zustand";

export interface UiSlice {
  showPayForm: boolean;
  setShowPayForm: (show: boolean) => void;
}

export const uiInitialState = {
  showPayForm: false,
};

export const createUiSlice: StateCreator<UiSlice> = (set) => ({
  ...uiInitialState,
  setShowPayForm: (show: boolean) => set({ showPayForm: show }),
});
