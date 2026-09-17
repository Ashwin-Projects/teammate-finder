import * as React from "react"
import { motion } from "framer-motion"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
  isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium rounded transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-50 disabled:pointer-events-none"
    
    const variants = {
      primary: "bg-primary text-white hover:bg-primary-hover active:bg-primary-hover/90 shadow-sm",
      secondary: "bg-surface-container-high text-on-surface hover:bg-border-hover border border-border",
      outline: "bg-transparent text-text-muted border border-border hover:border-border-hover hover:bg-surface-hover hover:text-on-surface",
      ghost: "bg-transparent text-text-muted hover:bg-surface-hover hover:text-on-surface",
      danger: "bg-error text-error-on hover:opacity-90 shadow-sm",
    }

    const sizes = {
      sm: "h-[28px] px-sm text-xs font-mono tracking-wide",
      md: "h-[32px] px-lg text-body-base",
      lg: "h-[40px] px-xl text-title-md",
    }

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...(props as any)}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : null}
        {children}
      </motion.button>
    )
  }
)

Button.displayName = "Button"
