import { UserRole } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";

import { saveUserRole } from "@/app/onboarding/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentDbUser } from "@/lib/current-user";

const roles = [
  {
    value: UserRole.CANDIDATE,
    title: "Candidate",
    description:
      "Analyze resumes, match jobs, practice interviews, and follow a personalized career roadmap.",
  },
  {
    value: UserRole.RECRUITER,
    title: "Recruiter",
    description:
      "Prepare to manage jobs, review candidate signals, and streamline hiring workflows.",
  },
];

export default async function OnboardingPage() {
  const user = await getCurrentDbUser();

  if (user.role) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#05070d] px-6 py-8 text-white lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          TalentForge AI
        </Link>
      </div>

      <section className="mx-auto flex w-full max-w-4xl flex-col items-center py-16 text-center">
        <p className="text-sm font-semibold uppercase text-cyan-200">
          Onboarding
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Choose how you want to use TalentForge AI.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-300">
          This helps us tailor your workspace before you head into the
          dashboard.
        </p>

        <div className="mt-10 grid w-full gap-4 md:grid-cols-2">
          {roles.map((role) => (
            <Card
              key={role.value}
              className="border-white/10 bg-white/[0.055] text-left text-white ring-white/10"
            >
              <CardHeader>
                <CardTitle>{role.title}</CardTitle>
                <CardDescription className="leading-6 text-zinc-400">
                  {role.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={saveUserRole}>
                  <input type="hidden" name="role" value={role.value} />
                  <Button
                    type="submit"
                    className="w-full bg-cyan-300 text-slate-950 hover:bg-cyan-200"
                  >
                    Continue as {role.title}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
