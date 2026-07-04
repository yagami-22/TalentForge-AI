import Link from "next/link";
import { UserProfile } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { clerkUserProfileAppearance } from "@/lib/clerk-appearance";
import { forge } from "@/lib/talentforge-design";

import styles from "./account-profile.module.css";

export default function SettingsAccountPage() {
  return (
    <main className={forge.page}>
      <div className="relative mx-auto w-full max-w-[820px] space-y-6 py-2">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">TalentForge AI</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
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

        <section className={`${styles.accountShell} relative overflow-hidden rounded-[1.65rem] border border-white/[0.08] bg-[linear-gradient(145deg,rgba(7,16,36,0.84),rgba(13,20,38,0.62)_56%,rgba(5,10,22,0.8))] shadow-[0_22px_80px_rgba(0,0,0,0.26),0_0_32px_rgba(0,229,255,0.035),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-2xl`}>
          <UserProfile
            routing="hash"
            appearance={clerkUserProfileAppearance}
          />
        </section>
      </div>
    </main>
  );
}
