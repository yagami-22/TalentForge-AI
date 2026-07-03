import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PremiumBackgroundProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function PremiumBackground({
  children,
  className,
  contentClassName,
}: PremiumBackgroundProps) {
  return (
    <main
      className={cn(
        "min-h-screen overflow-hidden bg-[#050914] text-white",
        className
      )}
    >
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_7%,rgba(0,229,255,0.075),transparent_22rem),radial-gradient(circle_at_86%_9%,rgba(139,92,246,0.085),transparent_24rem),radial-gradient(circle_at_50%_104%,rgba(59,168,255,0.045),transparent_26rem),linear-gradient(180deg,#030713_0%,#070B18_46%,#030713_100%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_22%_20%,rgba(0,229,255,0.025),transparent_18rem),radial-gradient(circle_at_76%_26%,rgba(139,92,246,0.028),transparent_18rem)]" />
      <div className="pointer-events-none fixed inset-0 opacity-55 [background-image:radial-gradient(circle_at_center,rgba(210,235,255,0.38)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:linear-gradient(to_bottom,transparent,black_16%,black_76%,transparent)]" />
      <div className={cn("relative", contentClassName)}>{children}</div>
    </main>
  );
}
