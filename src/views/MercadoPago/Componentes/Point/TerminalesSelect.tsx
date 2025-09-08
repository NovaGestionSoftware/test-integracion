import { useEffect, useMemo, useState } from "react";
import { useMercadoPagoStore } from "../../Store/MercadoPagoStore";
import RefreshButton from "../../../Componentes/RefreshButton";

const API_BASE = `${import.meta.env.VITE_BASE_URL_PHP}/`; // termina en "/"

type TerminalLite = {
  id: string;
  external_pos_id: string;
  operating_mode: string; // "STANDALONE" | "PDV" | otros
  store_id?: string;
  pos_id?: string;
};

type ApiTerminal = {
  id?: string;
  external_pos_id?: string;
  operating_mode?: string;
  store_id?: string | number;
  pos_id?: string | number;
};

type ApiResponseTerminales = {
  status: "success" | "error";
  data?: {
    terminals?: ApiTerminal[];
  };
  code?: number;
  message?: string;
};

type Props = {
  selectedId?: string | null;
  defaultSelectedId?: string | null;
  onSelect?: (t: TerminalLite) => void;
  refreshKey?: number | string;
  hideChangeModeButton?: boolean;
  className?: string;
};

export default function TerminalesSelect({
  selectedId,
  defaultSelectedId = null,
  onSelect,
  refreshKey,
  hideChangeModeButton = false,
}: Props) {
  const [terminales, setTerminales] = useState<TerminalLite[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    terminalId,
    setTerminalId,
    shouldPrint,
    setShouldPrint,
  } = useMercadoPagoStore();

  const isControlled = typeof selectedId !== "undefined";

  // currentSelectedId: si es controlado usa prop; si no, usa la store
  const currentSelectedId = isControlled ? selectedId ?? null : terminalId ?? null;

  const urlGet = `${API_BASE}mercadopago/obtenerTerminales.php`;
  const urlPostCambiarModo = `${API_BASE}mercadopago/cambiarModoTerminal.php`;

  function normalize(resp: ApiResponseTerminales): TerminalLite[] {
    if (resp?.status !== "success") return [];
    const arr = resp?.data?.terminals ?? [];
    if (!Array.isArray(arr)) return [];
    return arr.map((r) => ({
      id: String(r.id ?? ""),
      external_pos_id: String(r.external_pos_id ?? ""),
      operating_mode: String(r.operating_mode ?? ""),
      store_id: r.store_id != null ? String(r.store_id) : undefined,
      pos_id: r.pos_id != null ? String(r.pos_id) : undefined,
    }));
  }

  const fetchTerminales = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(urlGet, { method: "GET" });
      if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
      const data: ApiResponseTerminales = await res.json();
      if (data.status !== "success") {
        throw new Error(
          data?.code
            ? `API code ${data.code}`
            : "Respuesta no exitosa del servidor"
        );
      }
      if (!Array.isArray(data?.data?.terminals)) {
        throw new Error("Estructura inesperada: 'data.terminals' no es un array");
      }

      const rows = normalize(data);
      setTerminales(rows);

      // Si la selección actual no existe más, reseteamos (solo en modo no controlado)
      if (!isControlled && currentSelectedId && !rows.find((t) => t.id === currentSelectedId)) {
        setTerminalId(null);
      }
    } catch (e: any) {
      console.error("Error al obtener terminales:", e);
      setErrorMsg(e?.message || "Error al obtener terminales");
      setTerminales([]); // estado consistente
    } finally {
      setLoading(false);
    }
  };

  // Init: carga terminales
  useEffect(() => {
    if (terminales === null) fetchTerminales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Init: si no es controlado y hay defaultSelectedId, setearlo en la store si aún no hay selección
  useEffect(() => {
    if (!isControlled && defaultSelectedId && terminalId == null) {
      setTerminalId(defaultSelectedId);
    }
  }, [isControlled, defaultSelectedId, terminalId, setTerminalId]);

  // Refetch por refreshKey
  useEffect(() => {
    if (refreshKey !== undefined) {
      fetchTerminales();
    }
  }, [refreshKey]);

  const handleRetry = () => fetchTerminales();

  const handleSelect = (t: TerminalLite) => {
    // Siempre sincronizamos la store
    setTerminalId(t.id);
    onSelect?.(t);
  };

  const cambiarModo = async (t: TerminalLite) => {
    setActionLoadingId(t.id);
    setErrorMsg(null);
    try {
      const res = await fetch(urlPostCambiarModo, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idTerminal: t.id }),
      });
      if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

      setTerminales((prev) =>
        (prev ?? []).map((x) =>
          x.id === t.id ? { ...x, operating_mode: "PDV" } : x
        )
      );
    } catch (e: any) {
      console.error("Error al cambiar modo de terminal:", e);
      setErrorMsg(e?.message || "No se pudo cambiar el modo de la terminal");
    } finally {
      setActionLoadingId(null);
    }
  };

  const contentScrollClass = "min-h-[12rem] max-h-60 overflow-auto";

  const body = useMemo(() => {
    if (loading) {
      return (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-600">Consultando terminales…</p>
          <div className={`${contentScrollClass}`} />
        </div>
      );
    }

    if (errorMsg) {
      return (
        <div className="space-y-3">
          <p className="text-sm text-red-600">{errorMsg}</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-3 py-1 text-blue-600 border border-blue-500 rounded-md text-sm hover:bg-blue-50 transition"
          >
            Reintentar
          </button>
        </div>
      );
    }

    if (!terminales || terminales.length === 0) {
      return (
        <div className="space-y-3">
          <p className="text-yellow-700 text-sm">No se encontraron terminales.</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-3 py-1 text-blue-600 border border-blue-500 rounded-md text-sm hover:bg-blue-50 transition"
          >
            Reintentar
          </button>
        </div>
      );
    }

    return (
      <div className={`space-y-2 p-1 rounded-sm border noneScroll ${contentScrollClass}`}>
        {terminales.map((t) => {
          const isSelected = currentSelectedId === t.id;
          const isStandalone = (t.operating_mode || "").toUpperCase() === "STANDALONE";
          const isRowLoading = actionLoadingId === t.id;

          return (
            <label
              key={t.id}
              className="flex flex-col text-sm text-gray-800 border p-2 rounded hover:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="terminal"
                    value={t.id}
                    checked={isSelected}
                    onChange={() => handleSelect(t)}
                    className="form-radio text-blue-600"
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {t.external_pos_id || "(sin external_pos_id)"}
                    </span>
                    <span className="text-xs text-gray-500">ID: {t.id}</span>
                  </div>
                </div>

                {/* Pill de estado */}
                <span
                  className={`ml-3 inline-flex items-center rounded-md px-2 py-0.5 text-xs border ${
                    isStandalone
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                  title="operating_mode"
                >
                  {t.operating_mode || "—"}
                </span>
              </div>

              {/* Acción cambiar modo si está en STANDALONE */}
              {isStandalone && !hideChangeModeButton && (
                <div className="mt-2">
                  <button
                    onClick={() => cambiarModo(t)}
                    disabled={isRowLoading}
                    className="inline-flex items-center gap-2 rounded-md bg-blue-600 text-white px-3 py-1.5 text-xs font-medium 
                               shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRowLoading ? "Cambiando…" : "Cambiar modo a PDV"}
                  </button>
                </div>
              )}
            </label>
          );
        })}
      </div>
    );
  }, [terminales, currentSelectedId, loading, errorMsg, actionLoadingId, hideChangeModeButton]);

  return (
    <div className={""}>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Terminales (Point)</h2>
          <p className="text-sm text-zinc-500">Seleccioná una terminal para operar</p>
        </div>
        <RefreshButton handleRefresh={handleRetry} />
    
      </div>

      {body}

      {/* Imprimir ticket: Sí / No */}
      <div className="mt-4">
        <p className="text-sm font-medium">Imprimir ticket</p>
        <div className="mt-1 flex items-center gap-6">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="printTicket"
              value="no"
              checked={!shouldPrint}
              onChange={() => setShouldPrint(false)}
              className="form-radio text-zinc-700"
            />
            No
          </label>

          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="printTicket"
              value="si"
              checked={shouldPrint}
              onChange={() => setShouldPrint(true)}
              className="form-radio text-zinc-700"
            />
            Sí
          </label>
        </div>
      </div>
    </div>
  );
}
