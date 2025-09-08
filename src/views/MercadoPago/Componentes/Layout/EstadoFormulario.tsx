export default function EstadoFormulario({
  method,
  amount,
  isValid,
}: {
  method: string;
  amount: string;
  isValid: boolean;
}) {
  return (
    <div className="bg-white h-full rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
      <div className="p-4 md:p-5 flex items-center justify-between">
        <h2 className="text-lg font-medium">Estado de formulario</h2>
      </div>
      <div className="px-4 md:px-5 pb-5">
        <ul className="text-sm space-y-1">
          <li>
            Método:{" "}
            <span className="font-mono text-zinc-700">{method || "—"}</span>
          </li>
          <li>
            QR tipo:{" "}
          </li>
          <li>
            Monto:{" "}
            <span className="font-mono text-zinc-700">{amount || "—"}</span>
          </li>
          <li className="mt-2">
            Validez:{" "}
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs ${
                isValid
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              {isValid ? "OK" : "Incompleto"}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
