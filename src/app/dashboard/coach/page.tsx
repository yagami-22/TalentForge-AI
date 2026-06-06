import Link from "next/link";
import { redirect } from "next/navigation";
import { Compass, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getCurrentDbUser } from "@/lib/current-user";
import { forge } from "@/lib/talentforge-design";

export const runtime = "nodejs";

export default async function CareerCoachPage() {
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
        <Button
          asChild
          variant="outline"
          className={forge.secondaryButton}
        >
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>

      <section className="mx-auto grid w-full max-w-7xl place-items-center py-20">
        <div className={`relative max-w-3xl overflow-hidden p-8 text-center sm:p-12 ${forge.hero}`}>
          <div className={forge.heroGlowCyan} />
          <div className={forge.heroGlowPurple} />
          <div className="relative">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-[#00E5FF]/20 bg-[#00E5FF]/10 text-cyan-100 shadow-[0_0_28px_rgba(0,229,255,0.16)]">
              <Compass className="h-7 w-7" />
            </div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-cyan-100">
              AI Career Coach
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
              Your roadmap is coming soon.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-300">
              This future module will combine resume insights, job matches, and
              interview performance into a personalized career roadmap.
            </p>
            <Button
              asChild
              className={`mt-7 ${forge.primaryButton}`}
            >
              <Link href="/dashboard/resume">
                <Sparkles className="h-4 w-4" />
                Start with Resume Intelligence
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
