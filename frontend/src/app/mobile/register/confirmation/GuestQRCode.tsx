"use client";

import QRCode from "react-qr-code";

export function GuestQRCode({ code }: { code: string }) {
  return (
    <div
      data-guest-qr
      className="mx-auto mt-8 flex h-72 w-72 items-center justify-center rounded-xl bg-white p-8 shadow-[0_12px_28px_rgba(35,31,32,0.08)] ring-1 ring-[#f0e1e3]"
    >
      <QRCode
        value={code}
        size={224}
        level="Q"
        bgColor="#ffffff"
        fgColor="#111111"
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
}
