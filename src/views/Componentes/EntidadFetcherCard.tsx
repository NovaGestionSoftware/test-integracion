import { useState } from "react";
import { FaSyncAlt } from "react-icons/fa";
import { Card } from "./Card";
import RefreshButton from "./RefreshButton";
import SwitchGenerico from "./Switch";

interface EntidadBase {
  id: string | number;
  name: string;
}

type Props<T extends EntidadBase> = {
  titulo: string;
  items: T[] | null;
  itemSeleccionado: T | null;
  onSeleccionarItem: (item: T) => void;
  mostrarFormulario: boolean;
  toggleMostrarFormulario: () => void;
  FormularioComponente?: React.ReactNode;
  sinResultadosTexto?: string;
  onRetry?: () => void;
  mostrarRetry?: boolean;
  botonCrearTexto?: string;
  renderItem?: (
    item: T,
    isSelected: boolean,
    onSelect: () => void
  ) => React.ReactNode;

  /** Mostrar respuesta cruda */
  responseRaw?: unknown;

  /** Switch control no-controlado / controlado */
  defaultShowResponse?: boolean;
  showResponse?: boolean;
  onToggleShowResponse?: (show: boolean) => void;

  /** Refresh explícito (fallback a onRetry si no viene) */
  onRefresh?: () => void;

  /** Loading dentro de la card */
  isLoading?: boolean;
  loadingMessage?: string;

  /** Ancho fijo de la columna izquierda (no se deforma al abrir/cerrar respuesta) */
  leftFixedWidthClass?: string; // ej: "w-full md:w-[520px]"
};

export function EntidadFetcherCard<T extends EntidadBase>({
  titulo,
  items,
  itemSeleccionado,
  onSeleccionarItem,

  sinResultadosTexto,
  onRetry,
  mostrarRetry = false,

  renderItem,
  responseRaw,
  defaultShowResponse = false,
  showResponse,
  onToggleShowResponse,
  onRefresh,
  isLoading = false,
  loadingMessage = "Cargando…",
  leftFixedWidthClass = "w-full md:w-[420px]", // <- default: fijo en md+
}: Props<T>) {
  const [internalShow, setInternalShow] =
    useState<boolean>(defaultShowResponse);
  const isControlled = typeof showResponse === "boolean";
  const isShown = isControlled ? (showResponse as boolean) : internalShow;

  const tieneItems = !!items && items.length > 0;

  const setShown = (next: boolean) => {
    if (isControlled) onToggleShowResponse?.(next);
    else setInternalShow(next);
  };

  const handleRefresh = () => {
    if (onRefresh) return onRefresh();
    if (onRetry) return onRetry();
  };

  // Alturas parejas y scroll en ambas columnas
  const contentScrollClass = "min-h-[12rem] max-h-60 overflow-auto";

  return (
    <Card
      padding={false}
      className="p-6 h-full min-h-[260px] min-w-[205px] flex flex-col rounded-lg shadow bg-white"
    >
      {/* Barra de acciones */}
      <div className="flex items-center gap-3 mb-3">
        <SwitchGenerico
          className=""
          label="Respuesta"
          valueOff="Oculto"
          valueOn="Visible"
          isChecked={isShown}
          onToggle={() => setShown(!isShown)}
        />
        <RefreshButton handleRefresh={handleRefresh} />
      </div>

      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-green-700 text-sm font-medium">{titulo}</p>
      </div>

      {/* Layout: izquierda fija, derecha flexible */}
      <div className="flex gap-4 items-stretch">
        {/* Columna izquierda: ancho fijo, NO cambia con el switch */}
        <div className={`flex-none ${leftFixedWidthClass} flex flex-col`}>
          {isLoading ? (
            <div className="flex-1 flex flex-col gap-3">
              <p className="text-sm text-gray-600">{loadingMessage}</p>
              <div className={`${contentScrollClass}`} />
            </div>
          ) : tieneItems ? (
            <>
              <div className="space-y-4">
                <div
                  className={`space-y-2 p-1 rounded-sm border noneScroll ${contentScrollClass}`}
                >
                  {items!.map((item) => {
                    const isSelected = itemSeleccionado?.id === item.id;
                    const handleSelect = () => onSeleccionarItem(item);

                    return renderItem ? (
                      <div key={item.id}>
                        {renderItem(item, isSelected, handleSelect)}
                      </div>
                    ) : (
                      <label
                        key={item.id}
                        className="flex items-center space-x-2 text-sm text-gray-800"
                      >
                        <input
                          type="radio"
                          name="entidad"
                          value={item.id}
                          checked={isSelected}
                          onChange={handleSelect}
                          className="form-radio text-blue-600"
                        />
                        <span>{item.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* <div className="mt-auto space-y-4 pt-4">
                <button
                  onClick={toggleMostrarFormulario}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition"
                >
                  <FaPlusCircle className="w-4 h-4" />
                  {mostrarFormulario ? "Ocultar formulario" : botonCrearTexto}
                </button>

                {mostrarFormulario && FormularioComponente}
              </div> */}
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-yellow-700 text-sm">{sinResultadosTexto}</p>

              {/* {FormularioComponente} */}

              {(onRetry || onRefresh) && mostrarRetry && (
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-2 px-3 py-1 text-blue-600 border border-blue-500 rounded-md text-sm hover:bg-blue-50 transition"
                >
                  <FaSyncAlt className="w-4 h-4" />
                  Intentar nuevamente
                </button>
              )}
            </div>
          )}
        </div>

        {/* Columna derecha: panel de respuesta (ocupa el resto) */}
        {isShown && (
          <div className="flex-1 max-w-2xs">
            <div
              className={`bg-zinc-50 rounded-md p-3 border border-zinc-200 ${contentScrollClass}`}
            >
              <pre className="text-xs whitespace-pre-wrap">
                {responseRaw != null
                  ? JSON.stringify(responseRaw, null, 2)
                  : "—"}
              </pre>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
