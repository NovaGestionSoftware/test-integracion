export default function NewOrderButton({handleNuevaOrden}: {handleNuevaOrden: () => void}) {
  return (
    <button
      onClick={handleNuevaOrden}
      className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium 
                       shadow-sm hover:bg-white focus:ring-2 focus:ring-zinc-400 focus:ring-offset-1"
    >
      Generar nueva ordén de pago
    </button>
  );
}
