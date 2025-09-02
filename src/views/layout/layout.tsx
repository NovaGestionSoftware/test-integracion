import { useState } from "react";
import { Outlet } from "react-router";
import SideBar from "../sidebar/Sidebar";

export default function Layout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen h-full flex flex-col  bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300">
      <SideBar open={open} setOpen={setOpen} />
      <div
        className="flex flex-col w-full min-h-screen  
        px-24 transition-all duration-300 bg-layout relative"
      >
        <div className="relative z-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
