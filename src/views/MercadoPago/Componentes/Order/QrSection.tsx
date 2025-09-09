import { memo } from "react";
import type { QrPayload } from "../../../types";

type QrSectionProps = {
  shouldShowQr: boolean;
  qrPayload: QrPayload;
};

export const QrSection = memo(({ shouldShowQr, qrPayload }: QrSectionProps) => {
  if (!shouldShowQr) return null;

  const isImg = qrPayload && (qrPayload.type === "image" || qrPayload.type === "image-url");
  const isText = qrPayload && qrPayload.type === "text";

  return (
    <div className="mt-4 rounded-lg border border-zinc-200 p-3 bg-zinc-50">
      <div className="mb-2 font-medium">Escaneá el QR para pagar</div>

      {isImg ? (
        <div className="flex items-center gap-4">
          <img
            src={(qrPayload as any).src}
            alt={(qrPayload as any).alt}
            className="w-44 h-44 rounded-md bg-white border"
          />
          {(qrPayload as any).qrCodeText && (
            <div className="text-xs text-zinc-600 break-all">
              <span className="font-medium">QR data:</span>{" "}
              {(qrPayload as any).qrCodeText}
            </div>
          )}
        </div>
      ) : isText ? (
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=264x264&data=${encodeURIComponent(
            (qrPayload as any).text
          )}`}
          alt="QR para pagar"
          className="w-44 h-44 rounded-md bg-white border"
        />
      ) : (
        <div className="text-xs text-amber-700">
          No se encontró la imagen del QR en la respuesta.
        </div>
      )}
    </div>
  );
});
