'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { parseImportText, ParsedItem } from '@/lib/actions/import'
import { getHauls } from '@/lib/actions/hauls'
import { createItem } from '@/lib/actions/items'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import Link from 'next/link'

interface Haul { id: string; name: string }

function ImportContent() {
  const searchParams = useSearchParams()
  const defaultHaulId = searchParams.get('haulId') ?? ''

  const [hauls, setHauls] = useState<Haul[]>([])
  const [haulId, setHaulId] = useState(defaultHaulId)
  const [pasteText, setPasteText] = useState('')
  const [parsing, setParsing] = useState(false)
  const [parsed, setParsed] = useState<ParsedItem[]>([])
  const [error, setError] = useState('')
  const [importing, setImporting] = useState(false)
  const [importedCount, setImportedCount] = useState(0)
  const [manualForm, setManualForm] = useState({ title: '', brand: '', itemType: '', purchasePrice: '', variant: '', notes: '' })
  const [manualSaving, setManualSaving] = useState(false)

  useEffect(() => {
    getHauls().then((h) => setHauls(h.map((haul) => ({ id: haul.id, name: haul.name }))))
  }, [])

  const handleParse = async () => {
    if (!pasteText.trim()) { setError('Please paste order text first.'); return }
    setParsing(true); setError('')
    try {
      const result = await parseImportText(pasteText)
      setParsed(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse. Check your API key.')
    } finally { setParsing(false) }
  }

  const handleImport = async () => {
    if (!haulId) { setError('Please select a haul first.'); return }
    if (parsed.length === 0) return
    setImporting(true)
    let count = 0
    for (const item of parsed) {
      await createItem({ title: item.title, titleOriginal: item.titleOriginal, brand: item.brand, itemType: item.itemType, variant: item.variant, purchasePrice: item.purchasePrice, sourceAgent: item.sourceAgent, sourceItemId: item.sourceItemId, sourceOrderId: item.sourceOrderId, source1688Id: item.source1688Id, sourceUrl: item.sourceUrl, haulId })
      count++
    }
    setImportedCount(count); setParsed([]); setPasteText(''); setImporting(false)
  }

  const updateParsedItem = (index: number, field: keyof ParsedItem, value: string) => {
    setParsed((prev) => { const next = [...prev]; next[index] = { ...next[index], [field]: value }; return next })
  }

  const handleManualCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!haulId || !manualForm.title) return
    setManualSaving(true)
    try {
      await createItem({ title: manualForm.title, brand: manualForm.brand || undefined, itemType: manualForm.itemType || undefined, purchasePrice: manualForm.purchasePrice ? Number(manualForm.purchasePrice) : undefined, variant: manualForm.variant || undefined, notes: manualForm.notes || undefined, haulId })
      setManualForm({ title: '', brand: '', itemType: '', purchasePrice: '', variant: '', notes: '' })
      setImportedCount((c) => c + 1)
    } finally { setManualSaving(false) }
  }

  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-white">Import Items</h1>
        <p className="text-xs text-white/35 mt-0.5">Paste ACBuy or GTBuy order data to import with AI, or add manually.</p>
      </div>

      {importedCount > 0 && (
        <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          {importedCount} item(s) imported!{' '}
          {haulId && <Link href={`/hauls/${haulId}`} className="underline hover:text-emerald-300">View haul →</Link>}
        </div>
      )}

      {/* Haul selector */}
      <div className="mb-5 max-w-xs">
        <Select label="Target Haul *" value={haulId} onChange={(e) => setHaulId(e.target.value)}>
          <option value="">Select a haul...</option>
          {hauls.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
        </Select>
        {!haulId && (
          <p className="mt-1.5 text-xs text-white/30">
            No haul? <Link href="/hauls/new" className="text-indigo-400 hover:text-indigo-300">Create one first</Link>
          </p>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* AI Import */}
        <div className="rounded-2xl p-5 space-y-4 glass-md shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div>
            <h2 className="text-sm font-semibold text-white">AI Import (ACBuy / GTBuy)</h2>
            <p className="text-xs text-white/35 mt-0.5">Paste order page text. AI extracts and translates items.</p>
          </div>

          <textarea
            rows={8}
            placeholder="Paste your ACBuy or GTBuy order data here..."
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm font-mono text-white placeholder:text-white/20 focus:outline-none focus:ring-1 bg-white/[0.05] border border-white/[0.08] focus:border-indigo-500/50 focus:ring-indigo-500/30 resize-none"
          />

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</div>
          )}

          <Button onClick={handleParse} disabled={parsing || !pasteText.trim()} size="sm">
            {parsing ? 'Parsing with AI...' : 'Parse with AI'}
          </Button>

          {parsed.length > 0 && (
            <div>
              <p className="mb-2 text-xs text-white/50">{parsed.length} item(s) detected — review below:</p>
              <div className="overflow-x-auto rounded-xl border border-white/[0.07] bg-white/[0.02]">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.07]">
                      {['Title','Brand','Type','Price','Agent'].map((h) => (
                        <th key={h} className="px-2 py-2 text-left font-medium text-white/30 text-[10px] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.map((item, i) => (
                      <tr key={i} className="border-b border-white/[0.04]">
                        <td className="px-2 py-1.5">
                          <input className="w-full rounded border border-white/[0.08] bg-white/[0.05] px-1.5 py-0.5 text-xs text-white focus:outline-none focus:border-indigo-500/40" value={item.title} onChange={(e) => updateParsedItem(i, 'title', e.target.value)} />
                        </td>
                        <td className="px-2 py-1.5">
                          <input className="w-20 rounded border border-white/[0.08] bg-white/[0.05] px-1.5 py-0.5 text-xs text-white focus:outline-none focus:border-indigo-500/40" value={item.brand ?? ''} onChange={(e) => updateParsedItem(i, 'brand', e.target.value)} />
                        </td>
                        <td className="px-2 py-1.5">
                          <input className="w-20 rounded border border-white/[0.08] bg-white/[0.05] px-1.5 py-0.5 text-xs text-white focus:outline-none focus:border-indigo-500/40" value={item.itemType ?? ''} onChange={(e) => updateParsedItem(i, 'itemType', e.target.value)} />
                        </td>
                        <td className="px-2 py-1.5">
                          <input className="w-14 rounded border border-white/[0.08] bg-white/[0.05] px-1.5 py-0.5 text-xs text-white focus:outline-none focus:border-indigo-500/40" type="number" step="0.01" value={item.purchasePrice ?? ''} onChange={(e) => updateParsedItem(i, 'purchasePrice', e.target.value)} />
                        </td>
                        <td className="px-2 py-1.5 text-white/30">{item.sourceAgent ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={handleImport} disabled={importing || !haulId}>
                  {importing ? 'Importing...' : `Import ${parsed.length} items`}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setParsed([])}>Clear</Button>
              </div>
            </div>
          )}
        </div>

        {/* Manual form */}
        <div className="rounded-2xl p-5 space-y-4 glass-md shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <h2 className="text-sm font-semibold text-white">Manual Entry</h2>
          <form onSubmit={handleManualCreate} className="space-y-3">
            <Input label="Title *" value={manualForm.title} onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })} required />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Brand" value={manualForm.brand} onChange={(e) => setManualForm({ ...manualForm, brand: e.target.value })} />
              <Input label="Item Type" value={manualForm.itemType} onChange={(e) => setManualForm({ ...manualForm, itemType: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Purchase Price (€)" type="number" step="0.01" value={manualForm.purchasePrice} onChange={(e) => setManualForm({ ...manualForm, purchasePrice: e.target.value })} />
              <Input label="Variant" value={manualForm.variant} onChange={(e) => setManualForm({ ...manualForm, variant: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Notes</label>
              <textarea rows={2} value={manualForm.notes} onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })} className="rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 bg-white/[0.07] border border-white/[0.08] focus:border-indigo-500/50 focus:ring-indigo-500/30 resize-none" />
            </div>
            <Button type="submit" size="sm" disabled={manualSaving || !haulId || !manualForm.title}>
              {manualSaving ? 'Adding...' : 'Add Item'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function ImportPage() {
  return (
    <Suspense fallback={<div className="p-6 text-white/30">Loading...</div>}>
      <ImportContent />
    </Suspense>
  )
}
