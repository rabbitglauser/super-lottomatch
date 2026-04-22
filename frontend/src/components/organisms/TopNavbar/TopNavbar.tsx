import NavActions from "@/components/molecules/NavActions/NavActions";

export default function TopNavbar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-white px-6">
      <span className="text-lg font-semibold text-gray-700">
        STV Event Manager
      </span>
      <NavActions />
    </header>
  );
}
