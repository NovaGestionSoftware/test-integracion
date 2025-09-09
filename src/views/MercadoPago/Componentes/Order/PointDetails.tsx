import { memo } from "react";
import type { OrderPointConfig } from "../../../types";
import { InfoRow } from "../../../Componentes/Layout/InfoRow";

type PointDetailsProps = {
  point?: OrderPointConfig;
};

export const PointDetails = memo(({ point }: PointDetailsProps) => {
  if (!point) return null;
  return (
    <>
      <InfoRow label="Terminal">{point.terminal_id ?? "—"}</InfoRow>
      <InfoRow label="Ticket #">{point.ticket_number ?? "—"}</InfoRow>
      <InfoRow label="Impresión" spanFull>
        {String(point.print_on_terminal ?? "—")}
      </InfoRow>
    </>
  );
});
