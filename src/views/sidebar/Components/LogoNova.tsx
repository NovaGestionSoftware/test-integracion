import logoNova from "./../../../assets/novalogo-normal.png"
interface LogoNovaProps {
  open: boolean;
}

export default function LogoNova({ open }: LogoNovaProps) {
  return (
    <div className="flex items-center justify-start w-full mt-2 ml-1 gap-1">
      <div className="flex justify-center items-center w-16 h-16 p-2 bg-white rounded-full shadow-md border border-gray-300 flex-shrink-0">
        <img
          width={200}
          height={200}
          src={logoNova}
          alt="Nova Logo"
          className="rounded-full w-full h-full object-contain"
        />
      </div>
      <div className={`overflow-hidden transition-all duration-500 min-w-0 ${open ? "max-w-[150px] opacity-100" : "max-w-0 opacity-0"}`}>
        <span className="text-slate-400 font-bold text-2xl whitespace-nowrap">NovaGestión</span>
      </div>
    </div>
  );
}
