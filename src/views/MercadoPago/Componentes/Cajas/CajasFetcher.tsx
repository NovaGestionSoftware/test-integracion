import { useEffect, useState } from "react";
import { useMercadoPagoStore } from "../../Store/MercadoPagoStore";
import CrearCajaForm from "./CrearCajasForm";
import { EntidadFetcherCard } from "../../../Componentes/EntidadFetcherCard";

const API_BASE = `${import.meta.env.VITE_BASE_URL_PHP}/`; // termina en "/"

// ===== Tipos mínimos (relevantes) =====
export type CajaLite = {
  id: string;
  name: string;
  external_id: string;
  // opcionales para filtrar/uso posterior
  store_id?: string;
  external_store_id?: string;
  // NUEVO: QR asociado a la caja (si viene)
  qr?: {
    image?: string; // url PNG del QR
    template_document?: string; // url PDF plantilla
    template_image?: string; // url PNG plantilla
  };
};

type ApiCaja = {
  id?: string | number;
  name?: string;
  external_id?: string;
  store_id?: string | number;
  external_store_id?: string;
  qr?: {
    image?: string;
    template_document?: string;
    template_image?: string;
  } | null;
};

type ApiResponseCajas = {
  status: "success" | "error";
  data?: {
    paging?: { total: number; offset: number; limit: number };
    results?: ApiCaja[];
  };
  code?: number;
};

function normalizeCajasFromApi(api: ApiResponseCajas): CajaLite[] {
  if (api?.status !== "success") return [];
  const results = api?.data?.results ?? [];
  if (!Array.isArray(results)) return [];
  return results.map((r) => ({
    id: String(r.id ?? ""),
    name: String(r.name ?? ""),
    external_id: String(r.external_id ?? ""),
    store_id: r.store_id != null ? String(r.store_id) : undefined,
    external_store_id: r.external_store_id
      ? String(r.external_store_id)
      : undefined,
    qr: r.qr
      ? {
          image: r.qr.image,
          template_document: r.qr.template_document,
          template_image: r.qr.template_image,
        }
      : undefined,
  }));
}

export default function CajasFetcher() {
  const [mostrarCrearCaja, setMostrarCrearCaja] = useState(false);
  const [retryFetch, setRetryFetch] = useState(false);
  const [rawCajasResponse, setRawCajasResponse] = useState<
    ApiResponseCajas | undefined
  >(undefined);

  const store = useMercadoPagoStore();
  const {
    cajas,
    setCajas,
    setLoadingCajas,
    isLoadingCajas,
    cajaSeleccionada,
    setCajaSeleccionada,
  } = store;

  const url = `${API_BASE}mercadopago/obtenerCajas.php`;

  useEffect(() => {
    const fetchCajas = async () => {
      setLoadingCajas(true);
      try {
        const res = await fetch(url, { method: "GET" });
        if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

        const data: ApiResponseCajas = await res.json();
        setRawCajasResponse(data);

        if (data.status !== "success") {
          throw new Error(
            data?.code
              ? `API code ${data.code}`
              : "Respuesta no exitosa del servidor"
          );
        }
        if (!Array.isArray(data?.data?.results)) {
          console.warn("Estructura inesperada:", data);
          throw new Error(
            "Estructura inesperada: 'data.results' no es un array"
          );
        }

        const cajasLite = normalizeCajasFromApi(data);
        setCajas(cajasLite);
      } catch (error: any) {
        console.error("Error al consultar cajas:", error);
        setCajas([]); // estado consistente
      } finally {
        setLoadingCajas(false);
      }
    };

    if (cajas === null) fetchCajas();
    if (retryFetch) {
      fetchCajas();
      setRetryFetch(false);
    }
  }, [url, cajas, setCajas, setLoadingCajas, retryFetch, setRetryFetch]);

  const renderCajaItem = (
    caja: CajaLite,
    isSelected: boolean,
    onSelect: () => void
  ) => (
    <label
      key={caja.id}
      className="flex flex-col text-sm text-gray-800 cursor-pointer border p-2 rounded hover:bg-gray-50"
    >
      <div className="flex items-center gap-2">
        <input
          type="radio"
          checked={isSelected}
          onChange={onSelect}
          className="form-radio text-blue-600"
        />
        <span className="font-medium">{caja.name}</span>
      </div>
      <span className="text-xs text-gray-500">
        ID externo: {caja.external_id || "—"}
      </span>

      {/* Si más adelante querés mostrar un preview del QR: */}
      {caja.qr?.image && (
        <img
          src={caja.qr.image}
          alt="QR"
          className="mt-2 w-28 h-28 object-contain rounded border"
        />
      )}
    </label>
  );

  return (
    <EntidadFetcherCard<CajaLite>
      titulo="Cajas disponibles:"
      items={cajas}
      itemSeleccionado={cajaSeleccionada as unknown as CajaLite | null}
      onSeleccionarItem={(c: CajaLite) => setCajaSeleccionada(c as any)}
      mostrarFormulario={mostrarCrearCaja}
      toggleMostrarFormulario={() => setMostrarCrearCaja(!mostrarCrearCaja)}
      FormularioComponente={<CrearCajaForm />}
      sinResultadosTexto="No se encontraron cajas."
      onRefresh={() => setRetryFetch(true)}
      mostrarRetry={true}
      botonCrearTexto="Crear nueva caja"
      renderItem={renderCajaItem}
      // Panel “Ver respuesta”
      responseRaw={rawCajasResponse}
      defaultShowResponse={false}
      // Loading dentro de la card
      isLoading={isLoadingCajas}
      loadingMessage="Consultando cajas..."
      // Opcional: fijar ancho de columna izquierda igual que en Sucursales
      // leftFixedWidthClass="w-full md:w-[520px]"
    />
  );
}
