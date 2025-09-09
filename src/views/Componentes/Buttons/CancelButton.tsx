interface Props {
  cancelling?: boolean;
  handleCancelOrder: () => void;
}
export default function CancelButton({ handleCancelOrder, cancelling }: Props) {
  return (
    <button
      onClick={handleCancelOrder}
      disabled={cancelling}
      className="inline-flex items-center gap-2 rounded-xl bg-red-600 text-white px-4 py-2 text-sm font-medium 
                         shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-1 
                         disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {cancelling ? "Cancelando…" : "Cancelar ordén"}
    </button>
  );
}
