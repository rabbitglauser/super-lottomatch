import DashboardTemplate from "@/components/templates/DashboardTemplate";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardTemplate>{children}</DashboardTemplate>;
}
