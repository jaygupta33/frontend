import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return <DashboardSidebar>{children}</DashboardSidebar>;
};
export default DashboardLayout;
