"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  value: number;
  durationMs?: number;
  className?: string;
}

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

export default function AnimatedCounter({
  value,
  durationMs = 1400,
  className,
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(0);

  useEffect(() => {
    if (!Number.isFinite(value)) {
      setDisplay(0);
      return;
    }
    fromRef.current = display;
    startRef.current = null;
    let raf = 0;
    const step = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      const t = Math.min(1, elapsed / durationMs);
      const next = fromRef.current + (value - fromRef.current) * ease(t);
      setDisplay(t === 1 ? value : next);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, durationMs]);

  return (
    <span className={className}>
      {Math.round(display).toLocaleString("de-CH")}
    </span>
  );
}
