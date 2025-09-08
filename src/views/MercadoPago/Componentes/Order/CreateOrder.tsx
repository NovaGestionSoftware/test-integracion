import { useMemo, useState, useCallback } from "react";
import { useMercadoPagoStore } from "../../Store/MercadoPagoStore";
import SendButton from "../../../Componentes/SendButton";

const API_BASE = `${import.meta.env.VITE_BASE_URL_PHP}/mercadopago`;
const API_CREAR_ORDEN = `${API_BASE}/crearOrden.php`;
const API_OBTENER_ORDEN = `${API_BASE}/obtenerOrden.php`;
const API_CANCELAR_ORDEN = `${API_BASE}/cancelarOrden.php`;
const API_CONSULTA_PAGO = `${API_BASE}/consultaPago.php`;

type QrMode = "static" | "dynamic" | "hybrid";

type CreateQRBody = { app: 1; importe: string; modo: QrMode };
type CreatePointBody = {
  app: 2;
  importe: string;
  idTerminal: string;
  imprimir: 0 | 1;
};
type CreateBody = CreateQRBody | CreatePointBody;

export default function CreateOrder() {
  const [checking, setChecking] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [consulting, setConsulting] = useState(false);

  const {
    method,
    parsedAmount,
    qrMode,
    terminalId,
    shouldPrint,
    currentOrderId,
    currentOrder,
    setCurrentOrderId,
    setCurrentOrder,
  } = useMercadoPagoStore();

  const isValid = useMemo(() => {
    if (!(parsedAmount > 0)) return false;
    if (method === "POINT" && !terminalId) return false;
    return true;
  }, [parsedAmount, method, terminalId]);

  const statusDetail = currentOrder?.status_detail as
    | "created"
    | "at_terminal"
    | "canceled"
    | "accredited"
    | "processed"
    | "refunded"
    | "expired"
    | string
    | undefined;

  // ✅ Pago exitoso según método:
  const isPaidSuccess =
    (method === "QR" && statusDetail === "accredited") ||
    (method === "POINT" && statusDetail === "processed");

  // Mostrar consultar/cancelar solo cuando está creada y aún no acreditada
  const canShowQueryCancel =
    statusDetail === "created" && Boolean(currentOrder?.id || currentOrderId);

  const montoFromOrder =
    (currentOrder as any)?.transactions?.payments?.[0]?.amount ??
    (currentOrder as any)?.amount ??
    String(parsedAmount);

  // ---------- extractQr: mapea tu respuesta ----------
  const extractQr = (order: any) => {
    if (!order) return null;
    const qrDataFromTypeResponse = order?.type_response?.qr_data;

    const imgBase64 =
      order?.point_of_interaction?.transaction_data?.qr_code_base64 ||
      order?.qr_image_base64;

    const imgUrl = order?.qr_image_url;

    if (imgBase64) {
      const src = String(imgBase64).startsWith("data:")
        ? imgBase64
        : `data:image/png;base64,${imgBase64}`;
      return {
        type: "image",
        src,
        alt: "QR para pagar",
        qrCodeText: qrDataFromTypeResponse,
      };
    }

    if (imgUrl) {
      return {
        type: "image-url",
        src: imgUrl,
        alt: "QR para pagar",
        qrCodeText: qrDataFromTypeResponse,
      };
    }

    if (qrDataFromTypeResponse) {
      return { type: "text", text: qrDataFromTypeResponse };
    }

    return null;
  };
  // ---------------------------------------------------

  const qrPayload = useMemo(() => extractQr(currentOrder), [currentOrder]);

  const shouldShowQr =
    method === "QR" &&
    (qrMode === "dynamic" || qrMode === "hybrid") &&
    statusDetail === "created" &&
    !!qrPayload;

  const handleCreateOrder = useCallback(async () => {
    if (!isValid) return;

    const importe = String(parsedAmount);
    let body: CreateBody;

    if (method === "QR") {
      body = { app: 1, importe, modo: qrMode as QrMode };
    } else {
      body = {
        app: 2,
        importe,
        idTerminal: terminalId!, // validado en isValid
        imprimir: shouldPrint ? 1 : 0,
      };
    }

    try {
      setChecking(true);
      const res = await fetch(API_CREAR_ORDEN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      console.log("Respuesta crear orden:", json);
      const created = json?.data ?? json;

      setCurrentOrderId(created?.id ?? null);
      setCurrentOrder(created ?? null);
    } catch (err) {
      console.error("Error al crear la orden:", err);
    } finally {
      setChecking(false);
    }
  }, [
    isValid,
    method,
    parsedAmount,
    qrMode,
    terminalId,
    shouldPrint,
    setCurrentOrder,
    setCurrentOrderId,
  ]);

  const handleFetchOrder = useCallback(async () => {
    const id = currentOrder?.id ?? currentOrderId;
    if (!id) return;

    try {
      setFetching(true);
      const res = await fetch(API_OBTENER_ORDEN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      console.log("Respuesta obtener orden:", json);
      const fetched = json?.data ?? json;

      setCurrentOrderId(fetched?.id ?? id);
      setCurrentOrder(fetched ?? null);
    } catch (err) {
      console.error("Error al obtener la orden:", err);
    } finally {
      setFetching(false);
    }
  }, [currentOrder?.id, currentOrderId, setCurrentOrder, setCurrentOrderId]);

  const handleCancelOrder = useCallback(async () => {
    if (method !== "QR") return;
    const id = currentOrder?.id ?? currentOrderId;
    if (!id) return;

    try {
      setCancelling(true);
      const res = await fetch(API_CANCELAR_ORDEN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      console.log("Respuesta cancelar orden:", json);
      const cancelled = json?.data ?? { id, status_detail: "canceled" };

      setCurrentOrderId(cancelled?.id ?? id);
      setCurrentOrder(cancelled ?? null);
    } catch (err) {
      console.error("Error al cancelar la orden:", err);
    } finally {
      setCancelling(false);
    }
  }, [
    method,
    currentOrder?.id,
    currentOrderId,
    setCurrentOrder,
    setCurrentOrderId,
  ]);

  // ▶️ Nuevo: consultar pago
  const handleConsultarPago = useCallback(async () => {
    const id = currentOrder?.id ?? currentOrderId;
    if (!id) return;

    try {
      setConsulting(true);
      const res = await fetch(API_CONSULTA_PAGO, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      console.log("Respuesta consulta pago:", json);
    } catch (err) {
      console.error("Error en consulta de pago:", err);
    } finally {
      setConsulting(false);
    }
  }, [currentOrder?.id, currentOrderId /*, setCurrentOrder*/]);

  // ▶️ Nuevo: resetear configuración y limpiar orden
  const handleNuevaOrden = useCallback(() => {
    setCurrentOrder(null);
    setCurrentOrderId(null);
  }, [setCurrentOrder, setCurrentOrderId]);

  return (
    <div className="space-y-3">
      {/* Botonera superior:
          - Si pago acreditado => mostrar acciones post-pago
          - Si creada (no acreditada) => consultar / cancelar
          - Si no hay orden => botón crear
      */}
      {isPaidSuccess ? (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleNuevaOrden}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium 
                       shadow-sm hover:bg-white focus:ring-2 focus:ring-zinc-400 focus:ring-offset-1"
          >
            Generar nueva orden de pago
          </button>

          <button
            onClick={handleConsultarPago}
            disabled={consulting}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm font-medium 
                       shadow-sm hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {consulting ? "Consultando…" : "Consultar pago"}
          </button>
        </div>
      ) : canShowQueryCancel ? (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleFetchOrder}
            disabled={fetching}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-medium 
                       shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {fetching ? "Consultando…" : "Consultar orden"}
          </button>

          {method === "QR" && (
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 text-white px-4 py-2 text-sm font-medium 
                         shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-1 
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelling ? "Cancelando…" : "Cancelar"}
            </button>
          )}
        </div>
      ) : (
        <SendButton
          handleCreateOrder={handleCreateOrder}
          isValid={isValid}
          checking={checking}
        />
      )}

      {/* Panel de detalle de la orden */}
      {currentOrder && (
        <div className="mt-2 rounded-xl border border-zinc-200 p-3 text-sm bg-white">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full border" title="status_detail">
              Estado detalle: <b>{statusDetail ?? "—"}</b>
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full border" title="status">
              Estado: <b>{currentOrder.status ?? "—"}</b>
            </span>

            {/* ✅ badge de pago exitoso para ambos métodos */}
            {isPaidSuccess && (
              <span className="text-xs px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700">
                ✅ Pago acreditado
              </span>
            )}
          </div>

          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            <div><span className="text-zinc-500">ID:</span> {currentOrder.id ?? "—"}</div>
            <div><span className="text-zinc-500">Tipo:</span> {currentOrder.type ?? "—"}</div>
            <div><span className="text-zinc-500">Moneda:</span> {currentOrder.currency ?? "—"}</div>
            <div><span className="text-zinc-500">Monto:</span> {montoFromOrder ?? "—"}</div>
            <div><span className="text-zinc-500">Creada:</span> {currentOrder.created_date ?? "—"}</div>
            <div><span className="text-zinc-500">Actualizada:</span> {currentOrder.last_updated_date ?? "—"}</div>

            {currentOrder?.config?.point && (
              <>
                <div>
                  <span className="text-zinc-500">Terminal:</span>{" "}
                  {currentOrder.config.point.terminal_id ?? "—"}
                </div>
                <div>
                  <span className="text-zinc-500">Ticket #:</span>{" "}
                  {currentOrder.config.point.ticket_number ?? "—"}
                </div>
                <div className="sm:col-span-2">
                  <span className="text-zinc-500">Impresión:</span>{" "}
                  {currentOrder.config.point.print_on_terminal ?? "—"}
                </div>
              </>
            )}
          </div>

          {/* Bloque QR */}
          {shouldShowQr && (
            <div className="mt-4 rounded-lg border border-zinc-200 p-3 bg-zinc-50">
              <div className="mb-2 font-medium">Escaneá el QR para pagar</div>

              {qrPayload?.type === "image" || qrPayload?.type === "image-url" ? (
                <div className="flex items-center gap-4">
                  <img
                    src={qrPayload.src}
                    alt={qrPayload.alt}
                    className="w-44 h-44 rounded-md bg-white border"
                  />
                  {qrPayload.qrCodeText && (
                    <div className="text-xs text-zinc-600 break-all">
                      <span className="font-medium">QR data:</span> {qrPayload.qrCodeText}
                    </div>
                  )}
                </div>
              ) : qrPayload?.type === "text" ? (
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=264x264&data=${encodeURIComponent(
                    qrPayload.text
                  )}`}
                  alt="QR para pagar"
                  className="w-44 h-44 rounded-md bg-white border"
                />
              ) : (
                <div className="text-xs text-amber-700">
                  No se encontró la imagen del QR en la respuesta.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
