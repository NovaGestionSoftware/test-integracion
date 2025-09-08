import { useMemo } from "react";
import QRModeSelect from "./Componentes/QR/QRMode";
import SucursalesFetcher from "./Componentes/Sucursales/SucursalesFetcher";
import CajasFetcher from "./Componentes/Cajas/CajasFetcher";
import TerminalesSelect from "./Componentes/Point/TerminalesSelect";
import Monto from "./Componentes/Layout/Moton";
import { useMercadoPagoStore } from "./Store/MercadoPagoStore";
import SelectMethod from "./Componentes/Layout/SelectMethod";
import CreateOrder from "./Componentes/Order/CreateOrder";

//
export default function MercadoPagoView() {
  const { method } = useMercadoPagoStore();

  const isQR = useMemo(() => method === "QR", [method]);
  const isPOINT = useMemo(() => method === "POINT", [method]);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header principal */}
      <h1 className="text-2xl md:text-3xl font-semibold mb-4 flex items-center justify-start">
        Integración – Mercado Pago
        {/* <CleanButton handleClearData={handleClearData} /> */}
      </h1>

      <SucursalesFetcher />
      <CajasFetcher />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Columna izquierda (2/3): Configuración y acciones */}
        <div className="lg:col-span-2">
          {/* Card: Configurar y crear orden */}
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
            <div className="p-4 md:p-5 flex items-center justify-between">
              <h2 className="text-lg font-medium">Ordén de pago</h2>
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
                <CreateOrder />
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha (1/3): Estado / Ayudas (opcional, editable) */}
        {/* <EstadoFormulario
          amount={amount}
          isValid={isValid}
          method={method}
        /> */}
      </div>
    </div>
  );
}
