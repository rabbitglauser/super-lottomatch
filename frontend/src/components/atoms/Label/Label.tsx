import type { ReactNode } from "react";

interface LabelProps {
  htmlFor: string;
  children: ReactNode;
}

export default function Label({ htmlFor, children }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-3 block text-center text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground"
    >
      {children}
    </label>
  );
}
