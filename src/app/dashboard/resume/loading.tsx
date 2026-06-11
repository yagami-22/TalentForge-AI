import { DashboardSkeleton } from "@/app/dashboard/dashboard-production";

export default function ResumeLoading() {
  return <DashboardSkeleton label="Resume Intelligence" chartCount={3} />;
}
