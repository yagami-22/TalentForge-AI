import { forge } from "@/lib/talentforge-design";

export default function Loading() {
  return (
    <main className={forge.page}>
      <div className="mx-auto w-full max-w-7xl">
        <div className="h-7 w-40 rounded-full bg-white/10 shadow-[0_0_24px_rgba(0,229,255,0.08)]" />
        <div className="mt-16 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-4">
            <div className="h-4 w-28 rounded-full bg-[#00E5FF]/20" />
            <div className="h-12 w-full max-w-xl rounded-2xl bg-white/10" />
            <div className="h-24 w-full max-w-2xl rounded-3xl bg-white/5" />
          </div>
          <div className={`h-80 ${forge.panel}`} />
        </div>
      </div>
    </main>
  );
}
