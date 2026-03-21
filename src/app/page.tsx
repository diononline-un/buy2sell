import { getDashboardData } from '@/lib/actions/sales'
import { KpiCard } from '@/components/ui/KpiCard'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'

type Period = 'week' | 'month' | 'quarter' | 'all'

interface PageProps {
  searchParams?: { period?: string }
}

const PERIOD_LABELS: Record<Period, string> = {
  week: '7d',
  month: '30d',
  quarter: '90d',
  all: 'All time',
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const period = (searchParams?.period ?? 'all') as Period
  const data = await getDashboardData(period)
  const hauls = data.haulDrilldown

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        <div className="flex gap-1 rounded-xl p-1 glass">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <Link
              key={p}
              href={`/?period=${p}`}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-all duration-150 ${
                period === p
                  ? 'bg-indigo-500/80 text-white shadow-[0_2px_8px_rgba(99,102,241,0.4)]'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/[0.06]'
              }`}
            >
              {PERIOD_LABELS[p]}
            </Link>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Total Profit"
          value={formatCurrency(data.totalProfit)}
          deltaPositive={data.totalProfit >= 0}
        />
        <KpiCard
          label="ROI"
          value={`${data.roi.toFixed(1)}%`}
          deltaPositive={data.roi >= 0}
        />
        <KpiCard label="Items Sold" value={data.itemsSold} />
        <KpiCard
          label="Avg. Margin"
          value={formatCurrency(data.avgMargin)}
          deltaPositive={data.avgMargin >= 0}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Haul drilldown */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl overflow-hidden glass-md shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-3.5">
              <h2 className="text-sm font-semibold text-white">Haul Performance</h2>
              <Link href="/hauls" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                View all →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                    <th className="px-5 py-2.5 text-left font-medium text-white/35 uppercase tracking-wider text-[10px]">Haul</th>
                    <th className="px-4 py-2.5 text-right font-medium text-white/35 uppercase tracking-wider text-[10px]">Items</th>
                    <th className="px-4 py-2.5 text-right font-medium text-white/35 uppercase tracking-wider text-[10px]">Sold</th>
                    <th className="px-4 py-2.5 text-right font-medium text-white/35 uppercase tracking-wider text-[10px]">Cost</th>
                    <th className="px-4 py-2.5 text-right font-medium text-white/35 uppercase tracking-wider text-[10px]">Revenue</th>
                    <th className="px-4 py-2.5 text-right font-medium text-white/35 uppercase tracking-wider text-[10px]">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {hauls.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-white/30">
                        No hauls yet.{' '}
                        <Link href="/hauls/new" className="text-indigo-400 hover:text-indigo-300">
                          Create your first haul
                        </Link>
                      </td>
                    </tr>
                  ) : (
                    hauls.slice(0, 8).map((haul) => (
                      <tr key={haul.id} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                        <td className="px-5 py-3">
                          <Link href={`/hauls/${haul.id}`} className="font-medium text-white/90 hover:text-indigo-400 transition-colors">
                            {haul.name}
                          </Link>
                          <p className="text-[10px] text-white/30 mt-0.5">{formatDate(haul.date)}</p>
                        </td>
                        <td className="px-4 py-3 text-right text-white/60">{haul.itemCount}</td>
                        <td className="px-4 py-3 text-right text-white/60">{haul.soldCount}</td>
                        <td className="px-4 py-3 text-right text-white/60">{formatCurrency(haul.totalCost)}</td>
                        <td className="px-4 py-3 text-right text-white/60">{formatCurrency(haul.revenue)}</td>
                        <td className={`px-4 py-3 text-right font-semibold ${haul.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {formatCurrency(haul.profit)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Platform breakdown */}
          <div className="rounded-2xl glass-md shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden">
            <div className="border-b border-white/[0.07] px-5 py-3.5">
              <h2 className="text-sm font-semibold text-white">By Platform</h2>
            </div>
            <div className="p-5 space-y-3">
              {data.platformBreakdown.length === 0 ? (
                <p className="text-xs text-white/30">No sales recorded yet.</p>
              ) : (
                data.platformBreakdown.map((plat) => (
                  <div key={plat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {plat.color && (
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: plat.color }} />
                      )}
                      <span className="text-sm text-white/70">{plat.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">{formatCurrency(plat.revenue)}</p>
                      <p className="text-[10px] text-white/30">{plat.count} sales</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-2xl glass-md shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-5">
            <h2 className="mb-3 text-sm font-semibold text-white">Quick Actions</h2>
            <div className="space-y-1.5">
              {[
                { href: '/hauls/new', label: '+ New Haul' },
                { href: '/import', label: 'Import Items (AI)' },
                { href: '/labels', label: 'Print Labels' },
                { href: '/api/export', label: 'Export CSV' },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center rounded-lg border border-white/[0.07] px-3 py-2 text-xs text-white/60 hover:bg-white/[0.06] hover:text-white/90 transition-all duration-150"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
