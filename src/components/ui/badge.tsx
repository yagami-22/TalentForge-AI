import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border border-transparent px-2.5 py-0.5 text-xs font-medium whitespace-nowrap transition-all duration-200 focus-visible:border-[#00E5FF]/55 focus-visible:ring-2 focus-visible:ring-[#00E5FF]/20 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3.5!",
  {
    variants: {
      variant: {
        default:
          "border-[#00E5FF]/14 bg-[#00E5FF]/8 text-cyan-100 shadow-none [a]:hover:bg-[#00E5FF]/12",
        secondary:
          "border-[#8B5CF6]/14 bg-[#8B5CF6]/9 text-purple-100 [a]:hover:bg-[#8B5CF6]/14",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-white/[0.08] bg-[#101827]/68 text-white [a]:hover:bg-[#00E5FF]/8 [a]:hover:text-cyan-100",
        ghost:
          "text-slate-300 hover:bg-[#00E5FF]/10 hover:text-cyan-100",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
