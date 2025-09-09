import { useMemo, useState } from "react";
import { FiCheckCircle, FiXCircle, FiClock, FiTrash2, FiCopy, FiFilter, FiCornerDownRight } from "react-icons/fi";
import { useMercadoPagoStore } from "../../Store/MercadoPagoStore";
import type { ApiEntry, EndpointKey, InspectorSlice } from "../../Store/InspectorSlice";

// ---- Config etiqueta e icono por endpoint ----
const ENDPOINT_META: Record<EndpointKey, { label: string }> = {
  createOrder: { label: "POST Crear Orden" },
  getOrder: { label: "POST Obtener Orden" },
  cancelOrder: { label: "POST Cancelar Orden (QR)" },
  pointChangeOperatingMode: { label: "POST POINT Cambiar Modo" },
  queryPayment: { label: "POST Consulta Pago" },
};

// ---- Selector helper (evita rerenders) ----
const useInspector = <T,>(selector: (s: InspectorSlice) => T) =>useMercadoPagoStore((s) => selector(s as unknown as InspectorSlice));

// ---- UI principal ----
export default function InspectorPanel() {
  const activeEndpoint = useInspector((s) => s.activeEndpoint);
  const setActiveEndpoint = useInspector((s) => s.setActiveEndpoint);
  const records = useInspector((s) => s.records);
  const clearEndpoint = useInspector((s) => s.clearEndpoint);
  const clearAllInspector = useInspector((s) => s.clearAllInspector);

  // filtros de UI
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "error">("all");

  const tabs: { key: EndpointKey; label: string; count: number }[] = useMemo(
    () =>
      (Object.keys(ENDPOINT_META) as EndpointKey[]).map((key) => ({
        key,
        label: ENDPOINT_META[key].label,
        count: records[key]?.length ?? 0,
      })),
    [records]
  );

  const list = (records[activeEndpoint] ?? []).filter((r) =>
    statusFilter === "all" ? true : r.status === statusFilter
  );

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white da-rk:bg-zinc-900 da-rk:border-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 da-rk:border-zinc-800 px-3 py-2">
        <div className="text-sm font-medium">Inspector de Endpoints</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter((p) => (p === "all" ? "success" : p === "success" ? "error" : "all"))}
            className="inline-flex items-center gap-1 rounded-xl border border-zinc-300 da-rk:border-zinc-700 px-3 py-1 text-xs hover:bg-zinc-50 da-rk:hover:bg-zinc-800"
            title="Filtrar por estado"
          >
            <FiFilter /> {statusFilter === "all" ? "Todos" : statusFilter === "success" ? "Éxitos" : "Errores"}
          </button>
          <button
            onClick={() => clearAllInspector()}
            className="inline-flex items-center gap-1 rounded-xl border border-zinc-300 da-rk:border-zinc-700 px-3 py-1 text-xs hover:bg-red-50 da-rk:hover:bg-red-900/20 text-red-700 da-rk:text-red-400"
            title="Limpiar todo"
          >
            <FiTrash2 /> Limpiar todo
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 px-3 pt-3">
        {tabs.map((t) => {
          const isActive = t.key === activeEndpoint;
          return (
            <button
              key={t.key}
              onClick={() => setActiveEndpoint(t.key)}
              className={
                "inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs transition " +
                (isActive
                  ? "border-sky-500 bg-sky-50 da-rk:bg-sky-900/20 text-sky-700 da-rk:text-sky-300"
                  : "border-zinc-300 da-rk:border-zinc-700 hover:bg-zinc-50 da-rk:hover:bg-zinc-800")
              }
            >
              <span className="font-medium">{t.label}</span>
              <span className={
                "ml-1 inline-flex min-w-5 items-center justify-center rounded-lg px-1.5 text-[10px] " +
                (isActive ? "bg-sky-500 text-white" : "bg-zinc-200 da-rk:bg-zinc-700 text-zinc-800 da-rk:text-zinc-200")
              }>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab actions */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="text-xs text-zinc-500 da-rk:text-zinc-400">
          {ENDPOINT_META[activeEndpoint].label}
        </div>
        <button
          onClick={() => clearEndpoint(activeEndpoint)}
          className="inline-flex items-center gap-1 rounded-xl border border-zinc-300 da-rk:border-zinc-700 px-2.5 py-1 text-xs hover:bg-red-50 da-rk:hover:bg-red-900/20 text-red-700 da-rk:text-red-400"
        >
          <FiTrash2 /> Limpiar pestaña
        </button>
      </div>

      {/* Listado */}
      <div className="max-h-[60vh] overflow-auto border-t border-zinc-200 da-rk:border-zinc-800">
        {list.length === 0 ? (
          <div className="p-6 text-center text-sm text-zinc-500 da-rk:text-zinc-400">Sin registros para este filtro.</div>
        ) : (
          <ul className="divide-y divide-zinc-200 da-rk:divide-zinc-800">
            {list.map((entry) => (
              <li key={entry.id}>
                <EntryRow entry={entry} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ---- Item de lista ----
function EntryRow({ entry }: { entry: ApiEntry }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {entry.status === "success" ? (
            <FiCheckCircle className="shrink-0 text-emerald-600" />
          ) : (
            <FiXCircle className="shrink-0 text-red-600" />
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm">
              <span className="truncate font-medium">{prettyMethod(entry)}</span>
              <span className="text-zinc-400">•</span>
              <span className="truncate text-zinc-600 da-rk:text-zinc-300">{entry.request?.url ?? "—"}</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-zinc-500 da-rk:text-zinc-400">
              <span className="inline-flex items-center gap-1"><FiClock /> {formatDate(entry.timestamp)}</span>
              {typeof entry.durationMs === "number" && (
                <span>{entry.durationMs} ms</span>
              )}
              {typeof entry.httpStatus === "number" && (
                <span>HTTP {entry.httpStatus}</span>
              )}
              {entry.meta?.idempotencyKey && (
                <span className="truncate">Idem: {entry.meta.idempotencyKey}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CopyJsonButton data={entry} label="Copiar" />
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 da-rk:border-zinc-700 px-2 py-1 text-xs hover:bg-zinc-50 da-rk:hover:bg-zinc-800"
          >
            <FiCornerDownRight /> {open ? "Ocultar" : "Ver"}
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-3 grid gap-3">
          <KV label="Request">
            <JsonBlock value={{ method: entry.request?.method, headers: entry.request?.headers, query: entry.request?.query, body: entry.request?.body }} />
          </KV>
          {entry.status === "success" ? (
            <KV label="Response">
              <JsonBlock value={entry.response} />
            </KV>
          ) : (
            <KV label="Error">
              <div className="rounded-xl border border-red-200/60 da-rk:border-red-900/40 bg-red-50/60 da-rk:bg-red-900/10 p-3 text-[13px] text-red-700 da-rk:text-red-300">
                {entry.errorMessage ?? "Error desconocido"}
              </div>
            </KV>
          )}
          {entry.meta?.note && (
            <KV label="Nota">
              <p className="text-sm text-zinc-700 da-rk:text-zinc-300">{entry.meta.note}</p>
            </KV>
          )}
        </div>
      )}
    </div>
  );
}

// ---- Subcomponentes utilitarios ----
function KV({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium text-zinc-500 da-rk:text-zinc-400">{label}</div>
      {children}
    </div>
  );
}

function JsonBlock({ value }: { value: unknown }) {
  const [expanded, setExpanded] = useState(false);
  const json = useMemo(() => safeStringify(value), [value]);
  const preview = json.length > 1200 && !expanded ? json.slice(0, 1200) + "\n…" : json;

  return (
    <div className="rounded-xl border border-zinc-200 da-rk:border-zinc-800 bg-zinc-50 da-rk:bg-zinc-800 p-3">
      <pre className="whitespace-pre-wrap break-words text-[12px] leading-relaxed text-zinc-800 da-rk:text-zinc-200">{preview}</pre>
      {json.length > 1200 && (
        <div className="mt-2 flex items-center gap-2">
          <CopyJsonButton data={value} label="Copiar JSON" />
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs underline-offset-2 hover:underline"
          >
            {expanded ? "Mostrar menos" : "Mostrar todo"}
          </button>
        </div>
      )}
    </div>
  );
}

function CopyJsonButton({ data, label = "Copiar" }: { data: unknown; label?: string }) {
  return (
    <button
      onClick={() => navigator.clipboard.writeText(safeStringify(data))}
      className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 da-rk:border-zinc-700 px-2 py-1 text-xs hover:bg-zinc-50 da-rk:hover:bg-zinc-800"
      title="Copiar JSON al portapapeles"
    >
      <FiCopy /> {label}
    </button>
  );
}

function safeStringify(v: unknown) {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

function formatDate(ts: number) {
  try {
    const d = new Date(ts);
    return d.toLocaleString();
  } catch {
    return String(ts);
  }
}

function prettyMethod(entry: ApiEntry) {
  const method = (entry.request?.method ?? "").toString().toUpperCase() || "—";
  const label = ENDPOINT_META[entry.endpoint]?.label ?? entry.endpoint;
  return `${method} — ${label}`;
}