interface Props {
  responseRaw?: unknown;
}
export default function ResCard({ responseRaw }: Props) {
  // Alturas parejas y scroll en ambas columnas
  const contentScrollClass = "min-h-[12rem] max-h-60 overflow-auto";

  return (
    <div className="flex-1 max-w-2xs">
      <div
        className={`bg-zinc-50 rounded-md p-3 border border-zinc-200 ${contentScrollClass}`}
      >
        <pre className="text-xs whitespace-pre-wrap">
          {responseRaw != null ? JSON.stringify(responseRaw, null, 2) : "—"}
        </pre>
      </div>
    </div>
  );
}
