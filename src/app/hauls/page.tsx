import { getHauls } from '@/lib/actions/hauls'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { DeleteHaulButton } from './DeleteHaulButton'

export default async function HaulsPage() {
  const hauls = await getHauls()

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Hauls</h1>
        <Link href="/hauls/new">
          <Button size="sm">+ New Haul</Button>
        </Link>
      </div>

      {hauls.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-white/10 py-16 text-center">
          <p className="text-white/40">No hauls yet.</p>
          <Link href="/hauls/new">
            <Button className="mt-4">Create your first haul</Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden glass-md shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.07] bg-white/[0.02]">
                {['Name','Source','Date','Items','Sold','Cost','Profit',''].map((h) => (
                  <th key={h} className={`px-4 py-3 font-medium text-white/35 uppercase tracking-wider text-[10px] ${h === '' || h === 'Items' || h === 'Sold' || h === 'Cost' || h === 'Profit' ? 'text-right' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hauls.map((haul) => (
                <tr key={haul.id} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/hauls/${haul.id}`} className="font-medium text-white/90 hover:text-indigo-400 transition-colors">
                      {haul.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-white/40">{haul.source ?? '—'}</td>
                  <td className="px-4 py-3 text-white/40">{formatDate(haul.date)}</td>
                  <td className="px-4 py-3 text-right text-white/60">{haul.itemCount}</td>
                  <td className="px-4 py-3 text-right text-white/60">{haul.soldCount}</td>
                  <td className="px-4 py-3 text-right text-white/60">{formatCurrency(haul.totalCost)}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${haul.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(haul.profit)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/hauls/${haul.id}/edit`} className="text-indigo-400/70 hover:text-indigo-400 transition-colors">
                        Edit
                      </Link>
                      <DeleteHaulButton id={haul.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
