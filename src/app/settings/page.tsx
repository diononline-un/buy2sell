'use client'

import { useState, useEffect } from 'react'
import { getPlatforms, createPlatform, updatePlatform, deletePlatform } from '@/lib/actions/platforms'
import { createTag, getTags } from '@/lib/actions/tags'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface Platform { id: string; name: string; url?: string | null; feePercent?: number | string | null; color?: string | null }
interface Tag { id: string; name: string; color?: string | null }

export default function SettingsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null)
  const [saving, setSaving] = useState(false)
  const [newPlatform, setNewPlatform] = useState({ name: '', url: '', feePercent: '', color: '#6366f1' })
  const [newTag, setNewTag] = useState({ name: '', color: '#6366f1' })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const [p, t] = await Promise.all([getPlatforms(), getTags()])
    setPlatforms(p)
    setTags(t)
  }

  const handleCreatePlatform = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPlatform.name) return
    setSaving(true)
    try {
      await createPlatform({ name: newPlatform.name, url: newPlatform.url || undefined, feePercent: newPlatform.feePercent ? Number(newPlatform.feePercent) : undefined, color: newPlatform.color || undefined })
      setNewPlatform({ name: '', url: '', feePercent: '', color: '#6366f1' })
      await loadData()
    } finally { setSaving(false) }
  }

  const handleUpdatePlatform = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPlatform) return
    setSaving(true)
    try {
      await updatePlatform(editingPlatform.id, { name: editingPlatform.name, url: editingPlatform.url || undefined, feePercent: editingPlatform.feePercent != null ? Number(editingPlatform.feePercent) : undefined, color: editingPlatform.color || undefined })
      setEditingPlatform(null)
      await loadData()
    } finally { setSaving(false) }
  }

  const handleDeletePlatform = async (id: string) => {
    if (!confirm('Delete this platform?')) return
    await deletePlatform(id)
    await loadData()
  }

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTag.name) return
    setSaving(true)
    try {
      await createTag(newTag.name, newTag.color || undefined)
      setNewTag({ name: '', color: '#6366f1' })
      await loadData()
    } finally { setSaving(false) }
  }

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <h1 className="text-xl font-semibold text-white">Settings</h1>

      {/* Platforms */}
      <div className="rounded-2xl p-5 space-y-4 glass-md shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        <h2 className="text-sm font-semibold text-white">Platforms</h2>

        <div className="space-y-2">
          {platforms.map((platform) => (
            <div key={platform.id} className="flex items-center justify-between rounded-xl border border-white/[0.07] px-4 py-3 bg-white/[0.03]">
              {editingPlatform?.id === platform.id ? (
                <form onSubmit={handleUpdatePlatform} className="flex flex-1 flex-wrap items-end gap-2">
                  <Input label="Name" value={editingPlatform.name} onChange={(e) => setEditingPlatform({ ...editingPlatform, name: e.target.value })} className="w-28" />
                  <Input label="URL" value={editingPlatform.url ?? ''} onChange={(e) => setEditingPlatform({ ...editingPlatform, url: e.target.value })} className="w-36" />
                  <Input label="Fee %" type="number" step="0.1" value={editingPlatform.feePercent != null ? String(editingPlatform.feePercent) : ''} onChange={(e) => setEditingPlatform({ ...editingPlatform, feePercent: e.target.value })} className="w-16" />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Color</label>
                    <input type="color" value={editingPlatform.color ?? '#6366f1'} onChange={(e) => setEditingPlatform({ ...editingPlatform, color: e.target.value })} className="h-9 w-10 cursor-pointer rounded-lg border border-white/10 bg-transparent p-1" />
                  </div>
                  <Button size="sm" type="submit" disabled={saving}>Save</Button>
                  <Button size="sm" variant="ghost" type="button" onClick={() => setEditingPlatform(null)}>Cancel</Button>
                </form>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    {platform.color && <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: platform.color }} />}
                    <div>
                      <p className="text-sm font-medium text-white/90">{platform.name}</p>
                      <p className="text-xs text-white/35">
                        {platform.feePercent != null ? `${platform.feePercent}% fee` : 'No fee'}
                        {platform.url && ` · ${platform.url}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setEditingPlatform(platform)} className="text-xs text-indigo-400/70 hover:text-indigo-400 transition-colors">Edit</button>
                    <button onClick={() => handleDeletePlatform(platform.id)} className="text-xs text-red-400/60 hover:text-red-400 transition-colors">Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleCreatePlatform} className="flex flex-wrap items-end gap-2 pt-2 border-t border-white/[0.07]">
          <Input label="Name *" placeholder="Platform name" value={newPlatform.name} onChange={(e) => setNewPlatform({ ...newPlatform, name: e.target.value })} className="w-28" />
          <Input label="URL" placeholder="https://..." value={newPlatform.url} onChange={(e) => setNewPlatform({ ...newPlatform, url: e.target.value })} className="w-36" />
          <Input label="Fee %" type="number" step="0.1" placeholder="0" value={newPlatform.feePercent} onChange={(e) => setNewPlatform({ ...newPlatform, feePercent: e.target.value })} className="w-16" />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Color</label>
            <input type="color" value={newPlatform.color} onChange={(e) => setNewPlatform({ ...newPlatform, color: e.target.value })} className="h-9 w-10 cursor-pointer rounded-lg border border-white/10 bg-transparent p-1" />
          </div>
          <Button type="submit" size="sm" disabled={saving || !newPlatform.name}>+ Add</Button>
        </form>
      </div>

      {/* Tags */}
      <div className="rounded-2xl p-5 space-y-4 glass-md shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        <h2 className="text-sm font-semibold text-white">Tags</h2>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-full px-3 py-1 text-xs font-medium border"
              style={tag.color ? { backgroundColor: tag.color + '22', color: tag.color, borderColor: tag.color + '40' } : {}}
            >
              {tag.name}
            </span>
          ))}
          {tags.length === 0 && <p className="text-xs text-white/30">No tags yet.</p>}
        </div>

        <form onSubmit={handleCreateTag} className="flex items-end gap-2 pt-2 border-t border-white/[0.07]">
          <Input label="Tag Name *" placeholder="e.g. Electronics" value={newTag.name} onChange={(e) => setNewTag({ ...newTag, name: e.target.value })} className="w-40" />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Color</label>
            <input type="color" value={newTag.color} onChange={(e) => setNewTag({ ...newTag, color: e.target.value })} className="h-9 w-10 cursor-pointer rounded-lg border border-white/10 bg-transparent p-1" />
          </div>
          <Button type="submit" size="sm" disabled={saving || !newTag.name}>+ Add</Button>
        </form>
      </div>
    </div>
  )
}
