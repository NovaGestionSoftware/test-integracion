import { useMemo, useRef, useState } from "react";
import CleanButton from "../Componentes/CleanButton";
import SendButton from "../Componentes/SendButton";
import QRModeSelect from "./Componentes/QR/QRMode";
import SucursalesFetcher from "./Componentes/Sucursales/SucursalesFetcher";
import CajasFetcher from "./Componentes/Cajas/CajasFetcher";
import EstadoFormulario from "./Componentes/Layout/EstadoFormulario";
import TerminalesSelect from "./Componentes/Point/TerminalesSelect";
import Monto from "./Componentes/Layout/Moton";
import { useMercadoPagoStore } from "./Store/MercadoPagoStore";
import SelectMethod from "./Componentes/Layout/SelectMethod";


type CreateOrderResult = {
  ok: boolean;
  orderId?: string;
  message?: string;
  payload?: any;
};

export default function MercadoPagoView() {
  const [checking, _setChecking] = useState(false);
  const [result, setResult] = useState<CreateOrderResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const logsRef = useRef<HTMLDivElement>(null);

  const {
    method,
    setMethod,
    amount,
    setAmount,
  } = useMercadoPagoStore();

  const isQR = useMemo(() => method === "QR", [method]);
  const isPOINT = useMemo(() => method === "POINT", [method]);

  const isValid = useMemo(() => {
    if (!method) return false;
    return true;
  }, [method, ]);


  function handleClearData() {
    setMethod("");
    setAmount("");
    setResult(null);
    setErrorMsg(null);
  }

  async function handleCreateOrder() {
    console.log('Crear orden')
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header principal */}
      <h1 className="text-2xl md:text-3xl font-semibold mb-4 flex items-center justify-start">
        Integración – Mercado Pago
        <CleanButton handleClearData={handleClearData} />
      </h1>

      <SucursalesFetcher />
      <CajasFetcher />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Columna izquierda (2/3): Configuración y acciones */}
        <div className="lg:col-span-2">
          {/* Card: Configurar y crear orden */}
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
            <div className="p-4 md:p-5 flex items-center justify-between">
              <h2 className="text-lg font-medium">Configuración de pago</h2>
            </div>

            <div className="px-4 md:px-5 pb-4 md:pb-5 space-y-4">
              {/* Método */}
              <SelectMethod />
              {/* Tipo de QR (condicional) */}
              {isQR && <QRModeSelect />}
              {isPOINT && <TerminalesSelect />}

              {/* Monto */}
              <Monto />

              {/* Acciones */}
              <div className="flex flex-wrap gap-3">
                <SendButton
                  checking={checking}
                  handleCreateOrder={handleCreateOrder}
                  isValid={isValid}
                />
              </div>

              {/* Mensajes */}
              {errorMsg && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  {errorMsg}
                </p>
              )}
            </div>
          </div>

          {/* Card: Respuesta de creación */}
          <div
            ref={logsRef}
            className="mt-4 bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden"
          >
            <div className="p-4 md:p-5 flex items-center justify-between">
              <h2 className="text-lg font-medium">
                Respuesta creación de orden
              </h2>
            </div>
            <div className="px-4 md:px-5 pb-5">
              <pre className="text-xs bg-zinc-50 rounded-xl p-3 overflow-auto max-h-72">
                {result ? JSON.stringify(result, null, 2) : "—"}
              </pre>
            </div>
          </div>
        </div>

        {/* Columna derecha (1/3): Estado / Ayudas (opcional, editable) */}
        <EstadoFormulario
          amount={amount}
          isValid={isValid}
          method={method}
        />
      </div>
    </div>
  );
}
