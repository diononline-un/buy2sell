import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn('rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.3)] glass-md', className)}
      {...props}
    >
      {children}
    </div>
  )
}
