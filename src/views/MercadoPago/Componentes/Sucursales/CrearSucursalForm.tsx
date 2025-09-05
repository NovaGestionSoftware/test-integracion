import { useState } from "react";
import { useMercadoPagoStore } from "../../Store/MercadoPagoStore";
import { FaCheckCircle } from "react-icons/fa";

export default function CrearSucursalForm() {
  const store = useMercadoPagoStore();
  const {
    sucursales,
    setSucursales,
    setUltimaSucursalCreada,
  } = store;

  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();


  setCreating(true);
  setSuccessMsg(null);

  try {
    const cantidadActual = sucursales?.length || 0;
    const nuevoNumero = cantidadActual + 1;




    // Podrías setear como seleccionada automáticamente
    // store.setSucursalSeleccionada(data);
  } catch (err: any) {
    console.log(err.message || "Error al crear sucursal");
  } finally {
    setCreating(false);
  }
};


  return (
  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div>
        <label className="block text-sm font-medium text-gray-800">
          Nombre de la sucursal:
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={creating || !name}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {creating ? "Creando..." : "Crear sucursal"}
      </button>

      {successMsg && (
        <div className="flex items-center gap-2 text-green-600 text-sm mt-2">
          <FaCheckCircle className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}
    </form>
  );
}
