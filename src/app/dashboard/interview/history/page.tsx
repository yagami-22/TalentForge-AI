import Link from "next/link";
import { redirect } from "next/navigation";

import { InterviewHistoryClient } from "@/app/dashboard/interview/history/interview-history-client";
import { Button } from "@/components/ui/button";
import { getCurrentDbUser } from "@/lib/current-user";
import { forge } from "@/lib/talentforge-design";

export const runtime = "nodejs";

export default async function InterviewHistoryPage() {
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
            <Link href="/dashboard/interview">Interview Dashboard</Link>
          </Button>
          <Button asChild variant="outline" className={forge.secondaryButton}>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>

      <section className="mx-auto w-full max-w-7xl space-y-6 py-10 lg:py-12">
        <div className={forge.hero}>
          <div className={forge.heroGlowCyan} />
          <div className={forge.heroGlowPurple} />
          <div className="relative">
            <span className={forge.badge}>Interview History</span>
            <h1 className="mt-4 max-w-4xl text-3xl font-semibold tracking-tight sm:text-5xl">
              Track OA and interview progress over time.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-300">
              Review attempt history, improvement trends, recurring weak areas,
              and recommendations from your saved TalentForge practice sessions.
            </p>
          </div>
        </div>

        <InterviewHistoryClient />
      </section>
    </main>
  );
}
