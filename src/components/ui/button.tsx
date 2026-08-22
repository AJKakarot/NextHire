import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:scale-[1.03] active:scale-[0.99]",
  {
    variants: {
      variant: {
        default:
          "bg-brand text-ink shadow-lg shadow-brand/20 hover:bg-brand-hover",
        destructive:
          "bg-danger text-ink hover:bg-danger/90 focus-visible:ring-danger/30",
        outline:
          "border border-line bg-transparent text-ink shadow-xs hover:border-brand/40 hover:bg-elevated",
        secondary:
          "bg-elevated text-ink hover:bg-elevated/80",
        ghost:
          "text-mute hover:bg-elevated hover:text-ink",
        link: "text-info underline-offset-4 hover:underline hover:scale-100 active:scale-100",
      },
      size: {
        default: "min-h-[44px] px-4 py-2 has-[>svg]:px-3",
        sm: "min-h-9 rounded-lg gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "min-h-[48px] rounded-xl px-6 has-[>svg]:px-4 text-base",
        icon: "size-10 rounded-xl",
        "icon-sm": "size-8 rounded-lg",
        "icon-lg": "size-11 rounded-xl",
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
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
