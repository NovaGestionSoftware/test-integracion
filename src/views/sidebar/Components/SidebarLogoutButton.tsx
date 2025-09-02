import { Link } from "react-router";
import { CiLogout } from "react-icons/ci";

interface SidebarLogoutButtonProps {
  open: boolean;
  onLogout: () => void;
}

export default function SidebarLogoutButton({ open, onLogout }: SidebarLogoutButtonProps) {
  return (
    <Link
      to="/"
      className="flex items-center gap-3 w-full duration-100 hover:translate-x-1 
      transition-all hover:scale-105"
      onClick={onLogout}
    >
      <div className="border bg-white rounded-full cursor-pointer w-8">
        <CiLogout className="w-6 h-8 font-extrabold" />
      </div>
      <span className={`transition-all duration-500 whitespace-nowrap overflow-hidden ${!open ? "max-w-0 opacity-0" : "max-w-full opacity-100 text-white text-lg"}`}>
        Salir
      </span>
    </Link>
  );
}
