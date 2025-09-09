import SucursalesFetcher from "./Componentes/Sucursales/SucursalesFetcher";
import CajasFetcher from "./Componentes/Cajas/CajasFetcher";
import InspectorPanel from "./Componentes/Layout/InspectorPanel";
import OrderSection from "./Componentes/Order/OrderSection";

export default function MercadoPagoView() {
  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6  mb-44">
      <h1 className="text-2xl md:text-3xl font-semibold mb-4 flex items-center justify-start">
        Integración – Mercado Pago
      </h1>

      <SucursalesFetcher />
      <CajasFetcher />
      <OrderSection />
      <InspectorPanel />
    </div>
  );
}
