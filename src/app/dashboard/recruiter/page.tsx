import Link from "next/link";
import { redirect } from "next/navigation";

import { RecruiterDashboardClient } from "@/app/dashboard/recruiter/recruiter-clients";
import { Button } from "@/components/ui/button";
import { getCurrentDbUser } from "@/lib/current-user";
import { forge } from "@/lib/talentforge-design";

export const runtime = "nodejs";

export default async function RecruiterPage() {
  const user = await getCurrentDbUser();

  if (!user.role) {
    redirect("/onboarding");
  }

  return (
    <main className={forge.page}>
      <RecruiterTopNav />
      <RecruiterDashboardClient />
    </main>
  );
}

export function RecruiterTopNav() {
  return (
    <div className={forge.topNav}>
      <Link href="/" className="text-lg font-semibold tracking-tight">
        TalentForge AI
      </Link>
      <div className="flex flex-wrap justify-end gap-3">
        <Button asChild variant="outline" className={forge.secondaryButton}>
          <Link href="/dashboard/recruiter">AI Recruiter</Link>
        </Button>
        <Button asChild variant="outline" className={forge.secondaryButton}>
          <Link href="/dashboard/recruiter/upload">Upload</Link>
        </Button>
        <Button asChild variant="outline" className={forge.secondaryButton}>
          <Link href="/dashboard/recruiter/report">Reports</Link>
        </Button>
        <Button asChild variant="outline" className={forge.secondaryButton}>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
