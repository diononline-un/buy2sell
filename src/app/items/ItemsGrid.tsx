'use client'

import { useState, useTransition } from 'react'
import { ItemCard } from '@/components/items/ItemCard'
import { ItemSlideOver } from '@/components/items/ItemSlideOver'
import { StatusBadge } from '@/components/items/StatusBadge'
import { ItemStatus, Condition } from '@prisma/client'
import { getItems } from '@/lib/actions/items'

const ALL_STATUSES: ItemStatus[] = ['UNLISTED', 'LISTED', 'RESERVED', 'SOLD', 'RETURNED', 'KEPT', 'DISCARDED']

interface Tag { id: string; name: string; color?: string | null }
interface Platform { id: string; name: string; feePercent?: number | string | null }
interface SaleRecord {
  id: string; salePrice: number | string; shippingCost?: number | string | null
  platformFee?: number | string | null; saleDate: Date | string
  buyerName?: string | null; trackingNumber?: string | null; platform?: Platform | null
}
interface ImageRecord { id: string; url: string; alt?: string | null; isPrimary: boolean }
interface Item {
  id: string; title: string; titleOriginal?: string | null; description?: string | null
  brand?: string | null; itemType?: string | null; category?: string | null
  condition: Condition; purchasePrice?: number | string | null; askingPrice?: number | string | null
  status: ItemStatus; storageLocation?: string | null; labelPrinted: boolean
  notes?: string | null; variant?: string | null; sourceAgent?: string | null
  sourceUrl?: string | null; source1688Id?: string | null; haulId: string
  images: ImageRecord[]; tags: Tag[]; sales: SaleRecord[]
  haul?: { id: string; name: string } | null
}

interface ItemsGridProps {
  initialItems: Item[]
  tags: Tag[]
  platforms: Platform[]
}

export function ItemsGrid({ initialItems, tags, platforms }: ItemsGridProps) {
  const [items, setItems] = useState(initialItems)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [filterStatus, setFilterStatus] = useState<ItemStatus | ''>('')
  const [filterSearch, setFilterSearch] = useState('')
  const [filterTags, setFilterTags] = useState<string[]>([])
  const [, startTransition] = useTransition()

  const applyFilters = (status: ItemStatus | '', search: string, tagIds: string[]) => {
    startTransition(async () => {
      const results = await getItems({
        status: status || undefined,
        search: search || undefined,
        tags: tagIds.length > 0 ? tagIds : undefined,
      })
      setItems(results as Item[])
    })
  }

  const handleStatusFilter = (status: ItemStatus | '') => {
    setFilterStatus(status)
    applyFilters(status, filterSearch, filterTags)
  }

  const handleSearch = (search: string) => {
    setFilterSearch(search)
    applyFilters(filterStatus, search, filterTags)
  }

  const handleTagFilter = (tagId: string) => {
    const newTags = filterTags.includes(tagId)
      ? filterTags.filter((id) => id !== tagId)
      : [...filterTags, tagId]
    setFilterTags(newTags)
    applyFilters(filterStatus, filterSearch, newTags)
  }

  const handleUpdated = () => {
    setSelectedItem(null)
    applyFilters(filterStatus, filterSearch, filterTags)
  }

  return (
    <>
      {/* Filter bar */}
      <div className="mb-5 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search items..."
          value={filterSearch}
          onChange={(e) => handleSearch(e.target.value)}
          className="rounded-lg border border-white/[0.08] bg-white/[0.07] px-3 py-1.5 text-sm text-white placeholder:text-white/25 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 w-44"
        />

        {/* Status filters */}
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => handleStatusFilter('')}
            className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
              filterStatus === ''
                ? 'bg-indigo-500/80 text-white shadow-[0_2px_8px_rgba(99,102,241,0.3)]'
                : 'bg-white/[0.07] text-white/40 hover:bg-white/[0.10] hover:text-white/70'
            }`}
          >
            All
          </button>
          {ALL_STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusFilter(status)}
              className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
                filterStatus === status
                  ? 'bg-indigo-500/80 text-white shadow-[0_2px_8px_rgba(99,102,241,0.3)]'
                  : 'bg-white/[0.07] text-white/40 hover:bg-white/[0.10] hover:text-white/70'
              }`}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Tag filters */}
        {tags.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleTagFilter(tag.id)}
                className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all border ${
                  filterTags.includes(tag.id) ? 'opacity-100' : 'opacity-40 hover:opacity-70'
                }`}
                style={tag.color ? {
                  backgroundColor: tag.color + '22',
                  color: tag.color,
                  borderColor: tag.color + '40',
                } : {}}
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
          <p className="text-white/30">No items found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {items.map((item) => (
            <ItemCard key={item.id} {...item} onClick={() => setSelectedItem(item)} />
          ))}
        </div>
      )}

      <ItemSlideOver
        item={selectedItem}
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        allTags={tags}
        platforms={platforms}
        onUpdated={handleUpdated}
      />
    </>
  )
}
