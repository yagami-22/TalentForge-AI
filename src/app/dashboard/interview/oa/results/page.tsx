import Link from "next/link";
import { redirect } from "next/navigation";

import { OAResultsClient } from "@/app/dashboard/interview/oa/results/oa-results-client";
import { Button } from "@/components/ui/button";
import { getCurrentDbUser } from "@/lib/current-user";
import { forge } from "@/lib/talentforge-design";

export const runtime = "nodejs";

export default async function OAResultsPage() {
  const user = await getCurrentDbUser();

  if (!user.role) {
    redirect("/onboarding");
  }

  return (
    <main className={forge.page}>
      <div className={forge.topNav}>
        <Link href="/" className="text-lg font-semibold tracking-tight">
          TalentForge AI
        </Link>
        <div className="flex flex-wrap justify-end gap-3">
          <Button asChild variant="outline" className={forge.secondaryButton}>
            <Link href="/dashboard/interview">New Assessment</Link>
          </Button>
          <Button asChild variant="outline" className={forge.secondaryButton}>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>

      <section className="mx-auto w-full max-w-7xl py-10 lg:py-12">
        <OAResultsClient />
      </section>
    </main>
  );
}
