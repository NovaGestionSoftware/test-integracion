import type { JSX } from "react";

interface SubMenuItem {
  title: string;
  icon?: JSX.Element;
  href?: string;
  submenus?: SubMenuItem[];
  orden?: number;
}

export type MenuItem = SubMenuItem;