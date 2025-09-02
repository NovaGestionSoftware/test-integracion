import { useEffect, useRef, useState } from "react";

export const AnimatedOverflowText = ({ text }: { text: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);

useEffect(() => {
  const container = containerRef.current;
  const textEl = textRef.current;

  if (!container || !textEl || !text.length) return;

  const checkOverflow = () => {
    setShouldScroll(textEl.scrollWidth > container.clientWidth);
  };

  // Ejecutamos al inicio
  checkOverflow();

  // Observamos cambios en el tamaño del contenedor
  const resizeObserver = new ResizeObserver(() => {
    checkOverflow();
  });

  resizeObserver.observe(container);

  return () => {
    resizeObserver.disconnect();
  };
}, [text]);

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden group">
      <span
        ref={textRef}
        className={`inline-block whitespace-nowrap transition-transform ${
          shouldScroll ? "group-hover:animate-marquee" : ""
        }`}
      >
        {text}
      </span>

      {shouldScroll && (
        <span className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#081A51] to-transparent pointer-events-none opacity-100 transition-opacity duration-100 group-hover:opacity-0" />
      )}
    </div>
  );
};
