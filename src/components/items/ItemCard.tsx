'use client'

import Image from 'next/image'
import { StatusBadge } from './StatusBadge'
import { formatCurrency } from '@/lib/utils'
import { ItemStatus } from '@prisma/client'

interface ItemCardImage {
  url: string
  alt?: string | null
  isPrimary: boolean
}

interface ItemCardProps {
  id: string
  title: string
  brand?: string | null
  itemType?: string | null
  status: ItemStatus
  purchasePrice?: number | string | null
  askingPrice?: number | string | null
  images?: ItemCardImage[]
  onClick?: () => void
  selected?: boolean
  showCheckbox?: boolean
  onCheckboxChange?: (checked: boolean) => void
}

export function ItemCard({
  title,
  brand,
  itemType,
  status,
  purchasePrice,
  askingPrice,
  images = [],
  onClick,
  selected,
  showCheckbox,
  onCheckboxChange,
}: ItemCardProps) {
  const primaryImage = images.find((img) => img.isPrimary) ?? images[0]

  return (
    <div
      className={`group relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_16px_48px_rgba(0,0,0,0.5)] shadow-[0_4px_24px_rgba(0,0,0,0.3)] ${
        selected
          ? 'ring-2 ring-indigo-500/60'
          : ''
      }`}
      style={{
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: selected ? undefined : '1px solid rgba(255,255,255,0.09)',
      }}
      onClick={onClick}
    >
      {showCheckbox && (
        <div className="absolute left-2 top-2 z-10" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={selected ?? false}
            onChange={(e) => onCheckboxChange?.(e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-white/10 text-indigo-500 focus:ring-indigo-500/40"
          />
        </div>
      )}

      {/* Image */}
      <div className="relative h-36 w-full overflow-hidden bg-white/[0.04]">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt || title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg className="h-10 w-10 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Status badge overlay */}
        <div className="absolute top-2 right-2">
          <StatusBadge status={status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <p className="line-clamp-2 text-xs font-medium text-white/90 leading-tight mb-1">{title}</p>

        {(brand || itemType) && (
          <p className="mb-2 text-[10px] text-white/35">
            {[brand, itemType].filter(Boolean).join(' · ')}
          </p>
        )}

        <div className="flex items-center justify-between text-[10px]">
          <span className="text-white/35">
            {formatCurrency(purchasePrice)}
          </span>
          {askingPrice && (
            <span className="font-semibold text-indigo-400">
              {formatCurrency(askingPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
