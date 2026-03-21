import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: string
}

export function Badge({ className, color, style, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        !color && 'bg-white/10 text-white/60',
        className
      )}
      style={color ? { backgroundColor: color + '28', color, border: `1px solid ${color}40` } : style}
      {...props}
    >
      {children}
    </span>
  )
}
