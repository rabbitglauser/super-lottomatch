"use client";

import type { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
}

export default function Button({
  children,
  type = "button",
  disabled = false,
  onClick,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="h-20 w-full rounded-3xl bg-brand text-2xl font-bold text-white shadow-[0_14px_30px_rgba(179,1,26,0.28)] transition hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-brand/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}
