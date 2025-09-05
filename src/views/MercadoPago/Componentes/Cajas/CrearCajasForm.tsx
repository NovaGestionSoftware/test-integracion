import { useState } from "react";
import { useMercadoPagoStore } from "../../Store/MercadoPagoStore";
import { FaCheckCircle } from "react-icons/fa";

export default function CrearCajaForm() {
  const store = useMercadoPagoStore();
  const {
    cajas,
    setCajas,
    setUltimaCajaCreada,
    setLoadingCajas,
    isLoadingCajas,
    sucursalSeleccionada,
  } = store;

  const [name, setName] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // if (!sucursalSeleccionada?.external_id || !sucursalSeleccionada.id) {
  //   return (
  //     <p className="text-sm text-yellow-600">
  //       Seleccioná una sucursal para crear la caja.
  //     </p>
  //   );
  // }

  const normalizarCaja = (caja: any) => ({
    id: caja.id,
    name: caja.name,
    store_id: caja.store_id || caja.external_store_id || "",
    external_id: caja.external_id || "",
    fixed_amount: caja.fixed_amount ?? false,
    qr: caja.qr || null,
    status: caja.status || "",
    site: caja.site || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingCajas(true);
    setSuccessMsg(null);

    try {
      const existingCount = cajas?.length || 0;
      // const external_id = `${sucursalSeleccionada.external_id}POS${String(
      //   newPosNumber
      // ).padStart(3, "0")}`;

      // const payload = {
      //   name,
      //   fixed_amount: false,
      //   store_id: Number(sucursalSeleccionada.id),
      //   external_store_id: sucursalSeleccionada.external_id,
      //   external_id,
      //   category: 621102,
      // };

      // const data = await MercadoPagoService.crearCaja(payload);
      // const cajaNormalizada = normalizarCaja(data);

      // setUltimaCajaCreada(cajaNormalizada);
      // setCajas([...(cajas ?? []), cajaNormalizada]);
      // setSuccessMsg(`Caja creada: ${cajaNormalizada.name}`);
      // setName("");
    } catch (err: any) {
      // setError?.(err.message || "Error al crear caja");
    } finally {
      setLoadingCajas(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-3/4 ">
      <div>
        <label className="block text-sm font-medium text-gray-800">
          Nombre de la caja:
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full 
          border border-gray-300 rounded-md 
          px-3 py-2 text-sm focus:outline-none 
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={isLoadingCajas || !name}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {isLoadingCajas ? "Creando..." : "Crear caja"}
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
