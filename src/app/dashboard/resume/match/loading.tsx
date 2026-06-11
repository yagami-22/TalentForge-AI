import { DashboardSkeleton } from "@/app/dashboard/dashboard-production";

export default function JDMatchLoading() {
  return <DashboardSkeleton label="JD Match" chartCount={2} listCount={3} />;
}
