import StatusPill from "@/components/atoms/StatusPill";

export default function DesktopDashboardHeader() {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight text-charcoal sm:text-5xl">
          Dashboard
        </h1>
        <p className="mt-2 text-base text-muted-warm">
          Willkommen zurück in der STV Event-Verwaltung.
        </p>
      </div>
      <StatusPill label="Event aktiv" />
    </header>
  );
}
