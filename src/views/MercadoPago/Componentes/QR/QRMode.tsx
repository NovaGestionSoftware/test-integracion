import { RadioPill } from "../../../Componentes/RadioPill";
import { useMercadoPagoStore } from "../../Store/MercadoPagoStore";

export default function QRModeSelect() {
  const { qrMode, setQrMode } = useMercadoPagoStore();

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-gray-200 bg-opacity-5 rounded-2xl w-fit">
      <RadioPill
        name="qr-mode"
        checked={qrMode === "static"}
        onChange={() => {
          setQrMode("static");
        }}
        label="Static"
      />
      <RadioPill
        name="qr-mode"
        checked={qrMode === "dynamic"}
        onChange={() => {
          setQrMode("dynamic");
        }}
        label="Dynamic"
      />
      <RadioPill
        name="qr-mode"
        checked={qrMode === "hybrid"}
        onChange={() => {
          setQrMode("hybrid");
        }}
        label="Hybrid"
      />
    </div>
  );
}
