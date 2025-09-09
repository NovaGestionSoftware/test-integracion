import { memo } from "react";
import { Badge } from "../../../Componentes/Layout/Badge";

type StatusRowProps = {
  statusDetail?: string | null;
  status?: string | null;
  isPaidSuccess: boolean;
};

export const StatusRow = memo(({ statusDetail, status, isPaidSuccess }: StatusRowProps) => (
  <div className="flex flex-wrap items-center gap-2">
    <Badge title="status_detail">
      Estado detalle: <b>{statusDetail ?? "—"}</b>
    </Badge>
    <Badge title="status">
      Estado: <b>{status ?? "—"}</b>
    </Badge>
    {isPaidSuccess && (
      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
        ✅ Pago acreditado
      </Badge>
    )}
  </div>
));
