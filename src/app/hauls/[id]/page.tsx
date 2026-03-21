import { getHaul } from '@/lib/actions/hauls'
import { getTags } from '@/lib/actions/tags'
import { getPlatforms } from '@/lib/actions/platforms'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import { HaulItemsGrid } from './HaulItemsGrid'

interface PageProps {
  params: { id: string }
}

export default async function HaulDetailPage({ params }: PageProps) {
  const [haul, tags, platforms] = await Promise.all([
    getHaul(params.id),
    getTags(),
    getPlatforms(),
  ])

  if (!haul) notFound()

  const soldItems = haul.items.filter((item) => item.status === 'SOLD')
  const totalRevenue = soldItems.reduce(
    (sum, item) => sum + item.sales.reduce((s, sale) => s + Number(sale.salePrice), 0),
    0
  )

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Link href="/hauls" className="text-xs text-white/40 hover:text-white/70 transition-colors">
            ← Hauls
          </Link>
          <h1 className="mt-1 text-xl font-semibold text-white">{haul.name}</h1>
          <div className="mt-1 flex items-center gap-4 text-xs text-white/40">
            {haul.source && <span>{haul.source}</span>}
            <span>{formatDate(haul.date)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/hauls/${haul.id}/edit`}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:bg-white/[0.06] hover:text-white/90 transition-all"
          >
            Edit
          </Link>
          <Link
            href={`/import?haulId=${haul.id}`}
            className="rounded-lg bg-indigo-500/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 shadow-[0_2px_12px_rgba(99,102,241,0.35)] transition-all"
          >
            + Import Items
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total Items', value: haul.items.length, color: 'text-white' },
          { label: 'Sold', value: soldItems.length, color: 'text-emerald-400' },
          { label: 'Haul Cost', value: formatCurrency(haul.totalCost), color: 'text-white' },
          { label: 'Revenue', value: formatCurrency(totalRevenue), color: 'text-white' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl p-3.5 glass shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
            <p className="text-[10px] text-white/35 uppercase tracking-wider">{stat.label}</p>
            <p className={`mt-1 text-xl font-semibold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {haul.notes && (
        <div className="mb-6 rounded-xl px-4 py-3 text-sm text-white/60 glass">
          {haul.notes}
        </div>
      )}

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <HaulItemsGrid items={haul.items as any} haulId={haul.id} tags={tags} platforms={platforms} />
    </div>
  )
}
