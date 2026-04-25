import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

type RevealVariant = "up" | "left" | "right" | "scale";

interface PageRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  variant?: RevealVariant;
}

const variantClassNames: Record<RevealVariant, string> = {
  up: "dashboard-reveal-up",
  left: "dashboard-reveal-left",
  right: "dashboard-reveal-right",
  scale: "dashboard-reveal-scale",
};

export default function PageReveal({
  children,
  className,
  delay = 0,
  duration = 460,
  variant = "up",
}: PageRevealProps) {
  const style = {
    "--reveal-delay": `${delay}ms`,
    "--reveal-duration": `${duration}ms`,
  } as CSSProperties;

  return (
    <div
      className={cn("dashboard-reveal", variantClassNames[variant], className)}
      style={style}
    >
      {children}
    </div>
  );
}
