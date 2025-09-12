import { useMemo, useState, useEffect } from "react";
import { FiInfo, FiCpu, FiLink2, FiAlertTriangle } from "react-icons/fi";

type Json = Record<string, unknown>;

function encodePayload(payload: object) {
  // URL-encode del JSON para que no dispare preflight ni problemas de parsing
  return encodeURIComponent(JSON.stringify(payload));
}

function buildUrl(hostInput: string, path: string, payload: object) {
  // hostInput puede ser dominio/IP o URL completa
  let base = hostInput.startsWith("http") ? hostInput.replace(/\/+$/, "") : `https://${hostInput}`;

  // Forzar https para evitar mixed content (si vino en http)
  if (base.startsWith("http://")) base = base.replace(/^http:/i, "https:");

  const qp = `_i=${encodePayload(payload)}&ngrok-skip-browser-warning=true&t=${Date.now()}`;
  return `${base}${path}?${qp}`;
}

function isValidIPv4OrHostOrUrl(value: string) {
  const ipv4 = /^(25[0-5]|2[0-4]\d|[01]?\d?\d)(\.(25[0-5]|2[0-4]\d|[01]?\d?\d)){3}$/;
  const hostname = /^(?=.{1,253}$)(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.(?!-)[A-Za-z0-9-]{1,63}(?<!-))*$/;
  try {
    const u = new URL(value);
    if (u.protocol === "http:" || u.protocol === "https:") return true;
  } catch {}
  return ipv4.test(value) || hostname.test(value);
}

async function fetchWithTimeout(url: string, ms = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "ngrok-skip-browser-warning": "true" }, // <- clave
    });
    const text = await res.text();
    try {
      return { ok: res.ok, status: res.status, data: JSON.parse(text) as Json };
    } catch {
      return { ok: res.ok, status: res.status, data: { raw: text } as Json };
    }
  } finally {
    clearTimeout(id);
  }
}

const PATH_WRAPPER = "/prueba/consultaWrapper.php";
const PAYLOAD_INFO = { _d: 1, _v: 0 };
const PAYLOAD_VERSION = { _d: 0, _v: 1 };

export default function ControladorFiscalView() {
  const [ip, setIp] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [loadingVer, setLoadingVer] = useState(false);
  const [infoResp, setInfoResp] = useState<Json | null>(null);
  const [verResp, setVerResp] = useState<Json | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("cf-url-base");
    if (saved) {
      setIp(saved);
      setIsSaved(true);
    }
  }, []);

  const ipValida = useMemo(() => isValidIPv4OrHostOrUrl(ip.trim()), [ip]);
  const puedeObtenerInfo = ipValida && !loadingInfo;
  const puedeObtenerVersion = !!infoResp && !loadingVer;
  const urlInfoPreview = useMemo(
    () => (ipValida ? buildUrl(ip.trim(), PATH_WRAPPER, PAYLOAD_INFO) : ""),
    [ip, ipValida]
  );
  const urlVersionPreview = useMemo(
    () => (ipValida ? buildUrl(ip.trim(), PATH_WRAPPER, PAYLOAD_VERSION) : ""),
    [ip, ipValida]
  );

  const handleGuardar = () => {
    if (ip.trim()) {
      localStorage.setItem("cf-url-base", ip.trim());
      setIsSaved(true);
    }
  };

  const handleEditar = () => {
    setIsSaved(false);
  };

  const handleObtenerInfo = async () => {
    if (!puedeObtenerInfo) return;
    setErrorMsg(null);
    setVerResp(null);
    setLoadingInfo(true);
    try {
      const url = buildUrl(ip.trim(), PATH_WRAPPER, PAYLOAD_INFO);
      const res = await fetchWithTimeout(url, 12000);
      if (!res.ok) {
        setErrorMsg(`Error ${res.status} al obtener información`);
        setInfoResp(null);
      } else {
        setInfoResp(res.data);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error desconocido al llamar al endpoint");
      setInfoResp(null);
    } finally {
      setLoadingInfo(false);
    }
  };

  const handleObtenerVersion = async () => {
    if (!puedeObtenerVersion) return;
    setErrorMsg(null);
    setLoadingVer(true);
    try {
      const url = buildUrl(ip.trim(), PATH_WRAPPER, PAYLOAD_VERSION);
      const res = await fetchWithTimeout(url, 12000);
      if (!res.ok) {
        setErrorMsg(`Error ${res.status} al obtener versión`);
        setVerResp(null);
      } else {
        setVerResp(res.data);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error desconocido al llamar a versión");
      setVerResp(null);
    } finally {
      setLoadingVer(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl font-semibold">Controlador Fiscal – Test Integrador</h1>

      <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4">
        <label className="text-sm font-medium">URL base o host público</label>
        <div className="flex gap-2 items-center">
          <input
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="Ej: https://mi-app.ngrok-free.app:4001 ó mi-dominio.com"
            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-300"
            disabled={isSaved}
          />
          {isSaved ? (
            <button
              type="button"
              className="mt-1 rounded-xl border border-zinc-300 px-3 py-2 text-sm bg-zinc-50 hover:bg-zinc-100"
              onClick={handleEditar}
            >
              Editar
            </button>
          ) : (
            <button
              type="button"
              className="mt-1 rounded-xl border border-sky-300 px-3 py-2 text-sm bg-sky-50 hover:bg-sky-100"
              onClick={handleGuardar}
              disabled={!ipValida}
            >
              Guardar
            </button>
          )}
        </div>
        {!ipValida && ip.length > 0 && (
          <p className="mt-1 text-xs text-red-600">
            Ingresá una URL http(s) válida o un hostname/IP válido.
          </p>
        )}

        {/* URL Previews */}
        <div className="mt-3 space-y-1 text-xs text-zinc-600">
          <div className="flex items-start gap-2">
            <FiLink2 className="mt-0.5 shrink-0" />
            <div className="overflow-hidden">
              <span className="font-medium">Info (previa):</span>{" "}
              {urlInfoPreview ? (
                <span className="break-all">{urlInfoPreview}</span>
              ) : (
                <span>—</span>
              )}
            </div>
          </div>
          <div className="flex items-start gap-2">
            <FiLink2 className="mt-0.5 shrink-0" />
            <div className="overflow-hidden">
              <span className="font-medium">Versión (previa):</span>{" "}
              {urlVersionPreview ? (
                <span className="break-all">{urlVersionPreview}</span>
              ) : (
                <span>—</span>
              )}
            </div>
          </div>
        </div>

        {/* Botonera */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={handleObtenerInfo}
            disabled={!puedeObtenerInfo}
            className="inline-flex items-center gap-2 rounded-2xl border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 disabled:opacity-50"
            title="Llama a /prueba/consultaWrapper.php con {_d:1,_v:0}"
          >
            <FiInfo />
            {loadingInfo ? "Obteniendo…" : "Obtener información"}
          </button>

          <button
            onClick={handleObtenerVersion}
            disabled={!puedeObtenerVersion}
            className="inline-flex items-center gap-2 rounded-2xl border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 disabled:opacity-50"
            title="Se habilita después de obtener información"
          >
            <FiCpu />
            {loadingVer ? "Consultando…" : "Obtener versión"}
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <FiAlertTriangle className="mt-0.5 shrink-0" />
            <div>{errorMsg}</div>
          </div>
        )}
      </div>

      {/* Resultados */}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <h2 className="text-sm font-semibold">Respuesta – Información</h2>
          <pre className="mt-2 max-h-72 overflow-auto rounded-xl bg-zinc-50 p-3 text-xs whitespace-pre-wrap">
            {infoResp?.raw ? String(infoResp.raw) : JSON.stringify(infoResp ?? {}, null, 2)}
          </pre>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <h2 className="text-sm font-semibold">Respuesta – Versión</h2>
          <pre className="mt-2 max-h-72 overflow-auto rounded-xl bg-zinc-50 p-3 text-xs whitespace-pre-wrap">
            {verResp?.raw ? String(verResp.raw) : JSON.stringify(verResp ?? {}, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
