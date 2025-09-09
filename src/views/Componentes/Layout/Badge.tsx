import { memo } from "react";
import type { PropsWithChildren } from "react";

type BadgeProps = {
  title?: string;
  className?: string;
};
export const Badge = memo(({ title, className, children }: PropsWithChildren<BadgeProps>) => (
  <span
    title={title}
    className={`text-xs px-2 py-0.5 rounded-full border ${className ?? ""}`}
  >
    {children}
  </span>
));
