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
        "min-h-screen overflow-hidden bg-[#050816] text-white",
        className
      )}
    >
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_5%,rgba(0,229,255,0.16),transparent_32rem),radial-gradient(circle_at_85%_8%,rgba(106,92,255,0.18),transparent_34rem),radial-gradient(circle_at_55%_85%,rgba(139,92,246,0.12),transparent_34rem),linear-gradient(180deg,#050816_0%,#070b1f_52%,#050816_100%)]" />
      <div className={cn("relative", contentClassName)}>{children}</div>
    </main>
  );
}
