import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-2xl border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all duration-300 outline-none select-none focus-visible:border-[#00E5FF]/55 focus-visible:ring-2 focus-visible:ring-[#00E5FF]/22 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-55 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#00E5FF] via-[#6A5CFF] to-[#8B5CF6] text-white shadow-[0_0_24px_rgba(0,229,255,0.18),0_0_32px_rgba(139,92,246,0.14)] hover:-translate-y-0.5 hover:shadow-[0_0_32px_rgba(0,229,255,0.24),0_0_42px_rgba(139,92,246,0.18)]",
        outline:
          "border-white/[0.1] bg-[#071024]/72 text-white shadow-[0_0_18px_rgba(0,229,255,0.035)] backdrop-blur-xl hover:-translate-y-0.5 hover:border-[#00E5FF]/24 hover:bg-[#00E5FF]/8 hover:text-white aria-expanded:bg-[#00E5FF]/8 aria-expanded:text-white",
        secondary:
          "border border-white/[0.1] bg-[#071024]/72 text-white shadow-[0_0_18px_rgba(0,229,255,0.035)] backdrop-blur-xl hover:-translate-y-0.5 hover:border-[#00E5FF]/24 hover:bg-[#00E5FF]/8 aria-expanded:bg-[#00E5FF]/8 aria-expanded:text-white",
        ghost:
          "text-slate-300 hover:bg-white/[0.045] hover:text-white aria-expanded:bg-[#00E5FF]/8 aria-expanded:text-white",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-10 gap-2 px-4 has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5",
        xs: "h-7 gap-1.5 rounded-xl px-2.5 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 rounded-[0.9rem] px-3 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-10",
        "icon-xs":
          "size-7 rounded-xl in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-9 rounded-[0.9rem] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
