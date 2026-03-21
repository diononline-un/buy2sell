'use client'

import { useState, useEffect } from 'react'
import { getHauls } from '@/lib/actions/hauls'
import { getItems } from '@/lib/actions/items'
import { setLabelPrinted } from '@/lib/actions/items'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/items/StatusBadge'
import { ItemStatus, Condition } from '@prisma/client'

interface Haul { id: string; name: string }
interface Item {
  id: string; title: string; brand?: string | null; status: ItemStatus
  condition: Condition; labelPrinted: boolean; purchasePrice?: number | string | null
  haulId: string; images: { id: string; url: string; isPrimary: boolean }[]
  tags: { id: string; name: string }[]
}

export default function LabelsPage() {
  const [hauls, setHauls] = useState<Haul[]>([])
  const [selectedHaulId, setSelectedHaulId] = useState('')
  const [items, setItems] = useState<Item[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [generating, setGenerating] = useState(false)
  const [marking, setMarking] = useState(false)

  useEffect(() => {
    getHauls().then((h) => setHauls(h.map((haul) => ({ id: haul.id, name: haul.name }))))
  }, [])

  useEffect(() => {
    if (selectedHaulId) {
      getItems({ haulId: selectedHaulId }).then((result) => { setItems(result as Item[]); setSelectedIds(new Set()) })
    } else { setItems([]); setSelectedIds(new Set()) }
  }, [selectedHaulId])

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }

  const handleGeneratePDF = async () => {
    if (selectedIds.size === 0) return
    setGenerating(true)
    try {
      const response = await fetch('/api/labels', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: Array.from(selectedIds) }) })
      if (!response.ok) throw new Error('Failed to generate PDF')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = 'buy2sell-labels.pdf'; a.click()
      URL.revokeObjectURL(url)
    } finally { setGenerating(false) }
  }

  const handleMarkPrinted = async () => {
    if (selectedIds.size === 0) return
    setMarking(true)
    try {
      await setLabelPrinted(Array.from(selectedIds))
      setItems((prev) => prev.map((item) => selectedIds.has(item.id) ? { ...item, labelPrinted: true } : item))
    } finally { setMarking(false) }
  }

  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-white">Labels</h1>
        <p className="text-xs text-white/35 mt-0.5">Generate printable QR code labels for your items.</p>
      </div>

      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5">Select Haul</label>
          <select
            value={selectedHaulId}
            onChange={(e) => setSelectedHaulId(e.target.value)}
            className="rounded-lg border border-white/[0.08] bg-white/[0.07] px-3 py-2 text-sm text-white focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
          >
            <option value="">All items</option>
            {hauls.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </div>

        {items.length > 0 && (
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setSelectedIds(new Set(items.map((i) => i.id)))}>
              All ({items.length})
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setSelectedIds(new Set(items.filter((i) => !i.labelPrinted).map((i) => i.id)))}>
              Unprinted ({items.filter((i) => !i.labelPrinted).length})
            </Button>
            {selectedIds.size > 0 && (
              <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>Clear</Button>
            )}
          </div>
        )}

        {selectedIds.size > 0 && (
          <div className="flex gap-2">
            <Button size="sm" onClick={handleGeneratePDF} disabled={generating}>
              {generating ? 'Generating...' : `Generate PDF (${selectedIds.size})`}
            </Button>
            <Button size="sm" variant="secondary" onClick={handleMarkPrinted} disabled={marking}>
              {marking ? 'Marking...' : 'Mark Printed'}
            </Button>
          </div>
        )}
      </div>

      {/* Items list */}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center">
          <p className="text-white/30 text-sm">{selectedHaulId ? 'No items in this haul.' : 'Select a haul to see items.'}</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden glass-md shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.07] bg-white/[0.02]">
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={selectedIds.size === items.length && items.length > 0} onChange={(e) => e.target.checked ? setSelectedIds(new Set(items.map((i) => i.id))) : setSelectedIds(new Set())} className="rounded border-white/20" />
                </th>
                <th className="px-4 py-3 text-left font-medium text-white/35 uppercase tracking-wider text-[10px]">Title</th>
                <th className="px-4 py-3 text-left font-medium text-white/35 uppercase tracking-wider text-[10px]">Status</th>
                <th className="px-4 py-3 text-left font-medium text-white/35 uppercase tracking-wider text-[10px]">Printed</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`cursor-pointer border-b border-white/[0.04] transition-colors hover:bg-white/[0.03] ${selectedIds.has(item.id) ? 'bg-indigo-500/[0.08]' : ''}`}
                >
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleItem(item.id)} onClick={(e) => e.stopPropagation()} className="rounded border-white/20" />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-white/80">{item.title}</p>
                    {item.brand && <p className="text-[10px] text-white/30">{item.brand}</p>}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${item.labelPrinted ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-white/[0.07] text-white/30'}`}>
                      {item.labelPrinted ? 'Printed' : 'Not printed'}
                    </span>
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
