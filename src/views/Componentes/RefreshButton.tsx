import { FaSyncAlt } from "react-icons/fa";

export default function RefreshButton({handleRefresh}: {handleRefresh: () => void}) {
  return (
    <button
      onClick={handleRefresh}
      className="inline-flex items-center gap-2 px-3 py-1 text-xs rounded-md border border-zinc-300 hover:bg-zinc-50 hover:cursor-pointer"
      title="Refrescar"
    >
      <FaSyncAlt className="w-3.5 h-3.5" />
      Refresh
    </button>
  );
}
