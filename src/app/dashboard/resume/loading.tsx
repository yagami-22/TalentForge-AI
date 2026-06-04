export default function Loading() {
  return (
    <main className="min-h-screen bg-[#05070d] px-6 py-8 text-white lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="h-7 w-40 rounded-md bg-white/10" />
        <div className="mt-16 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-4">
            <div className="h-4 w-28 rounded bg-cyan-200/20" />
            <div className="h-12 w-full max-w-xl rounded bg-white/10" />
            <div className="h-24 w-full max-w-2xl rounded bg-white/5" />
          </div>
          <div className="h-80 rounded-xl border border-white/10 bg-white/[0.055]" />
        </div>
      </div>
    </main>
  );
}
