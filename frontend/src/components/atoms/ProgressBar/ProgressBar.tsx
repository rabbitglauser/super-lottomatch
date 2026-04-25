"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
}

export default function ProgressBar({ value, className }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setWidth(clamped));
    return () => cancelAnimationFrame(id);
  }, [clamped]);

  return (
    <div
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-accent-red-soft",
        className,
      )}
    >
      <div
        className="h-full rounded-full bg-accent-red transition-[width] duration-[1500ms] ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
