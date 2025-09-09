import { useMemo, useState, useCallback } from "react";
import { useMercadoPagoStore } from "../../Store/MercadoPagoStore";
import SendButton from "../../../Componentes/SendButton";
import CancelButton from "../../../Componentes/Buttons/CancelButton";
import QueryOrderButton from "../../../Componentes/Buttons/QueryOrderButton";
import QueryPayButton from "../../../Componentes/Buttons/QueryPayButton";
import NewOrderButton from "../../../Componentes/Buttons/NewOrderButton";
import type { Order, QrPayload } from "../../../types";
import { OrderPanel } from "./OrderPanel";
import type { InspectorSlice } from "../../Store/InspectorSlice";

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

/* ---------------- Inspector helpers ---------------- */
const useInspector = <T,>(selector: (s: InspectorSlice) => T) =>
  useMercadoPagoStore((s) => selector(s as unknown as InspectorSlice));

// id simple 
const rid = () => `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

function nowMs() {
  return performance?.now?.() ?? Date.now();
}

export default function CreateOrder() {
  const [checking, setChecking] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [consulting, setConsulting] = useState(false);

  // Inspector actions
  const pushSuccess = useInspector((s) => s.pushSuccess);
  const pushError = useInspector((s) => s.pushError);

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
    if (parsedAmount < 15) return false;
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
  (["created", "at_terminal"] as const).includes((statusDetail ?? "") as any) &&
  Boolean(currentOrder?.id || currentOrderId);

  const montoFromOrder =
    (currentOrder as any)?.transactions?.payments?.[0]?.amount ??
    (currentOrder as any)?.amount ??
    String(parsedAmount);

  // ---------- extractQr: mapea respuesta ----------
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

  /* ---------------- Handlers con logging al Inspector ---------------- */

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

    const requestId = rid();
    const t0 = nowMs();

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

      const httpStatus = res.status;
      const json = await res.json().catch(() => null);
      const created = (json as any)?.data ?? json;

      const durationMs = Math.round(nowMs() - t0);

      if (!res.ok) {
        // Log error en Inspector
        pushError("createOrder", {
          id: requestId,
          httpStatus,
          durationMs,
          request: {
            url: API_CREAR_ORDEN,
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body,
          },
          errorMessage: `HTTP ${httpStatus} - ${(json as any)?.message ?? "Error al crear la orden"}`,
          meta: { note: method === "QR" ? "Creación QR" : "Creación Point" },
        });
        throw new Error(`HTTP ${httpStatus}`);
      }

      // Log success en Inspector
      pushSuccess("createOrder", {
        id: requestId,
        httpStatus,
        durationMs,
        request: {
          url: API_CREAR_ORDEN,
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body,
        },
        response: json,
        meta: { note: method === "QR" ? "Creación QR" : "Creación Point" },
      });

      // Estado de UI
      setCurrentOrderId(created?.id ?? null);
      setCurrentOrder(created ?? null);
    } catch (err: any) {
      // En caso de excepciones de red/parseo no capturadas arriba
      const durationMs = Math.round(nowMs() - t0);
      pushError("createOrder", {
        id: requestId,
        httpStatus: undefined,
        durationMs,
        request: {
          url: API_CREAR_ORDEN,
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body,
        },
        errorMessage: err?.message ?? "Error desconocido al crear la orden",
        meta: { note: method === "QR" ? "Creación QR" : "Creación Point" },
      });
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
    pushSuccess,
    pushError,
  ]);

  const handleFetchOrder = useCallback(async () => {
    const id = currentOrder?.id ?? currentOrderId;
    if (!id) return;

    const requestId = rid();
    const t0 = nowMs();

    try {
      setFetching(true);
      const body = { id };

      const res = await fetch(API_OBTENER_ORDEN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });

      const httpStatus = res.status;
      const json = await res.json().catch(() => null);
      const fetched = (json as any)?.data ?? json;
      const durationMs = Math.round(nowMs() - t0);

      if (!res.ok) {
        pushError("getOrder", {
          id: requestId,
          httpStatus,
          durationMs,
          request: {
            url: API_OBTENER_ORDEN,
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body,
          },
          errorMessage: `HTTP ${httpStatus} - ${(json as any)?.message ?? "Error al obtener la orden"}`,
        });
        throw new Error(`HTTP ${httpStatus}`);
      }

      pushSuccess("getOrder", {
        id: requestId,
        httpStatus,
        durationMs,
        request: {
          url: API_OBTENER_ORDEN,
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body,
        },
        response: json,
      });

      setCurrentOrderId(fetched?.id ?? id);
      setCurrentOrder(fetched ?? null);
    } catch (err: any) {
      const durationMs = Math.round(nowMs() - t0);
      pushError("getOrder", {
        id: requestId,
        httpStatus: undefined,
        durationMs,
        request: {
          url: API_OBTENER_ORDEN,
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: { id: currentOrder?.id ?? currentOrderId },
        },
        errorMessage: err?.message ?? "Error desconocido al obtener la orden",
      });
      console.error("Error al obtener la orden:", err);
    } finally {
      setFetching(false);
    }
  }, [currentOrder?.id, currentOrderId, setCurrentOrder, setCurrentOrderId, pushSuccess, pushError]);

  const handleCancelOrder = useCallback(async () => {
    if (method !== "QR") return;
    const id = currentOrder?.id ?? currentOrderId;
    if (!id) return;

    const requestId = rid();
    const t0 = nowMs();

    try {
      setCancelling(true);
      const body = { id };

      const res = await fetch(API_CANCELAR_ORDEN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });

      const httpStatus = res.status;
      const json = await res.json().catch(() => null);
      const cancelled = (json as any)?.data ?? { id, status_detail: "canceled" };
      const durationMs = Math.round(nowMs() - t0);

      if (!res.ok) {
        pushError("cancelOrder", {
          id: requestId,
          httpStatus,
          durationMs,
          request: {
            url: API_CANCELAR_ORDEN,
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body,
          },
          errorMessage: `HTTP ${httpStatus} - ${(json as any)?.message ?? "Error al cancelar la orden"}`,
        });
        throw new Error(`HTTP ${httpStatus}`);
      }

      pushSuccess("cancelOrder", {
        id: requestId,
        httpStatus,
        durationMs,
        request: {
          url: API_CANCELAR_ORDEN,
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body,
        },
        response: json,
      });

      setCurrentOrderId(cancelled?.id ?? id);
      setCurrentOrder(cancelled ?? null);
    } catch (err: any) {
      const durationMs = Math.round(nowMs() - t0);
      pushError("cancelOrder", {
        id: requestId,
        httpStatus: undefined,
        durationMs,
        request: {
          url: API_CANCELAR_ORDEN,
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: { id: currentOrder?.id ?? currentOrderId },
        },
        errorMessage: err?.message ?? "Error desconocido al cancelar la orden",
      });
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
    pushSuccess,
    pushError,
  ]);

  // ▶️ Consulta de pago (no la agregaste al slice; si querés verla en el inspector,
  // sumale un EndpointKey tipo "queryPayment" y acá logueamos igual que los demás)
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
      // 👉 Si agregás EndpointKey 'queryPayment', podés loguear acá como en los otros handlers
    } catch (err) {
      console.error("Error en consulta de pago:", err);
    } finally {
      setConsulting(false);
    }
  }, [currentOrder?.id, currentOrderId]);

  // ▶️ Reset
  const handleNuevaOrden = useCallback(() => {
    setCurrentOrder(null);
    setCurrentOrderId(null);
  }, [setCurrentOrder, setCurrentOrderId]);

  return (
    <div className="space-y-3">
      {isPaidSuccess ? (
        <div className="flex flex-wrap gap-2">
          <NewOrderButton handleNuevaOrden={handleNuevaOrden} />
          <QueryPayButton
            handleConsultarPago={handleConsultarPago}
            consulting={consulting}
          />
        </div>
      ) : canShowQueryCancel ? (
        <div className="flex flex-wrap gap-2">
          <QueryOrderButton
            handleFetchOrder={handleFetchOrder}
            fetching={fetching}
          />

          {method === "QR" && (
            <CancelButton
              handleCancelOrder={handleCancelOrder}
              cancelling={cancelling}
            />
          )}
        </div>
      ) : (
        <SendButton
          handleCreateOrder={handleCreateOrder}
          isValid={isValid}
          checking={checking}
        />
      )}

      {currentOrder && (
        <OrderPanel
          currentOrder={currentOrder as Order}
          statusDetail={statusDetail}
          isPaidSuccess={isPaidSuccess}
          montoFromOrder={montoFromOrder}
          shouldShowQr={shouldShowQr}
          qrPayload={qrPayload as QrPayload}
        />
      )}
    </div>
  );
}
