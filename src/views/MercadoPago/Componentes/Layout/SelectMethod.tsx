import { RadioPill } from "../../../Componentes/RadioPill";
import { useMercadoPagoStore } from "../../Store/MercadoPagoStore";
import { useMemo } from "react";

export default function SelectMethod() {
  const { method, setMethod, currentOrder } = useMercadoPagoStore();

  // Bloquea cuando hay una orden creada sin finalizar
  const isLocked = useMemo(
    () => currentOrder?.status === "created",
    [currentOrder?.status]
  );

  const handleSelectQR = () => {
    if (isLocked) return;            // guard en UI
    setMethod("QR");
  };

  const handleSelectPoint = () => {
    if (isLocked) return;            // guard en UI
    setMethod("POINT");
  };

  return (
    <div>
      <fieldset disabled={isLocked /* deshabilita inputs nativos dentro */}>
        <legend className="text-sm font-medium">Medio de pago</legend>

        <div className="mt-2 flex flex-wrap gap-2">
          <RadioPill
            name="mp-method"
            checked={method === "QR"}
            onChange={handleSelectQR}
            label="QR"
            disabled={isLocked}                 // si RadioPill lo soporta
            aria-disabled={isLocked}
          />
          <RadioPill
            name="mp-method"
            checked={method === "POINT"}
            onChange={handleSelectPoint}
            label="Point"
            disabled={isLocked}
            aria-disabled={isLocked}
          />
        </div>

        {!method && (
          <p className="mt-1 text-xs text-red-600">Elegí un medio de pago.</p>
        )}

        {isLocked && (
          <p className="pt-2 text-xs text-gray-600">
            Hay una orden en curso (estado <b>created</b>). Terminá o cancelá esa orden para cambiar el medio de pago.
          </p>
        )}
      </fieldset>
    </div>
  );
}
