"use client";

import { useEffect, useState } from "react";

import DesktopDashboardHeader from "@/components/organisms/DesktopDashboardHeader";
import DesktopDashboardStats from "@/components/organisms/DesktopDashboardStats";
import DesktopEventDaysPanel from "@/components/organisms/DesktopEventDaysPanel";
import DesktopLiveUpdateBanner from "@/components/organisms/DesktopLiveUpdateBanner";
import DesktopQuickActions from "@/components/organisms/DesktopQuickActions";
import DesktopLocationCard from "@/components/molecules/DesktopLocationCard";
import PageReveal from "@/components/atoms/PageReveal";
import { fetchDashboardData, type DashboardData } from "@/lib/api";

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData()
      .then(setDashboardData)
      .catch(() => setError("Dashboard-Daten konnten nicht geladen werden."));
  }, []);

  if (error) {
    return (
      <div className="min-h-screen w-full bg-page-dashboard px-6 py-8 text-charcoal">
        {error}
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen w-full bg-page-dashboard px-6 py-8 text-charcoal">
        Daten werden geladen...
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-page-dashboard">
      <div className="w-full px-6 py-8 md:px-8 xl:px-10 xl:py-10">
        <DesktopDashboardHeader />
        <DesktopDashboardStats stats={dashboardData.stats} className="mt-10" />

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] xl:gap-10">
          <div className="flex flex-col gap-8">
            <DesktopQuickActions />
            <PageReveal delay={620} variant="up">
              <DesktopLiveUpdateBanner liveUpdate={dashboardData.liveUpdate} />
            </PageReveal>
          </div>
          <aside className="flex flex-col gap-6">
            <DesktopEventDaysPanel eventDays={dashboardData.eventDays} />
            <PageReveal delay={710} variant="right">
              <DesktopLocationCard location={dashboardData.location} />
            </PageReveal>
          </aside>
        </div>
      </div>
    </div>
  );
}
