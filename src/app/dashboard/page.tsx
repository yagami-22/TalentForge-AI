import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentDbUser } from "@/lib/current-user";

const dashboardItems = [
  {
    title: "Upload Resume",
    description: "Add a PDF resume to your workspace for future ATS analysis.",
    href: "/dashboard/resume",
  },
  {
    title: "Job Match Analysis",
    description: "Paste a role and compare it against your current profile.",
    href: "/dashboard",
  },
  {
    title: "AI Mock Interviews",
    description: "Practice targeted questions with feedback you can act on.",
    href: "/dashboard",
  },
];

export default async function DashboardPage() {
  const user = await getCurrentDbUser();

  if (!user.role) {
    redirect("/onboarding");
  }

  return (
    <main className="min-h-screen bg-[#05070d] px-6 py-8 text-white lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          TalentForge AI
        </Link>
        <Button
          asChild
          variant="outline"
          className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
        >
          <Link href="/">Home</Link>
        </Button>
      </div>

      <section className="mx-auto w-full max-w-7xl py-16">
        <p className="text-sm font-semibold uppercase text-cyan-200">
          Dashboard
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Your career command center is ready.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-300">
          Signed in as {user.email}. Your {user.role.toLowerCase()} workspace is
          ready for resume scans, job matching, and interview practice.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {dashboardItems.map((item) => (
            <Card
              key={item.title}
              className="border-white/10 bg-white/[0.055] text-white ring-white/10"
            >
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription className="leading-6 text-zinc-400">
                  {item.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  asChild
                  className="bg-cyan-300 text-slate-950 hover:bg-cyan-200"
                >
                  <Link href={item.href}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
