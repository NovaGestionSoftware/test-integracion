
interface Props {
  fetching?: boolean;
  handleFetchOrder: () => void;
}

export default function QueryOrderButton({fetching, handleFetchOrder}: Props) {
  return (
    <button
      onClick={handleFetchOrder}
      disabled={fetching}
      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-medium 
                       shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 
                       disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {fetching ? "Consultando…" : "Consultar orden"}
    </button>
  );
}
