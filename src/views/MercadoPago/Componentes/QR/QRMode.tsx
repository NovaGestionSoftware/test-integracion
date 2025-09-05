import { useState } from "react";
import { RadioPill } from "../../../Componentes/RadioPill";

type ModoQR = "static" | "dynamic" | "hybrid";
export default function QRModeSelect() {
  const [modoQR, setModoQR] = useState<ModoQR | "">("");
  
  return (
    <div className="flex flex-wrap gap-2 p-4 bg-gray-200 bg-opacity-5 rounded-2xl w-fit">
      <RadioPill
        name="qr-mode"
        checked={modoQR === "static"}
        onChange={() => {
          setModoQR("static");
        }}
        label="Static"
      />
      <RadioPill
        name="qr-mode"
        checked={modoQR === "dynamic"}
        onChange={() => {
          setModoQR("dynamic");
        }}
        label="Dynamic"
      />
      <RadioPill
        name="qr-mode"
        checked={modoQR === "hybrid"}
        onChange={() => {
          setModoQR("hybrid");
        }}
        label="Hybrid"
      />
    </div>
  );
}
