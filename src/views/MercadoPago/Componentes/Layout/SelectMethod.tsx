import { RadioPill } from "../../../Componentes/RadioPill";
import { useMercadoPagoStore } from "../../Store/MercadoPagoStore";

export default function SelectMethod() {
  const { method, setMethod,  } = useMercadoPagoStore();

  const handleSelectQR = () => {
    setMethod("QR");
  };

  const handleSelectPoint = () => {
    setMethod("POINT");
  };

  return (
    <div>
      <fieldset>
        <legend className="text-sm font-medium">Medio de pago</legend>

        <div className="mt-2 flex flex-wrap gap-2">
          <RadioPill
            name="mp-method"
            checked={method === "QR"}
            onChange={handleSelectQR}
            label="QR"
          />
          <RadioPill
            name="mp-method"
            checked={method === "POINT"}
            onChange={handleSelectPoint}
            label="Point"
          />
        </div>

        {!method && (
          <p className="mt-1 text-xs text-red-600">Elegí un medio de pago.</p>
        )}


      </fieldset>
    </div>
  );
}
