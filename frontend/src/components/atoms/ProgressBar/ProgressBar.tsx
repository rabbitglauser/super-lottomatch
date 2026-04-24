import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
}

export default function ProgressBar({ value, className }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-accent-red-soft",
        className,
      )}
    >
      <div
        className="h-full rounded-full bg-accent-red transition-all"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
