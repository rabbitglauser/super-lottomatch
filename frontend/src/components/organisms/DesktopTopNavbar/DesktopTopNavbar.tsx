import DesktopNavActions from "@/components/molecules/DesktopNavActions";

export default function DesktopTopNavbar() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-border bg-white px-8">
      <span className="text-xl font-semibold text-gray-700">
        STV Event Manager
      </span>
      <DesktopNavActions />
    </header>
  );
}
