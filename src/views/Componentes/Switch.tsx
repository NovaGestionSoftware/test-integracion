import React from "react";

interface SwitchEntornoProps {
  label: string;
  valueOn: string;
  valueOff: string;
  isChecked: boolean;
  onToggle: () => void;
  className?: string;
}

const SwitchGenerico: React.FC<SwitchEntornoProps> = ({
  label,
  valueOn,
  valueOff,
  isChecked,
  onToggle,
  className
}) => {
  return (
<div className={`flex items-center gap-3  ${className}`}>
  <span className="font-semibold min-w-[70px]  text-left">{label}:</span>
  <span className="text-sm w-auto  text-right ">
    {isChecked ? valueOn : valueOff}
  </span>
  <button
    onClick={onToggle}
    className={`w-11 h-6 flex items-center rounded-full p-1 duration-300 ${
      isChecked ? "bg-green-500" : "bg-blue-300"
    }`}
  >
    <div
      className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${
        isChecked ? "translate-x-5" : "translate-x-0"
      }`}
    />
  </button>
</div>

  );
};

export default SwitchGenerico;
