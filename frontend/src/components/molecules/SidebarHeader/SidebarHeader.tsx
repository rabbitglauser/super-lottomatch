import { CircleUser } from "lucide-react";

export default function SidebarHeader() {
  return (
    <div className="flex items-center gap-3 px-4 py-5">
      <div className="flex size-9 items-center justify-center rounded-lg bg-brand text-white">
        <CircleUser className="size-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">Event Admin</p>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          STV Ennetbürgen
        </p>
      </div>
    </div>
  );
}
