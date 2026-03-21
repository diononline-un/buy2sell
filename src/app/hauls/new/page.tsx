'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createHaul } from '@/lib/actions/hauls'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function NewHaulPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    source: '',
    date: new Date().toISOString().split('T')[0],
    totalCost: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.totalCost) return
    setSaving(true)
    try {
      const haul = await createHaul({
        name: form.name,
        source: form.source || undefined,
        date: new Date(form.date),
        totalCost: Number(form.totalCost),
        notes: form.notes || undefined,
      })
      router.push(`/hauls/${haul.id}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg p-6">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/hauls" className="text-xs text-white/40 hover:text-white/70 transition-colors">
          ← Hauls
        </Link>
        <h1 className="text-xl font-semibold text-white">New Haul</h1>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl p-6 space-y-4 glass-md shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        <Input
          label="Haul Name *"
          placeholder="e.g. ACBuy Order #1234"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <Input
          label="Source"
          placeholder="e.g. ACBuy, GTBuy, Local thrift store"
          value={form.source}
          onChange={(e) => setForm({ ...form, source: e.target.value })}
        />
        <Input
          label="Date"
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
        <Input
          label="Total Cost (€) *"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={form.totalCost}
          onChange={(e) => setForm({ ...form, totalCost: e.target.value })}
          required
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Notes</label>
          <textarea
            rows={3}
            placeholder="Optional notes..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 bg-white/[0.07] border border-white/[0.08] focus:border-indigo-500/50 focus:ring-indigo-500/30 resize-none"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Link href="/hauls">
            <Button type="button" variant="ghost">Cancel</Button>
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? 'Creating...' : 'Create Haul'}
          </Button>
        </div>
      </form>
    </div>
  )
}
