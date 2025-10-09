import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-[var(--color-primary-hover)]",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-[var(--color-destructive-hover)]",
        success:
          "border-transparent bg-success text-success-foreground shadow hover:bg-success/80",
        outline:
          "border border-border text-foreground hover:bg-accent",
        // Subtle variants with background tint
        primarySubtle:
          "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20",
        destructiveSubtle:
          "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20",
        successSubtle:
          "bg-success/10 text-success border border-success/20 hover:bg-success/20",
        yellowSubtle:
          "bg-[var(--color-accent-yellow)]/10 text-[var(--color-accent-yellow)] border border-[var(--color-accent-yellow)]/20 hover:bg-[var(--color-accent-yellow)]/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
