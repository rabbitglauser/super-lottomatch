"use client";

import QRCode from "react-qr-code";

export function GuestQRCode({ code }: { code: string }) {
  return (
    <div className="mx-auto mt-8 flex h-64 w-64 items-center justify-center rounded-lg bg-white p-4">
      <QRCode
        value={code}
        size={224}
        level="M"
        bgColor="#ffffff"
        fgColor="#111111"
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
}
