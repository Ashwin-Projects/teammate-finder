import * as React from "react"
import { motion } from "framer-motion"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", hoverEffect = true, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={hoverEffect ? { borderColor: "#2a2a35", backgroundColor: "#18181f" } : undefined}
        transition={{ duration: 0.2 }}
        className={`bg-surface border border-border rounded p-lg relative overflow-hidden transition-all ${className}`}
        {...(props as any)}
      >
        {children}
      </motion.div>
    )
  }
)
Card.displayName = "Card"

export const CardHeader = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex flex-col gap-xs mb-md ${className}`} {...props}>
    {children}
  </div>
)

export const CardTitle = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`font-headline text-title-md font-bold text-on-surface flex items-center gap-sm ${className}`} {...props}>
    {children}
  </h3>
)

export const CardDescription = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`text-body-base text-text-dim leading-relaxed ${className}`} {...props}>
    {children}
  </p>
)

export const CardContent = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`${className}`} {...props}>
    {children}
  </div>
)

export const CardFooter = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex items-center justify-between border-t border-border/60 pt-md mt-md ${className}`} {...props}>
    {children}
  </div>
)
