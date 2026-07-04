import Link from "next/link";
import { UserProfile } from "@clerk/nextjs";
import { ArrowLeft, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { clerkUserProfileAppearance } from "@/lib/clerk-appearance";
import { forge } from "@/lib/talentforge-design";

export default function SettingsAccountPage() {
  return (
    <main className={forge.page}>
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1180px] flex-col gap-6 py-4">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">TalentForge AI</p>
            <h1 className="mt-1 flex items-center gap-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              <Settings className="h-7 w-7 text-cyan-100" />
              Account
            </h1>
          </div>
          <Button asChild variant="outline" size="sm" className={forge.secondaryButton}>
            <Link href="/dashboard/settings">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Settings
            </Link>
          </Button>
        </header>

        <section className="relative overflow-hidden rounded-[1.75rem] border border-cyan-200/12 bg-[radial-gradient(circle_at_12%_0%,rgba(0,229,255,0.12),transparent_30%),radial-gradient(circle_at_86%_8%,rgba(139,92,246,0.16),transparent_34%),linear-gradient(145deg,rgba(7,16,36,0.78),rgba(5,10,22,0.88))] p-3 shadow-[0_26px_100px_rgba(0,0,0,0.34),0_0_48px_rgba(0,229,255,0.06)] backdrop-blur-2xl sm:p-5">
          <UserProfile
            routing="hash"
            appearance={clerkUserProfileAppearance}
          />
        </section>
      </div>
    </main>
  );
}
