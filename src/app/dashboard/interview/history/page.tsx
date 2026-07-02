import Link from "next/link";
import { BarChart3, History, MessageSquareText, Target, TrendingUp } from "lucide-react";
import { redirect } from "next/navigation";

import { InterviewHistoryClient } from "@/app/dashboard/interview/history/interview-history-client";
import { PremiumModuleHero } from "@/components/dashboard/premium-module-hero";
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

      <section className={forge.section}>
        <PremiumModuleHero
          badge="Interview History"
          title="Track OA and interview progress over time."
          description="Review attempt history, improvement trends, recurring weak areas, and recommendations from saved TalentForge practice sessions."
          variant="analytics"
          primaryCta={{ href: "/dashboard/interview", label: "Start Practice", icon: MessageSquareText }}
          secondaryCta={{ href: "/dashboard/analytics", label: "Open Analytics", icon: BarChart3 }}
          metrics={[
            { label: "Trend", value: "Live", helper: "Local attempts", icon: TrendingUp, progress: 76, trend: "+focus" },
            { label: "OA", value: "Tracked", helper: "Assessment reports", icon: Target, tone: "purple", progress: 70, trend: "ready" },
            { label: "Feedback", value: "Saved", helper: "Answer history", icon: History, progress: 84, trend: "local" },
          ]}
          quickActions={[
            { href: "/dashboard/interview", title: "New Practice", subtitle: "Generate questions", icon: MessageSquareText },
            { href: "/dashboard/interview/results", title: "Mock Results", subtitle: "Review latest session", icon: BarChart3 },
            { href: "/dashboard/interview/oa/results", title: "OA Results", subtitle: "Read assessment report", icon: Target },
            { href: "/dashboard/analytics", title: "Analytics", subtitle: "View readiness trends", icon: TrendingUp },
          ]}
        />

        <InterviewHistoryClient />
      </section>
    </main>
  );
}
