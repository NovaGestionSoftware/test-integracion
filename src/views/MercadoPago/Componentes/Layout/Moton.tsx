import { useMercadoPagoStore } from "../../Store/MercadoPagoStore";

export default function Monto() {
  const { amount, parsedAmount, setAmount } = useMercadoPagoStore();

  return (
    <div>
      <label className="text-sm font-medium">Monto total</label>
      <input
        inputMode="decimal"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0.00"
        className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-300"
      />
      {!(parsedAmount > 0) && (
        <p className="text-xs text-red-600 mt-1">
          El monto debe ser mayor a $15.
        </p>
      )}
    </div>
  );
}
