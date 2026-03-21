'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { updateHaul, getHaul } from '@/lib/actions/hauls'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function EditHaulPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', source: '', date: '', totalCost: '', notes: '' })

  useEffect(() => {
    getHaul(id).then((haul) => {
      if (!haul) return
      setForm({
        name: haul.name,
        source: haul.source ?? '',
        date: new Date(haul.date).toISOString().split('T')[0],
        totalCost: String(haul.totalCost),
        notes: haul.notes ?? '',
      })
      setLoading(false)
    })
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.totalCost) return
    setSaving(true)
    try {
      await updateHaul(id, {
        name: form.name,
        source: form.source || undefined,
        date: new Date(form.date),
        totalCost: Number(form.totalCost),
        notes: form.notes || undefined,
      })
      router.push(`/hauls/${id}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6 text-white/40">Loading...</div>

  return (
    <div className="mx-auto max-w-lg p-6">
      <div className="mb-6 flex items-center gap-3">
        <Link href={`/hauls/${id}`} className="text-xs text-white/40 hover:text-white/70 transition-colors">
          ← Haul
        </Link>
        <h1 className="text-xl font-semibold text-white">Edit Haul</h1>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl p-6 space-y-4 glass-md shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        <Input label="Haul Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Input label="Source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
        <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <Input label="Total Cost (€) *" type="number" step="0.01" min="0" value={form.totalCost} onChange={(e) => setForm({ ...form, totalCost: e.target.value })} required />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Notes</label>
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 bg-white/[0.07] border border-white/[0.08] focus:border-indigo-500/50 focus:ring-indigo-500/30 resize-none"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Link href={`/hauls/${id}`}>
            <Button type="button" variant="ghost">Cancel</Button>
          </Link>
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </form>
    </div>
  )
}
