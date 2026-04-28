import type { ReactNode } from "react";

interface LabelProps {
  htmlFor: string;
  children: ReactNode;
}

export default function Label({ htmlFor, children }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-center text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:mb-2 sm:text-sm"
    >
      {children}
    </label>
  );
}
