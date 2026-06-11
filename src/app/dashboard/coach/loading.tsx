import { DashboardSkeleton } from "@/app/dashboard/dashboard-production";

export default function CareerCoachLoading() {
  return <DashboardSkeleton label="Career Coach" chartCount={2} listCount={3} />;
}
