'use client'

import { useState } from 'react'
import { ItemCard } from '@/components/items/ItemCard'
import { ItemSlideOver } from '@/components/items/ItemSlideOver'
import { ItemStatus, Condition } from '@prisma/client'

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
}

interface HaulItemsGridProps {
  items: Item[]
  haulId: string
  tags: Tag[]
  platforms: Platform[]
}

export function HaulItemsGrid({ items, haulId, tags, platforms }: HaulItemsGridProps) {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)

  const handleUpdated = () => {
    setSelectedItem(null)
    window.location.reload()
  }

  return (
    <>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
          <p className="text-white/30 text-sm">No items in this haul yet.</p>
          <a
            href={`/import?haulId=${haulId}`}
            className="mt-4 inline-block rounded-lg bg-indigo-500/80 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-500 transition-colors"
          >
            Import Items
          </a>
        </div>
      ) : (
        <>
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-white/70">Items ({items.length})</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((item) => (
              <ItemCard key={item.id} {...item} onClick={() => setSelectedItem(item)} />
            ))}
          </div>
        </>
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
