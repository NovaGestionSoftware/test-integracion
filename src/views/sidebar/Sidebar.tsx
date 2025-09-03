import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Link, useLocation } from "react-router";
import type { MenuItem } from "./types";
import ResizableHandle from "./Components/ResizableHandle";
import SidebarMenu from "./Components/SidebarMenu";
import LogoNova from "./Components/LogoNova";
import ThumbtackButton from "./Components/ThumbtackButton";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { AnimatedOverflowText } from "./Components/AnimatedOverflowText";
import { BsWhatsapp } from "react-icons/bs";
import { TiHome } from "react-icons/ti";
import { FaFileInvoiceDollar } from "react-icons/fa";
type SideBarProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

export default function SideBar({ open, setOpen }: SideBarProps) {
  const location = useLocation();
  const [isPinned, setIsPinned] = useState(false);
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  const [sidebarWidth, setSidebarWidth] = useState(open ? 224 : 240); // ancho en px
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const [hoveringArrow, setHoveringArrow] = useState(false);

  const Menus: MenuItem[] = [
    {
      title: "Home",
      href: "/home",
      icon: <TiHome />,
      orden: 1,
    },
    {
      title: "WhatsApp",
      href: "/wpp",
      icon: <BsWhatsapp />,
      orden: 2,
    },
       {
      title: "Factura Electronica",
      href: "/fac-elec",
      icon: <FaFileInvoiceDollar />,
      orden: 3,
    },
  ];

  // Función para alternar el estado de un menú desplegable
  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title], // Alternar el estado del menú
    }));
  };

  const isMenuActive = (menu: MenuItem) => {
    if (menu.href === location.pathname) return true;
    if (!menu.submenus) return false;

    return menu.submenus.some(
      (submenu) =>
        submenu.href === location.pathname ||
        (submenu.submenus &&
          submenu.submenus.some((subsub) => subsub.href === location.pathname))
    );
  };

  const renderMenu = (menu: MenuItem) => {
    const isOpen = openMenus[menu.title];

    return (
      <li key={menu.title}>
        {menu.href ? (
          <Link
            to={menu.href}
            className={`flex items-center text-white text-sm gap-x-2 cursor-pointer p-2 pr-4 rounded-l-md rounded-r-none mt-0.5 hover:bg-[#FFFFFF2B] hover:-translate-y-0.5 duration-300 overflow-hidden 2xl:text-base ${
              location.pathname === menu.href
                ? "bg-[#FFFFFF2B] -translate-y-0.5"
                : ""
            }`}
          >
            <span
              className={`duration-300 ${
                location.pathname === menu.href ? "scale-110" : ""
              }`}
            >
              {menu.icon}
            </span>
            <span
              className={`block transition-all duration-500 whitespace-nowrap overflow-hidden ${
                !open ? "max-w-0 opacity-0" : "max-w-full opacity-100"
              }`}
            >
              {menu.title}
            </span>
          </Link>
        ) : (
          <div
            className={`flex items-center text-white text-sm gap-x-2 p-2 pr-3 rounded-l-md rounded-r-none mt-0.5 hover:bg-[#FFFFFF2B] hover:-translate-y-0.5 duration-300 overflow-hidden cursor-pointer 2xl:text-base  ${
              isMenuActive(menu) ? "bg-[#FFFFFF2B] -translate-y-0.5" : ""
            }`}
            onClick={() => toggleMenu(menu.title)}
          >
            <span
              className={`duration-300 ${
                menu.submenus?.some(
                  (submenu) => submenu.href === location.pathname
                )
                  ? "scale-110"
                  : ""
              }`}
            >
              {menu.icon}
            </span>
            <span
              className={`block transition-all duration-500 whitespace-nowrap overflow-hidden ${
                !open ? "max-w-0 opacity-0" : "max-w-full opacity-100"
              }`}
            >
              {menu.title}
            </span>
            {menu.submenus &&
              open && ( // Mostrar flecha solo si el menú está abierto
                <span className="ml-auto text-xs 2xl:text-base">
                  {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              )}
          </div>
        )}

        {/* Renderizar submenús si el menú está desplegado */}
        {menu.submenus &&
          isOpen &&
          open && ( // Solo renderizar submenús si el SideBar está abierto
            <ul className="pl-4 ">
              {menu.submenus.map((submenu) => (
                <p key={submenu.title} style={{ fontSize: "10px" }}>
                  {submenu.submenus ? (
                    renderMenu(submenu)
                  ) : (
                    <Link
                      to={submenu.href ?? "#"}
                      className={`text-white text-sm flex items-center gap-x-2 cursor-pointer p-2 pl-4 rounded-l-md rounded-r-none mt-0.5 hover:bg-[#FFFFFF2B] hover:-translate-y-0.5 duration-300 overflow-hidden ${
                        submenu.href === location.pathname
                          ? "bg-[#FFFFFF2B] -translate-y-0.5"
                          : ""
                      }`}
                    >
                      <span
                        className={`duration-300 ${
                          submenu.href === location.pathname ? "scale-110" : ""
                        }`}
                      >
                        {submenu.icon}
                      </span>

                      <AnimatedOverflowText text={submenu.title} />
                    </Link>
                  )}
                </p>
              ))}
            </ul>
          )}
      </li>
    );
  };

  const isSidebarOpen = open || isPinned;

  const handleMouseEnter = () => {
    if (!isPinned) setOpen(true);
  };

  const handleMouseLeave = () => {
    if (!isPinned) setOpen(false);
  };
  const handleThumbtack = () => {
    const newPinnedState = !isPinned;
    setIsPinned(newPinnedState);
    //  setOpen(newPinnedState); // Si se fija abierto, también se abre
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current || !isPinned) return;
      e.preventDefault();
      const newWidth = e.clientX;
      if (newWidth > 120 && newWidth < 400) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto"; // habilitar selección otra vez
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isPinned]);

  return (
    <div
      ref={sidebarRef}
      style={{ width: `${isSidebarOpen ? sidebarWidth : 80}px` }}
      className="fixed top-0 left-0 z-50 h-full 
      border-r border-r-slate-400 
      bg-gradient-to-b from-slate-900 
      to-[#081A51] transition-all duration-300 ease-out overflow-hidden
             grid grid-rows-[0.2fr_1fr_0.1fr]
  grid-cols-1"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Parte superior: info del usuario */}
      <div className="px-2 pt-2">
        <ThumbtackButton
          isSidebarOpen={isSidebarOpen}
          isPinned={isPinned}
          hoveringArrow={hoveringArrow}
          setHoveringArrow={setHoveringArrow}
          onClick={handleThumbtack}
        />

        <LogoNova open={open} />

        <hr className="w-full border-t border-gray-700 mt-4" />

        <hr className="w-full border-t border-gray-700" />
      </div>

      <div className="overflow-y-auto scrollbar-custom  overflow-x-hidden px-2">
        <SidebarMenu Menus={Menus} renderMenu={renderMenu} />
      </div>
      {isPinned && (
        <ResizableHandle
          onStartResize={() => {
            isResizing.current = true;
            document.body.style.userSelect = "none";
            document.body.style.cursor = "ew-resize";
          }}
        />
      )}
    </div>
  );
}
