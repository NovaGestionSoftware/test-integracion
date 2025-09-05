import { forwardRef } from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  id?: string;
  padding?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, padding = true, id, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        id={id}
        className={`${className} bg-white 
          ${padding ? "px-2 py-1" : ""}
           w-fit h-fit rounded overflow-hidden shadow-sm shadow-gray-600`}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
