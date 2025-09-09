import type { StateCreator } from "zustand";

// ——— Config ———
const MAX_HISTORY_PER_ENDPOINT = 20 as const;

// ——— Domain ———
export type EndpointKey =
  | "createOrder"               // POST Crear Orden
  | "getOrder"                  // POST Obtener Orden
  | "cancelOrder"               // POST Cancelar Orden (QR)
  | "pointChangeOperatingMode"  // POST POINT: Cambiar Modo Operación STANDALONE
  | "queryPayment";             // POST Consulta Pago

export type ApiStatus = "success" | "error";

export interface ApiRequestInfo {
  url?: string;
  method?: string; // "POST" | "GET" | ...
  headers?: Record<string, string>;
  query?: unknown; // params serializados si corresponde
  body?: unknown;  // payload enviado
}

export interface ApiEntry {
  id: string;                 // uuid/nanoid para tracking de cada request
  endpoint: EndpointKey;
  timestamp: number;          // Date.now()
  status: ApiStatus;
  httpStatus?: number;
  durationMs?: number;

  request?: ApiRequestInfo;

  // Solo uno de los dos debería venir:
  response?: unknown;
  errorMessage?: string;

  // Metadatos útiles para depurar
  meta?: {
    idempotencyKey?: string;
    paramsHash?: string; // hash de body/query si lo usás para correlación
    note?: string;       // comentarios libres
  };
}

export type InspectorRecords = Partial<Record<EndpointKey, ApiEntry[]>>;

export interface InspectorSlice {
  // UI
  activeEndpoint: EndpointKey;
  setActiveEndpoint: (key: EndpointKey) => void;

  // Data
  records: InspectorRecords;

  // Actions (logging)
  pushSuccess: (
    endpoint: EndpointKey,
    entry: Omit<ApiEntry, "endpoint" | "status" | "timestamp"> & {
      httpStatus?: number;
      durationMs?: number;
      request?: ApiRequestInfo;
      response?: unknown;
      meta?: ApiEntry["meta"];
    }
  ) => void;

  pushError: (
    endpoint: EndpointKey,
    entry: Omit<ApiEntry, "endpoint" | "status" | "timestamp"> & {
      httpStatus?: number;
      durationMs?: number;
      request?: ApiRequestInfo;
      errorMessage?: string;
      meta?: ApiEntry["meta"];
    }
  ) => void;

  // Helpers
  getLast: (endpoint: EndpointKey) => ApiEntry | undefined;
  clearEndpoint: (endpoint: EndpointKey) => void;
  clearAllInspector: () => void;
}

// ——— Initial State ———
export const inspectorInitialState: Pick<
  InspectorSlice,
  "activeEndpoint" | "records"
> = {
  activeEndpoint: "createOrder",
  records: {
    createOrder: [],
    getOrder: [],
    cancelOrder: [],
    pointChangeOperatingMode: [],
    queryPayment: [], // ⬅️ nuevo
  },
};

// ——— Slice ———
export const createInspectorSlice: StateCreator<InspectorSlice> = (set, get) => ({
  ...inspectorInitialState,

  setActiveEndpoint: (key) => set({ activeEndpoint: key }),

  pushSuccess: (endpoint, entry) => {
    const now = Date.now();
    const newItem: ApiEntry = {
      ...entry,
      endpoint,
      status: "success",
      timestamp: now,
    };

    set((state) => {
      const prev = state.records[endpoint] ?? [];
      const next = [newItem, ...prev].slice(0, MAX_HISTORY_PER_ENDPOINT);
      return { records: { ...state.records, [endpoint]: next } };
    });
  },

  pushError: (endpoint, entry) => {
    const now = Date.now();
    const newItem: ApiEntry = {
      ...entry,
      endpoint,
      status: "error",
      timestamp: now,
    };

    set((state) => {
      const prev = state.records[endpoint] ?? [];
      const next = [newItem, ...prev].slice(0, MAX_HISTORY_PER_ENDPOINT);
      return { records: { ...state.records, [endpoint]: next } };
    });
  },

  getLast: (endpoint) => {
    const list = get().records[endpoint];
    return list?.[0];
  },

  clearEndpoint: (endpoint) =>
    set((state) => ({
      records: { ...state.records, [endpoint]: [] },
    })),

  clearAllInspector: () => set(() => ({ ...inspectorInitialState })),
});
