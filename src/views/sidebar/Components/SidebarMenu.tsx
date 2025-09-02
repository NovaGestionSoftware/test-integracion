import type { MenuItem } from "../types";

interface SidebarMenuProps {
  Menus: MenuItem[];
  renderMenu: (menu: MenuItem) => React.ReactNode;
}

export default function SidebarMenu({ Menus, renderMenu }: SidebarMenuProps) {
  return (
    <ul className="flex flex-col flex-grow overflow-hidden w-full mt-3 ml-1">
      <div className="flex-grow overflow-y-auto ">
        {Menus.map((menu) => renderMenu(menu))}
      </div>
    </ul>
  );
}
