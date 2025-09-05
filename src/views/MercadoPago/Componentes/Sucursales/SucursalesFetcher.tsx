import { useEffect, useState } from "react";
import { useMercadoPagoStore } from "../../Store/MercadoPagoStore";
import { EntidadFetcherCard } from "../../../Componentes/EntidadFetcherCard";
import CrearSucursalForm from "./CrearSucursalForm";

const API_BASE = `${import.meta.env.VITE_BASE_URL_PHP}/`; // mantiene la barra final

// Tipo liviano para la vista / store
export type SucursalLite = {
  id: string;
  name: string;
  external_store_id: string; // renombrado desde external_id
};

// Tipos mínimos del API (lo que usamos)
type ApiSucursal = {
  id: string;
  name: string;
  external_id?: string | null;
};

type ApiResponse = {
  status: "success" | "error";
  data?: {
    paging?: { total: number; offset: number; limit: number };
    results?: ApiSucursal[];
  };
  code?: number;
};

function normalizeSucursalesFromApi(api: ApiResponse): SucursalLite[] {
  if (api?.status !== "success") return [];
  const results = api?.data?.results ?? [];
  if (!Array.isArray(results)) return [];
  return results.map((r) => ({
    id: String(r.id ?? ""),
    name: String(r.name ?? ""),
    external_store_id: String(r.external_id ?? ""),
  }));
}

export default function SucursalesFetcher() {
  const [mostrarCrear, setMostrarCrear] = useState(false);
  const [retryFetch, setRetryFetch] = useState(false);
  const [rawSucursalesResponse, setRawSucursalesResponse] = useState<ApiResponse>();

  const store = useMercadoPagoStore();
  const {
    sucursales,
    setSucursales,
    setLoadingSucursales,
    isLoadingSucursales,
    sucursalSeleccionada,
    setSucursalSeleccionada,
  } = store;

  const url = `${API_BASE}mercadopago/obtenerSucursales.php`;

  useEffect(() => {
    const fetchSucursales = async () => {
      setLoadingSucursales(true);
      try {
        const res = await fetch(url, { method: "GET" });
        if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

        const data: ApiResponse = await res.json();
        setRawSucursalesResponse(data);

        if (data.status !== "success") {
          throw new Error(data?.code ? `API code ${data.code}` : "Respuesta no exitosa del servidor");
        }
        if (!Array.isArray(data?.data?.results)) {
          console.warn("Estructura inesperada:", data);
          throw new Error("Estructura inesperada: 'data.results' no es un array");
        }

        const sucursalesLite = normalizeSucursalesFromApi(data);
        setSucursales(sucursalesLite);
      } catch (error: any) {
        console.error("Error al consultar sucursales:", error);
        setSucursales([]); // estado consistente para la UI
      } finally {
        setLoadingSucursales(false);
      }
    };

    if (sucursales === null) fetchSucursales();
    if (retryFetch) {
      fetchSucursales();
      setRetryFetch(false);
    }
  }, [url, sucursales, setSucursales, setLoadingSucursales, retryFetch, setRetryFetch]);

  return (
    <EntidadFetcherCard<SucursalLite>
      titulo="Sucursales existentes:"
      items={sucursales}
      itemSeleccionado={sucursalSeleccionada}
      onSeleccionarItem={setSucursalSeleccionada}
      mostrarFormulario={mostrarCrear}
      toggleMostrarFormulario={() => setMostrarCrear(!mostrarCrear)}
      FormularioComponente={<CrearSucursalForm />}
      sinResultadosTexto="No se encontraron sucursales."
      onRefresh={() => setRetryFetch(true)}
      mostrarRetry={true}
      botonCrearTexto="Crear nueva sucursal"
      responseRaw={rawSucursalesResponse}
      defaultShowResponse={false}
      // NUEVO: loading dentro de la card
      isLoading={isLoadingSucursales}
      loadingMessage="Consultando sucursales..."
    />
  );
}
