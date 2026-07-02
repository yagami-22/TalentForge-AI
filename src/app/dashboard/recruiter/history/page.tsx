import { redirect } from "next/navigation";

import { RecruiterTopNav } from "@/app/dashboard/recruiter/page";
import { RecruiterHistoryClient } from "@/app/dashboard/recruiter/recruiter-clients";
import { getCurrentDbUser } from "@/lib/current-user";
import { forge } from "@/lib/talentforge-design";

export const runtime = "nodejs";

export default async function RecruiterHistoryPage() {
  const user = await getCurrentDbUser();

  if (!user.role) {
    redirect("/onboarding");
  }

  return (
    <main className={forge.page}>
      <RecruiterTopNav />
      <RecruiterHistoryClient />
    </main>
  );
}
