import { FaThumbtack } from "react-icons/fa";

interface ThumbtackButtonProps {
  isSidebarOpen: boolean;
  isPinned: boolean;
  hoveringArrow: boolean;
  setHoveringArrow: (value: boolean) => void;
  onClick: () => void;
}

export default function ThumbtackButton({
  isSidebarOpen,
  isPinned,
  hoveringArrow,
  setHoveringArrow,
  onClick,
}: ThumbtackButtonProps) {
  return (
    <div className="flex justify-end left-1 h-5">
      <div
        onMouseEnter={() => setHoveringArrow(true)}
        onMouseLeave={() => setHoveringArrow(false)}
        onClick={onClick}
        className={`cursor-pointer transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"}
          ${hoveringArrow || isPinned ? "text-yellow-400" : "text-white"}`}
        style={{ transformOrigin: "center center" }}
      >
        <FaThumbtack
          className={`w-6 h-5 pt-1 mt-0.5 transition-all duration-300 ease-in-out
            ${isPinned ? "scale-90 text-yellow-400" : ""}
            ${hoveringArrow && !isPinned ? "scale-105 text-yellow-400" : ""}`}
        />
      </div>
    </div>
  );
}
