import StatCard from "@/components/molecules/StatCard";
import { STATS } from "@/lib/dashboard-mock";
import { cn } from "@/lib/utils";

interface DashboardStatsProps {
  className?: string;
}

export default function DashboardStats({ className }: DashboardStatsProps) {
  return (
    <div className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {STATS.map((stat) => (
        <StatCard key={stat.label} stat={stat} />
      ))}
    </div>
  );
}
