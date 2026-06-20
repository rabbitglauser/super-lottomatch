"use client";

import { Download, Printer } from "lucide-react";

function safeFileName(value: string) {
  return value.replace(/[^a-z0-9-]+/gi, "_").toLowerCase();
}

export function ConfirmationActions({ code }: { code: string }) {
  const handleDownload = () => {
    const qrCode = document.querySelector<SVGElement>("[data-guest-qr] svg");

    if (!qrCode) {
      return;
    }

    const clone = qrCode.cloneNode(true) as SVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

    const blob = new Blob([new XMLSerializer().serializeToString(clone)], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `${safeFileName(code)}-qr-code.svg`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleDownload}
        className="mt-8 flex h-16 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#e12c39] to-[#b80018] text-xl font-extrabold text-white shadow-xl shadow-red-200"
      >
        <Download size={25} />
        Als Bild speichern
      </button>

      <button
        type="button"
        onClick={() => window.print()}
        className="mt-4 flex h-16 items-center justify-center gap-3 rounded-xl bg-[#eee7dc] text-xl font-extrabold"
      >
        <Printer size={25} />
        Drucken
      </button>
    </>
  );
}
