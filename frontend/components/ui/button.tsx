import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-display font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-accent-light text-accent-on hover:brightness-110 active:scale-95 shadow-lg",
        secondary:
          "border border-border bg-transparent text-on-surface hover:bg-surface-high",
        destructive:
          "bg-danger text-on-surface hover:bg-danger/90",
        ghost:
          "text-on-surface hover:bg-surface-high",
        link:
          "text-accent underline-offset-4 hover:underline",
        outline:
          "border border-border bg-transparent text-on-surface hover:bg-surface-high",
      },
      size: {
        default: "h-11 rounded-lg px-6 py-2 text-sm",
        sm:      "h-9 rounded-lg px-4 text-sm",
        lg:      "h-13 rounded-lg px-8 text-lg",
        icon:    "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
