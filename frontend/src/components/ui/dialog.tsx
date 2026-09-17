import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, children }) => {
  // Handle escape key to close dialog
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", handleEscape)
    }
    return () => {
      document.body.style.overflow = "unset"
      window.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-gutter">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#000] z-40 cursor-pointer"
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="relative z-50 w-full max-w-md bg-surface border border-border rounded-lg p-xl shadow-xl flex flex-col gap-lg"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              {title && (
                <h3 className="font-headline text-headline-sm font-bold text-on-surface">
                  {title}
                </h3>
              )}
              <button
                onClick={onClose}
                className="text-text-muted hover:text-on-surface transition-colors p-[2px] rounded hover:bg-surface-hover ml-auto"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="text-body-base text-on-surface">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
