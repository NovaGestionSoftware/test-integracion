import { useRef } from "react";
import { useMercadoPagoStore } from "../../Store/MercadoPagoStore";

export default function Monto() {
  const { amount, parsedAmount, setAmount, method } = useMercadoPagoStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const formatCurrency = (digits: string) => {
    if (!digits) return "";
    const n = Number(digits); // interpreta amount como pesos enteros
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n); // Ej: "123.123,00"
  };

  const moveCaretToEnd = () => {
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (el) {
        const len = el.value.length;
        el.setSelectionRange(len, len);
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      setAmount(amount.slice(0, -1));
      moveCaretToEnd();
      return;
    }
    // Delete => limpia todo
    if (e.key === "Delete") {
      e.preventDefault();
      setAmount("");
      moveCaretToEnd();
      return;
    }
    // Permitir navegación básica
    if (["Tab", "ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;

    // Solo aceptar dígitos 0-9
    if (/^\d$/.test(e.key)) {
      e.preventDefault();
      const next = (amount + e.key).replace(/^0+/, ""); // sin ceros a la izquierda
      setAmount(next);
      moveCaretToEnd();
      return;
    }

    // Bloquear cualquier otra tecla (., , etc.)
    e.preventDefault();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text") ?? "";
    const digits = text.replace(/\D/g, "");
    if (!digits) return;
    const next = (amount + digits).replace(/^0+/, "");
    setAmount(next);
    moveCaretToEnd();
  };

  return (
    <div>
      <label className="text-sm font-medium">Monto total</label>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric" 
        value={amount ? formatCurrency(amount) : ""}
        onKeyDown={handleKeyDown} 
        onPaste={handlePaste}      
        onChange={() => {}}         
        placeholder="$ 0,00"
        className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-300"
      />

  {method !== "" && parsedAmount > 0 && (
  <>
    {parsedAmount < 15 && (
      <p className="text-xs text-red-600 mt-1">
        El monto debe ser mayor a $15.00
      </p>
    )}
  </>
)}

    </div>
  );
}
