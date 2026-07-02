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
        "min-h-screen overflow-hidden bg-[#070B16] text-white",
        className
      )}
    >
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_5%,rgba(0,229,255,0.075),transparent_32rem),radial-gradient(circle_at_85%_8%,rgba(106,92,255,0.085),transparent_34rem),linear-gradient(180deg,#070B16_0%,#0A1020_52%,#070B16_100%)]" />
      <div className={cn("relative", contentClassName)}>{children}</div>
    </main>
  );
}
