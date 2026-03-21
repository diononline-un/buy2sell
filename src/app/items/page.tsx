import { getItems } from '@/lib/actions/items'
import { getTags } from '@/lib/actions/tags'
import { getPlatforms } from '@/lib/actions/platforms'
import { ItemStatus } from '@prisma/client'
import { ItemsGrid } from './ItemsGrid'

interface PageProps {
  searchParams?: { status?: string; search?: string; tags?: string; haulId?: string }
}

export default async function ItemsPage({ searchParams }: PageProps) {
  const status = searchParams?.status as ItemStatus | undefined
  const search = searchParams?.search
  const haulId = searchParams?.haulId
  const tagIds = searchParams?.tags ? searchParams.tags.split(',') : undefined

  const [items, tags, platforms] = await Promise.all([
    getItems({ status, search, haulId, tags: tagIds }),
    getTags(),
    getPlatforms(),
  ])

  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-white">Items</h1>
        <p className="text-xs text-white/35 mt-0.5">{items.length} items</p>
      </div>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <ItemsGrid initialItems={items as any} tags={tags} platforms={platforms} />
    </div>
  )
}
