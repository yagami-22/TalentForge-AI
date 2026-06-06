import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-xl border border-white/10 bg-[rgba(5,8,22,0.75)] px-2.5 py-1 text-base text-white shadow-inner transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-[#00E5FF] file:text-sm file:font-medium file:text-slate-950 placeholder:text-slate-500 focus-visible:border-[#00E5FF]/50 focus-visible:ring-3 focus-visible:ring-[#00E5FF]/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-white/10 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
