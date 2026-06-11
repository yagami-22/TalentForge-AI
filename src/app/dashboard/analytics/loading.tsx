import { DashboardSkeleton } from "@/app/dashboard/dashboard-production";

export default function AnalyticsLoading() {
  return <DashboardSkeleton label="Analytics" chartCount={4} listCount={3} />;
}
