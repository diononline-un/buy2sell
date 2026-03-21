import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value: string | number
  delta?: string | number
  deltaPositive?: boolean
  className?: string
  icon?: ReactNode
}

export function KpiCard({ label, value, delta, deltaPositive, className, icon }: KpiCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)] glass-md',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-white/40 uppercase tracking-wider">{label}</p>
        {icon && <div className="text-white/30">{icon}</div>}
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-white">{value}</p>
      {delta !== undefined && (
        <p className={cn('mt-1 text-xs font-medium', deltaPositive ? 'text-emerald-400' : 'text-red-400')}>
          {deltaPositive ? '↑' : '↓'} {delta}
        </p>
      )}
    </div>
  )
}
