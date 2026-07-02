import Link from "next/link";
import { ArrowRight, Compass, Home } from "lucide-react";

import { PremiumBackground } from "@/components/premium-background";
import { Button } from "@/components/ui/button";
import { forge } from "@/lib/talentforge-design";

export default function NotFound() {
  return (
    <PremiumBackground contentClassName="grid min-h-screen place-items-center px-6 py-12">
      <section className={`${forge.cardStrong} w-full max-w-2xl p-8 text-center sm:p-10`}>
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#00E5FF]/10 text-cyan-100 ring-1 ring-[#00E5FF]/14">
          <Compass className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="mt-6 text-[0.72rem] font-medium uppercase tracking-[0.22em] text-cyan-100">
          404
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          This page is off the roadmap.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-400">
          The page you are looking for does not exist or may have moved. Return to the
          TalentForge workspace to continue.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/dashboard">
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              Landing Page
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </PremiumBackground>
  );
}
