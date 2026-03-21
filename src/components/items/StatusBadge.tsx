import { ItemStatus } from '@prisma/client'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<ItemStatus, { label: string; className: string }> = {
  UNLISTED:  { label: 'Unlisted',  className: 'bg-white/8 text-white/50 border border-white/10' },
  LISTED:    { label: 'Listed',    className: 'bg-blue-500/15 text-blue-300 border border-blue-500/20' },
  RESERVED:  { label: 'Reserved', className: 'bg-amber-500/15 text-amber-300 border border-amber-500/20' },
  SOLD:      { label: 'Sold',     className: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' },
  RETURNED:  { label: 'Returned', className: 'bg-orange-500/15 text-orange-300 border border-orange-500/20' },
  KEPT:      { label: 'Kept',     className: 'bg-purple-500/15 text-purple-300 border border-purple-500/20' },
  DISCARDED: { label: 'Discarded',className: 'bg-red-500/15 text-red-300 border border-red-500/20' },
}

interface StatusBadgeProps {
  status: ItemStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.UNLISTED
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
