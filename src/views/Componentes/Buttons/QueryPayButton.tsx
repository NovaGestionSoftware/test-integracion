interface Props {
  consulting?: boolean;
  handleConsultarPago: () => void;
}

export default function QueryPayButton({
  consulting,
  handleConsultarPago,
}: Props) {
  return (
    <button
      onClick={handleConsultarPago}
      disabled={consulting}
      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm font-medium 
                       shadow-sm hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 
                       disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {consulting ? "Consultando…" : "Consultar pago"}
    </button>
  );
}
