import { DashboardSkeleton } from "@/app/dashboard/dashboard-production";

export default function ATSLoading() {
  return <DashboardSkeleton label="ATS Optimizer" chartCount={2} listCount={3} />;
}
