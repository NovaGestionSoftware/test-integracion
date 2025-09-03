import { useState } from "react";

type Option = { value: string; label: string };

const SELECT_1_OPTIONS: Option[] = [
  { value: "542612176999", label: "2612176999" },
  { value: "543472581689", label: "3472581689" },
  { value: "542645326229", label: "2645326229" },
  { value: "543804797956", label: "3804797956" },
  { value: "541132551333", label: "1132551333" },
];

const SELECT_2_OPTIONS: Option[] = [
  { value: "verificacionphp", label: "verificacionphp" },
  { value: "recordatorio_turno", label: "recordatorio_turno" },
];

const API_ENDPOINT = `${import.meta.env.VITE_BASE_URL_PHP}/meta/enviaWsp.php`;

export default function WhatAppIntegrationView() {

  const [select1, setSelect1] = useState<string>("");
  const [select2, setSelect2] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isValid = select1.trim() !== "" && select2.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isValid) {
      setErrorMsg("Completá todos los campos.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        recipient: select1,
        template: select2,
      };

      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain;q=0.9,*/*;q=0.8",
        },
        body: JSON.stringify(payload),
      });

      // Leer SIEMPRE como texto y luego intentar JSON.parse
      const raw = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(raw);
      } catch {
        // no era JSON; nos quedamos con raw
      }

      if (!res.ok) {
        const detail =
          (data && (data.message || data.error)) ||
          (raw && raw.trim()) ||
          `Error ${res.status} - No se pudo completar la operación`;
        throw new Error(detail);
      }

      if (data && typeof data === "object") {
        console.log("✅ Data (JSON):", data);
      } else {
        console.log("📄 Respuesta (texto):", raw);
        // Si llega texto y necesita extraer ID, opcional:
        // const match = raw.match(/"id"\s*:\s*"([^"]+)"/);
        // if (match) setMessageId(match[1]);
      }

      setSuccessMsg("Enviado correctamente ✅");
    } catch (err: any) {
      setErrorMsg(err?.message || "Ocurrió un error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg p-8">
        <h2 className="mb-6 text-center text-2xl font-semibold text-gray-800">
          WhatsApp Integration
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Select 1 */}
          <div>
            <label
              htmlFor="select1"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Números de teléfono
            </label>
            <select
              id="select1"
              className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-800 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400"
              value={select1}
              onChange={(e) => setSelect1(e.target.value)}
              required
            >
              <option value="" disabled>
                Selecciona una opción
              </option>
              {SELECT_1_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Select 2 */}
          <div>
            <label
              htmlFor="select2"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Plantillas
            </label>
            <select
              id="select2"
              className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-800 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400"
              value={select2}
              onChange={(e) => setSelect2(e.target.value)}
              required
            >
              <option value="" disabled>
                Selecciona una opción
              </option>
              {SELECT_2_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Mensajes */}
          {errorMsg && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {successMsg}
            </div>
          )}


          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Enviando..." : "Enviar"}
          </button>
        </form>
      </div>
    </div>
  );
}
