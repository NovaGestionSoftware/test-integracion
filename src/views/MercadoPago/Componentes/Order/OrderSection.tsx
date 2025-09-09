import { useMemo } from "react";
import { useMercadoPagoStore } from "../../Store/MercadoPagoStore";
import Monto from "../Layout/Moton";
import SelectMethod from "../Layout/SelectMethod";
import TerminalesSelect from "../Point/TerminalesSelect";
import QRModeSelect from "../QR/QRMode";
import CreateOrder from "./CreateOrder";
import { Card } from "../../../Componentes/Card";

export default function OrderSection() {
  const { method } = useMercadoPagoStore();

  const isQR = useMemo(() => method === "QR", [method]);
  const isPOINT = useMemo(() => method === "POINT", [method]);

  return (
    <Card className="min-h-[260px] min-w-[205px] rounded-2xl shadow-sm border border-zinc-200 overflow-hidden ">
      <div className="p-4 md:p-5 flex items-center justify-between">
        <h2 className="text-lg font-medium">Ordén de pago</h2>
      </div>

      <div className="px-4 md:px-5 pb-4 md:pb-5 space-y-4">
        {/* Método */}
        <SelectMethod />
        {/* Opciones según método */}
        {isQR && <QRModeSelect />}
        {isPOINT && <TerminalesSelect />}
        {/* Monto */}
        <Monto />
        <div className="flex flex-row flex-wrap gap-3">
          <CreateOrder />
        </div>
      </div>
    </Card>
  );
}
