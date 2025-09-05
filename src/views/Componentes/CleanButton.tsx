import { FiRefreshCw } from "react-icons/fi";

export default function CleanButton({handleClearData}: {handleClearData: () => void}) {
  return (
    <button
      onClick={handleClearData}
      className="ml-4 inline-flex items-center gap-1 rounded-lg border border-zinc-300 
          px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50 hover:cursor-pointer"
      title="Limpiar datos"
    >
      <FiRefreshCw /> Limpiar
    </button>
  );
}
