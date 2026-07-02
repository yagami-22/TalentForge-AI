import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-28 w-full rounded-2xl border border-white/[0.08] bg-[#101827]/82 px-4 py-3 text-base text-white shadow-inner transition duration-200 outline-none placeholder:text-slate-500 focus-visible:border-[#00E5FF]/45 focus-visible:ring-2 focus-visible:ring-[#00E5FF]/16 disabled:cursor-not-allowed disabled:bg-white/10 disabled:opacity-50 aria-invalid:border-red-300/35 aria-invalid:ring-2 aria-invalid:ring-red-300/12 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
