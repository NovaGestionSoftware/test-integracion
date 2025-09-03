import { useCallback, useMemo, useRef, useState } from "react";
import {
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiFileText,
  FiSend,
} from "react-icons/fi";

const API_BASE = `${import.meta.env.VITE_BASE_URL_PHP}/afip`;
const EMPRESA = "000004";
const MODO = "homo";
const SERVICIO = "wsfe";

const FE_CUIT = "20928558852";
const FE_PTO_VTA = "34";
const FE_CBTE_TIPO = "6";

type ApiSuccess<T = unknown> = {
  status: "success";
  data: T;
  code: number;
  message: string;
};

type ApiError = {
  status: "error" | "fail";
  code?: number;
  message?: string;
  data?: unknown;
};

type AccesoItem = {
  status: "expired" | "valid";
  token: string | null;
  sign: string | null;
  expira: string | null;
};

type AccesoResponse = ApiSuccess<AccesoItem[]> | ApiError;

function buildI(params: Record<string, string>) {
  return encodeURIComponent(JSON.stringify(params));
}

async function callApi<T>(
  path: string,
  iParams: Record<string, string>
): Promise<T> {
  const url = `${API_BASE}/${path}?_i=${buildI(iParams)}`;
  const res = await fetch(url, { method: "GET" });
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const url = `${API_BASE}/${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}

const obtieneAcceso = () =>
  callApi<AccesoResponse>("obtieneAcceso.php", { _e: EMPRESA, _m: MODO });
const generaTRA = () =>
  callApi<ApiSuccess | ApiError>("generaTRA.php", {
    _e: EMPRESA,
    _m: MODO,
    _s: SERVICIO,
  });
const firmarTRA = () =>
  callApi<ApiSuccess | ApiError>("firmarTRA.php", { _e: EMPRESA, _m: MODO });
const loginCMS = () =>
  callApi<ApiSuccess | ApiError>("loginCMS.php", { _e: EMPRESA, _m: MODO });
const FECompUltimoAutorizado = () =>
  callApi<ApiSuccess | ApiError>("FECompUltimoAutorizado.php", {
    _e: EMPRESA,
    _m: MODO,
    _c: FE_CUIT,
    _pv: FE_PTO_VTA,
    _ct: FE_CBTE_TIPO,
  });
const solicitarCAE = (token: string, sign: string, comprobante: number) =>
  postJson<ApiSuccess | ApiError>("testCAE.php", { token, sign, comprobante });

type TokenState = "idle" | "checking" | "expired" | "valid" | "error";

type LogEntry = { ts: string; msg: string };

export default function FacturaElectronicaView() {
  const [tokenState, setTokenState] = useState<TokenState>("idle");
  const [checking, setChecking] = useState(false);
  const [loadingCAE, setLoadingCAE] = useState(false);

  const [tokenVal, setTokenVal] = useState<string | null>(null);
  const [signVal, setSignVal] = useState<string | null>(null);

  const [ultimoResult, setUltimoResult] = useState<unknown>(null);
  const [ultimoComprobante, setUltimoComprobante] = useState<number | null>(
    null
  );
  const nextComprobante =
    ultimoComprobante != null ? ultimoComprobante + 1 : null;

  const [caeResult, setCaeResult] = useState<unknown>(null);

  const logsRef = useRef<HTMLDivElement | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((msg: string) => {
    setLogs((prev) => [...prev, { ts: new Date().toLocaleString(), msg }]);
    requestAnimationFrame(() => {
      logsRef.current?.scrollTo({ top: 10_000, behavior: "smooth" });
    });
  }, []);

  const statusPill = useMemo(() => {
    const base =
      "px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1";
    switch (tokenState) {
      case "valid":
        return (
          <span className={`${base} bg-green-100 text-green-700`}>
            <FiCheckCircle /> Válido
          </span>
        );
      case "expired":
        return (
          <span className={`${base} bg-yellow-100 text-yellow-700`}>
            <FiXCircle /> Expirado
          </span>
        );
      case "checking":
        return (
          <span className={`${base} bg-blue-100 text-blue-700`}>
            <FiRefreshCw className="animate-spin" /> Procesando…
          </span>
        );
      case "error":
        return (
          <span className={`${base} bg-rose-100 text-rose-700`}>
            <FiXCircle /> Error
          </span>
        );
      default:
        return <span className={`${base} bg-gray-100 text-gray-700`}>—</span>;
    }
  }, [tokenState]);

  const extractUltimo = (res: any): number | null => {
    try {
      const toNumber = (v: any): number | null => {
        if (typeof v === "number" && Number.isFinite(v)) return v;
        if (typeof v === "string") {
          const n = parseInt(v, 10);
          if (!Number.isNaN(n)) return n;
        }
        return null;
      };
      const visit = (node: any, depth = 0): number | null => {
        if (node == null || depth > 5) return null;
        const direct = toNumber(node);
        if (direct != null) return direct;
        if (Array.isArray(node)) {
          for (const it of node) {
            const n = visit(it, depth + 1);
            if (n != null) return n;
          }
          return null;
        }
        if (typeof node === "object") {
          const pref = [
            "CbteNro",
            "cbteNro",
            "ultimo",
            "comprobante",
            "nro",
            "numero",
          ];
          for (const k of pref) {
            if (k in node) {
              const n = toNumber((node as any)[k]);
              if (n != null) return n;
            }
          }
          for (const k of Object.keys(node)) {
            const v = (node as any)[k];
            const n = visit(v, depth + 1);
            if (n != null) return n;
          }
        }
        return null;
      };
      const payload = (res as any)?.data ?? res;
      return visit(payload);
    } catch {
      return null;
    }
  };

  const handleObtenerUltimoFlow = useCallback(async () => {
    setChecking(true);
    setTokenState("checking");
    setCaeResult(null);
    addLog("→ Consultando obtieneAcceso…");
    try {
      const r1 = await obtieneAcceso();
      const proceedWith = async (acc: AccesoItem) => {
        setTokenState(acc.status === "valid" ? "valid" : "expired");
        setTokenVal(acc.token ?? null);
        setSignVal(acc.sign ?? null);
        if (acc.status !== "valid") {
          addLog("Token expirado. Generando TRA…");
          await generaTRA();
          addLog("Firmando TRA…");
          await firmarTRA();
          addLog("Login CMS (guarda token/sign)…");
          await loginCMS();
          addLog("Re-consultando obtieneAcceso…");
          const r2 = await obtieneAcceso();
          if (
            typeof r2 === "object" &&
            r2 &&
            "status" in r2 &&
            r2.status === "success"
          ) {
            const acc2 = (r2.data as AccesoItem[])[0];
            setTokenState(acc2.status === "valid" ? "valid" : "expired");
            setTokenVal(acc2.token ?? null);
            setSignVal(acc2.sign ?? null);
          } else {
            throw new Error("No se pudo validar token tras loginCMS");
          }
        }
        addLog("→ Consultando FECompUltimoAutorizado…");
        const ult = await FECompUltimoAutorizado();
        setUltimoResult(ult);
        if (typeof ult === "object" && ult && "status" in ult) {
          addLog(`FECompUltimoAutorizado → ${JSON.stringify(ult)}`);
        } else {
          addLog("FECompUltimoAutorizado devolvió texto plano (ver consola)");
          console.warn("FECompUltimoAutorizado (raw)", ult);
        }
        const n = extractUltimo(ult);
        setUltimoComprobante(n);
      };
      if (typeof r1 !== "object" || !("status" in r1)) {
        addLog(
          "⚠ Respuesta no-JSON en obtieneAcceso. Mostrando crudo en consola."
        );
        console.warn("obtieneAcceso (raw)", r1);
        setTokenState("error");
      } else if (r1.status === "success") {
        const acc = (r1.data as AccesoItem[])[0];
        addLog(`obtieneAcceso → status: ${acc.status}`);
        await proceedWith(acc);
      } else {
        addLog(`✖ Error en obtieneAcceso: ${JSON.stringify(r1)}`);
        setTokenState("error");
      }
    } catch (err) {
      console.error(err);
      addLog(`✖ Excepción: ${(err as Error).message}`);
      setTokenState("error");
    } finally {
      setChecking(false);
    }
  }, [addLog]);

  const handleSolicitarCAE = useCallback(async () => {
    if (!tokenVal || !signVal || nextComprobante == null) return;
    setLoadingCAE(true);
    addLog(`→ Solicitando CAE para comprobante ${nextComprobante}…`);
    try {
      const res = await solicitarCAE(tokenVal, signVal, nextComprobante);
      setCaeResult(res);
      if (typeof res === "object" && res && "status" in res) {
        addLog(`Solicitar CAE → ${JSON.stringify(res)}`);
      } else {
        addLog("Solicitar CAE devolvió texto plano (ver consola)");
        console.warn("Solicitar CAE (raw)", res);
      }
    } catch (err) {
      console.error(err);
      addLog(`✖ Excepción en Solicitar CAE: ${(err as Error).message}`);
    } finally {
      setLoadingCAE(false);
    }
  }, [addLog, nextComprobante, signVal, tokenVal]);

  const handleClearData = () => {
    setUltimoResult(null);
    setUltimoComprobante(null);
    setCaeResult(null);
    addLog("Limpieza de datos de comprobantes y CAE");
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-semibold mb-4 flex items-center justify-start">
        Integración – Factura electrónica
        <button
          onClick={handleClearData}
          className="ml-4 inline-flex items-center gap-1 rounded-lg border border-zinc-300 
          px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50 hover:cursor-pointer"
          title="Limpiar datos"
        >
          <FiRefreshCw /> Limpiar
        </button>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
            <div className="p-4 md:p-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium">Estado de credenciales</h2>
              </div>
              {statusPill}
            </div>

            <div className="px-4 md:px-5 pb-4 md:pb-5 space-y-3">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleObtenerUltimoFlow}
                  disabled={checking}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-medium 
    shadow-sm hover:bg-blue-700 hover:cursor-pointer focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiFileText />{" "}
                  {checking
                    ? "Procesando…"
                    : "Obtener último comprobante autorizado"}
                </button>

                <button
                  onClick={handleSolicitarCAE}
                  disabled={
                    loadingCAE ||
                    !tokenVal ||
                    !signVal ||
                    nextComprobante == null
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-green-600 text-white px-4 py-2 text-sm font-medium 
    shadow-sm hover:bg-green-700 hover:cursor-pointer focus:ring-2 focus:ring-green-500 focus:ring-offset-1 disabled:opacity-50 disabled:text-gray-800 disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                  <FiSend />{" "}
                  {loadingCAE
                    ? "Solicitando…"
                    : `Solicitar CAE${
                        nextComprobante ? ` (Cbte ${nextComprobante})` : ""
                      }`}
                </button>
              </div>

              {nextComprobante != null && (
                <div className="text-xs text-zinc-500">
                  Próximo comprobante sugerido para CAE:{" "}
                  <span className="font-mono font-medium text-zinc-700">
                    {nextComprobante}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
            <div className="p-4 md:p-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium">
                  Último comprobante autorizado
                </h2>
                <p className="text-sm text-zinc-500">
                  CUIT {FE_CUIT} · PV {FE_PTO_VTA} · Tipo {FE_CBTE_TIPO}
                </p>
              </div>
            </div>
            <div className="px-4 md:px-5 pb-5">
              <pre className="text-xs bg-zinc-50 rounded-xl p-3 overflow-auto max-h-72">
                {ultimoResult ? JSON.stringify(ultimoResult, null, 2) : "—"}
              </pre>
            </div>
          </div>

          <div className="mt-4 bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
            <div className="p-4 md:p-5 flex items-center justify-between">
              <h2 className="text-lg font-medium">Respuesta Solicitar CAE</h2>
            </div>
            <div className="px-4 md:px-5 pb-5">
              <pre className="text-xs bg-zinc-50 rounded-xl p-3 overflow-auto max-h-72">
                {caeResult ? JSON.stringify(caeResult, null, 2) : "—"}
              </pre>
            </div>
          </div>
        </div>

        {/* <div className="bg-white h-full rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="p-4 md:p-5 flex items-center justify-between">
            <h2 className="text-lg font-medium">Logs del proceso</h2>
            <button
              onClick={() => setLogs([])}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs hover:bg-zinc-50 hover:cursor-pointer"
              title="Limpiar logs"
            >
              <FiRefreshCw /> Limpiar
            </button>
          </div>
          <div
            ref={logsRef}
            className="px-4 md:px-5 pb-5 max-h-[760px] overflow-auto"
          >
            {logs.length === 0 ? (
              <p className="text-sm text-zinc-500">Sin eventos aún.</p>
            ) : (
              <ul className="space-y-1 text-xs">
                {logs.map((l, i) => (
                  <li key={i} className="font-mono">
                    <span className="text-zinc-500">[{l.ts}]</span> {l.msg}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div> */}
      </div>
    </div>
  );
}
