import { RouterProvider, createBrowserRouter, Navigate } from "react-router";
import Layout from "./views/layout/layout";
import DashboardView from "./views/dashboard/DashboardView";
import WhatAppIntegrationView from "./views/whatsapp/WhatAppIntegrationView";
import Home from "./views/home/HomeView";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/home" replace /> },
      { path: "home", element: <Home /> },
      { path: "dashboard", element: <DashboardView /> },
      { path: "wpp", element: <WhatAppIntegrationView /> },
      // 404 para rutas dentro del layout
      { path: "*", element: <div style={{ padding: 24 }}>404</div> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
