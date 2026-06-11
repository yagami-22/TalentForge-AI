import { DashboardSkeleton } from "@/app/dashboard/dashboard-production";

export default function InterviewLoading() {
  return <DashboardSkeleton label="Interview" chartCount={2} listCount={3} />;
}
