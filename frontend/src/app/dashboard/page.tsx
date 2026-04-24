import DashboardHeader from "@/components/organisms/DashboardHeader";
import DashboardStats from "@/components/organisms/DashboardStats";
import EventDaysPanel from "@/components/organisms/EventDaysPanel";
import LiveUpdateBanner from "@/components/organisms/LiveUpdateBanner";
import QuickActions from "@/components/organisms/QuickActions";
import LocationCard from "@/components/molecules/LocationCard";

export default function DashboardPage() {
  return (
    <div className="min-h-full bg-page-dashboard">
      <div className="mx-auto max-w-[1500px] px-6 py-10 lg:px-10 lg:py-12">
        <DashboardHeader />
        <DashboardStats className="mt-10" />

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
          <div className="flex flex-col gap-8">
            <QuickActions />
            <LiveUpdateBanner />
          </div>
          <aside className="flex flex-col gap-6">
            <EventDaysPanel />
            <LocationCard />
          </aside>
        </div>
      </div>
    </div>
  );
}
