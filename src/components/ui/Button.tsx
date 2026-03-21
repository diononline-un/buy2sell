'use client'

import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-40',
          {
            'bg-indigo-500/90 text-white hover:bg-indigo-500 shadow-[0_4px_16px_rgba(99,102,241,0.35)] backdrop-blur-sm':
              variant === 'primary',
            'bg-white/10 text-white/80 hover:bg-white/15 hover:text-white border border-white/10':
              variant === 'secondary',
            'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20':
              variant === 'danger',
            'text-white/60 hover:bg-white/[0.07] hover:text-white/90':
              variant === 'ghost',
          },
          {
            'h-7 px-3 text-xs': size === 'sm',
            'h-9 px-4 text-sm': size === 'md',
            'h-11 px-6 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
