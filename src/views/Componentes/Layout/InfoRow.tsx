import type { PropsWithChildren } from "react";
import { memo } from "react";

type InfoRowProps = {
  label: string;
  spanFull?: boolean; 
};
export const InfoRow = memo(
  ({ label, spanFull, children }: PropsWithChildren<InfoRowProps>) => (
    <div className={spanFull ? "sm:col-span-2" : ""}>
      <span className="text-zinc-500">{label}:</span>{" "}
      <span className="break-all">{children ?? "—"}</span>
    </div>
  )
);
