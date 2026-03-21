'use client'

import { cn } from '@/lib/utils'
import { SelectHTMLAttributes, forwardRef } from 'react'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options?: { value: string; label: string }[]
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, children, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-xs font-medium text-white/50 uppercase tracking-wider">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 transition-all duration-150 cursor-pointer',
            'bg-white/[0.07] border border-white/[0.08] focus:border-indigo-500/50 focus:ring-indigo-500/30 focus:bg-white/[0.10]',
            error && 'border-red-500/50 focus:border-red-500/60',
            className
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'

export { Select }
