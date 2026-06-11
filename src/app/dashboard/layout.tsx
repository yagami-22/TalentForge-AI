import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Protected TalentForge dashboard for resume analytics, ATS optimization, JD matching, interviews, coaching, and career readiness trends.",
  openGraph: {
    title: "TalentForge AI Dashboard",
    description:
      "Protected TalentForge dashboard for resume analytics, ATS optimization, JD matching, interviews, coaching, and career readiness trends.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TalentForge AI Dashboard",
    description:
      "Protected TalentForge dashboard for resume analytics, ATS optimization, JD matching, interviews, coaching, and career readiness trends.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <a
        href="#dashboard-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-[#00E5FF] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-950 focus:outline-none focus:ring-4 focus:ring-[#00E5FF]/30"
      >
        Skip to dashboard content
      </a>
      <div id="dashboard-content" tabIndex={-1}>
        {children}
      </div>
    </>
  );
}
