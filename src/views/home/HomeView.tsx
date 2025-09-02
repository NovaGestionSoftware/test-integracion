import  novaLogoSinFondo  from "./../../assets/novaIconSinFondo.png";
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center ">
        <img alt="logo" className="max-w-xs transition-all duration-500 transform hover:scale-110 hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] hover:filter "
         src={novaLogoSinFondo} />
        <p className="mb-2 text-xl text-slate-950">Portal de Gestión y Administración de Empresas.</p>
      </div>
    </div>
  );
}
