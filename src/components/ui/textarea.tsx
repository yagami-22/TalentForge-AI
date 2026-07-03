import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-28 w-full rounded-2xl border border-white/[0.1] bg-[#071024]/78 px-4 py-3 text-base text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_20px_rgba(0,229,255,0.025)] backdrop-blur-xl transition duration-200 outline-none placeholder:text-slate-500 focus-visible:border-[#00E5FF]/50 focus-visible:ring-2 focus-visible:ring-[#00E5FF]/18 disabled:cursor-not-allowed disabled:bg-white/10 disabled:opacity-50 aria-invalid:border-red-300/35 aria-invalid:ring-2 aria-invalid:ring-red-300/12 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
