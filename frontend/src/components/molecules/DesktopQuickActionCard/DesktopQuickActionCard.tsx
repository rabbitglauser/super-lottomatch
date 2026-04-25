import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface QuickActionCardProps {
  label: string;
  icon: LucideIcon;
  tone?: "light" | "red";
}

export default function DesktopQuickActionCard({
  label,
  icon: Icon,
  tone = "light",
}: QuickActionCardProps) {
  const isRed = tone === "red";

  return (
    <button
      type="button"
      className={cn(
        "group flex h-[120px] w-full flex-col items-center justify-center gap-3 rounded-2xl px-4 text-center transition-all duration-200",
        "hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-red/40",
        isRed
          ? "bg-gradient-to-br from-[#E12634] to-[#B80012] text-white shadow-[0_10px_30px_-10px_rgba(184,0,18,0.55)] hover:shadow-[0_16px_40px_-12px_rgba(184,0,18,0.65)]"
          : "bg-white text-charcoal shadow-[0_2px_12px_rgba(31,29,29,0.04)] ring-1 ring-black/5 hover:shadow-[0_10px_24px_-8px_rgba(31,29,29,0.12)]",
      )}
    >
      <span
        className={cn(
          "flex size-11 items-center justify-center rounded-full",
          isRed ? "bg-white/15" : "bg-accent-red-soft/70",
        )}
      >
        <Icon
          className={cn("size-5", isRed ? "text-white" : "text-accent-red")}
          strokeWidth={2}
        />
      </span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
