import * as React from "react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        className={`h-[32px] w-full bg-surface-container-lowest border border-border rounded px-sm text-on-surface font-mono text-[12px] placeholder:text-text-dim focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"
