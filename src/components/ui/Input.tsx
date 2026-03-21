'use client'

import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-white/50 uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 transition-all duration-150',
            'bg-white/[0.07] border border-white/[0.08] focus:border-indigo-500/50 focus:ring-indigo-500/30 focus:bg-white/[0.10]',
            error && 'border-red-500/50 focus:border-red-500/60 focus:ring-red-500/30',
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-white/35">{hint}</p>}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
