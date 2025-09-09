import { memo } from "react";
import type { Order } from "../../../types";
import { InfoRow } from "../../../Componentes/Layout/InfoRow";
import { PointDetails } from "./PointDetails";

type DetailsGridProps = {
  order: Order;
  montoFromOrder?: string | number | null;
};

export const DetailsGrid = memo(({ order, montoFromOrder }: DetailsGridProps) => (
  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
    <InfoRow label="ID">{order.id ?? "—"}</InfoRow>
    <InfoRow label="Tipo">{order.type ?? "—"}</InfoRow>
    <InfoRow label="Moneda">{order.currency ?? "—"}</InfoRow>
    <InfoRow label="Monto">{montoFromOrder ?? "—"}</InfoRow>
    <InfoRow label="Creada">{order.created_date ?? "—"}</InfoRow>
    <InfoRow label="Actualizada">{order.last_updated_date ?? "—"}</InfoRow>

    <PointDetails point={order?.config?.point} />
  </div>
));
