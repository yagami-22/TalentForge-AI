import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://talentforge.ai"),
  title: {
    default: "TalentForge AI",
    template: "%s | TalentForge AI",
  },
  description:
    "AI career growth workspace for resume intelligence, ATS optimization, interview preparation, and career coaching.",
  openGraph: {
    title: "TalentForge AI",
    description:
      "AI career growth workspace for resume intelligence, ATS optimization, interview preparation, and career coaching.",
    siteName: "TalentForge AI",
    type: "website",
    url: "https://talentforge.ai",
  },
  twitter: {
    card: "summary_large_image",
    title: "TalentForge AI",
    description:
      "AI career growth workspace for resume intelligence, ATS optimization, interview preparation, and career coaching.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignOutUrl="/"
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    </ClerkProvider>
  );
}
