/** Radio estilo “pill” (reutilizable) */
export function RadioPill({
  name,
  checked,
  onChange,
  label,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="cursor-pointer">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span
        className="select-none rounded-xl border border-zinc-300 px-3 py-2 text-sm 
        peer-checked:bg-zinc-900 peer-checked:text-white"
        aria-pressed={checked}
      >
        {label}
      </span>
    </label>
  );
}
