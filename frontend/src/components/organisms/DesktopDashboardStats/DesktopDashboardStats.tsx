import PageReveal from "@/components/atoms/PageReveal";
import DesktopStatCard from "@/components/molecules/DesktopStatCard";
import { STATS } from "@/lib/dashboard-mock";
import { cn } from "@/lib/utils";

interface DashboardStatsProps {
  className?: string;
}

export default function DesktopDashboardStats({ className }: DashboardStatsProps) {
  return (
    <div className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {STATS.map((stat, index) => (
        <PageReveal
          key={stat.label}
          delay={180 + index * 80}
          variant="up"
          className="h-full"
        >
          <DesktopStatCard stat={stat} />
        </PageReveal>
      ))}
    </div>
  );
}
