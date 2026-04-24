import DesktopDashboardTemplate from "@/components/templates/DesktopDashboardTemplate";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DesktopDashboardTemplate>{children}</DesktopDashboardTemplate>;
}
