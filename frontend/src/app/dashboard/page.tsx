import DesktopDashboardHeader from "@/components/organisms/DesktopDashboardHeader";
import DesktopDashboardStats from "@/components/organisms/DesktopDashboardStats";
import DesktopEventDaysPanel from "@/components/organisms/DesktopEventDaysPanel";
import DesktopLiveUpdateBanner from "@/components/organisms/DesktopLiveUpdateBanner";
import DesktopQuickActions from "@/components/organisms/DesktopQuickActions";
import DesktopLocationCard from "@/components/molecules/DesktopLocationCard";
import PageReveal from "@/components/atoms/PageReveal";

export default function DashboardPage() {
  return (
    <div className="min-h-screen w-full bg-page-dashboard">
      <div className="w-full px-6 py-8 md:px-8 xl:px-10 xl:py-10">
        <DesktopDashboardHeader />
        <DesktopDashboardStats className="mt-10" />

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] xl:gap-10">
          <div className="flex flex-col gap-8">
            <DesktopQuickActions />
            <PageReveal delay={620} variant="up">
              <DesktopLiveUpdateBanner />
            </PageReveal>
          </div>
          <aside className="flex flex-col gap-6">
            <DesktopEventDaysPanel />
            <PageReveal delay={710} variant="right">
              <DesktopLocationCard />
            </PageReveal>
          </aside>
        </div>
      </div>
    </div>
  );
}
