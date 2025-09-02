interface ResizableHandleProps {
  onStartResize: () => void;
}

export default function ResizableHandle({ onStartResize }: ResizableHandleProps) {
  return (
    <div
      className="absolute top-0 right-0 h-full w-2 cursor-col-resize z-50"
      onMouseDown={() => {
        onStartResize();
        document.body.style.userSelect = "none";
        document.body.style.cursor = "ew-resize";
      }}
    />
  );
}
