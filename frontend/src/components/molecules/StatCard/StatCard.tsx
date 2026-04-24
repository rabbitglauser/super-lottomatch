import ProgressBar from "@/components/atoms/ProgressBar";
import type { DashboardStat } from "@/lib/dashboard-mock";

interface StatCardProps {
  stat: DashboardStat;
}

export default function StatCard({ stat }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(31,29,29,0.04)] ring-1 ring-black/5">
      <p className="text-xs font-semibold tracking-[0.14em] text-muted-warm uppercase">
        {stat.label}
      </p>

      {stat.variant === "delta" && (
        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-5xl font-semibold text-accent-red tabular-nums">
            {stat.value}
          </span>
          <span className="text-sm font-semibold text-accent-red">
            {stat.delta}
          </span>
        </div>
      )}

      {stat.variant === "progress" && (
        <div className="mt-4">
          <span className="text-5xl font-semibold text-charcoal tabular-nums">
            {stat.value}
          </span>
          <ProgressBar value={stat.progress} className="mt-4" />
        </div>
      )}

      {stat.variant === "status" && (
        <>
          <div className="mt-4 relative z-10">
            <p className="text-2xl font-semibold text-charcoal">{stat.value}</p>
            <p className="mt-1 text-sm text-muted-warm">{stat.subtitle}</p>
          </div>
          <stat.icon
            aria-hidden
            className="pointer-events-none absolute -right-4 -bottom-4 size-28 text-accent-red/10"
            strokeWidth={1.25}
          />
        </>
      )}
    </div>
  );
}
