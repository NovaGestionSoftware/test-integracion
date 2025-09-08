import { FiSend } from "react-icons/fi";

export default function SendButton({handleCreateOrder, isValid, checking}: {handleCreateOrder: () => void, isValid: boolean, checking: boolean}) {
  return (
    <button
      onClick={handleCreateOrder}
      disabled={!isValid || checking}
      className="inline-flex items-center gap-2 rounded-xl bg-green-600 text-white px-4 py-2 text-sm font-medium 
                      shadow-sm hover:bg-green-700 hover:cursor-pointer focus:ring-2 focus:ring-green-500 focus:ring-offset-1 
                      disabled:opacity-50 disabled:text-gray-800 disabled:bg-gray-500 disabled:cursor-not-allowed"
    >
      <FiSend />
      {checking ? "Creando orden…" : "Crear orden de pago"}
    </button>
  );
}
