import { memo } from "react";
import { StatusRow } from "./StatusRow";
import { DetailsGrid } from "./DetailsGrid";
import { QrSection } from "./QrSection";
import type { Order, QrPayload } from "../../../types";

type OrderPanelProps = {
  currentOrder: Order;
  statusDetail?: string | null;
  isPaidSuccess: boolean;
  montoFromOrder?: string | number | null;
  shouldShowQr: boolean;
  qrPayload: QrPayload;
  className?: string;
};

export const OrderPanel = memo(
  ({
    currentOrder,
    statusDetail,
    isPaidSuccess,
    montoFromOrder,
    shouldShowQr,
    qrPayload,
    className,
  }: OrderPanelProps) => {
    return (
      <div
        className={`mt-2 rounded-xl border border-zinc-200 p-3 text-sm bg-white ${
          className ?? ""
        }`}
      >
        <StatusRow
          statusDetail={statusDetail ?? undefined}
          status={currentOrder.status ?? undefined}
          isPaidSuccess={isPaidSuccess}
        />

        <DetailsGrid order={currentOrder} montoFromOrder={montoFromOrder} />

        <QrSection shouldShowQr={shouldShowQr} qrPayload={qrPayload} />
      </div>
    );
  }
);
