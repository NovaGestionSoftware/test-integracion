import { RouterProvider, createBrowserRouter, Navigate } from "react-router";
import Layout from "./views/layout/layout";
import DashboardView from "./views/dashboard/DashboardView";
import WhatAppIntegrationView from "./views/whatsapp/WhatAppIntegrationView";
import Home from "./views/home/HomeView";
import FacturaElectronicaView from "./views/FacturaElectronica/FacturaElectronicaView";
import MercadoPagoView from "./views/MercadoPago/MercadoPagoView";
import CloverView from "./views/Clover/CloverView";
import ControladorFiscalView from "./views/ControladorFiscal/ControladorFiscalView";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/home" replace /> },
      { path: "home", element: <Home /> },
      { path: "dashboard", element: <DashboardView /> },
      { path: "wpp", element: <WhatAppIntegrationView /> },
      { path: "fac-elec", element: <FacturaElectronicaView /> },
      { path: "mp", element: <MercadoPagoView /> },
      { path: "clover", element: <CloverView /> },
      { path: "cf", element: <ControladorFiscalView /> },
      // 404 para rutas dentro del layout fac-elec
      { path: "*", element: <div style={{ padding: 24 }}>404</div> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
