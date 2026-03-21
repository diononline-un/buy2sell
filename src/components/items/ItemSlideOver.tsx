'use client'

import { useState, useEffect } from 'react'
import { ItemStatus, Condition } from '@prisma/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { StatusBadge } from './StatusBadge'
import { formatCurrency, formatDate, calcProfit } from '@/lib/utils'
import { updateItem, updateItemStatus, deleteItem } from '@/lib/actions/items'
import { createSale, deleteSale } from '@/lib/actions/sales'
import { uploadImage, deleteImage, setPrimaryImage } from '@/lib/actions/images'
import { assignTags } from '@/lib/actions/tags'
import Image from 'next/image'

const CONDITIONS: { value: Condition; label: string }[] = [
  { value: 'NEW', label: 'New' }, { value: 'LIKE_NEW', label: 'Like New' },
  { value: 'VERY_GOOD', label: 'Very Good' }, { value: 'GOOD', label: 'Good' },
  { value: 'ACCEPTABLE', label: 'Acceptable' }, { value: 'PARTS_ONLY', label: 'Parts Only' },
]

const STATUSES: { value: ItemStatus; label: string }[] = [
  { value: 'UNLISTED', label: 'Unlisted' }, { value: 'LISTED', label: 'Listed' },
  { value: 'RESERVED', label: 'Reserved' }, { value: 'SOLD', label: 'Sold' },
  { value: 'RETURNED', label: 'Returned' }, { value: 'KEPT', label: 'Kept' },
  { value: 'DISCARDED', label: 'Discarded' },
]

interface Tag { id: string; name: string; color?: string | null }
interface Platform { id: string; name: string; feePercent?: number | string | null }
interface SaleRecord {
  id: string; salePrice: number | string; shippingCost?: number | string | null
  platformFee?: number | string | null; saleDate: Date | string
  buyerName?: string | null; trackingNumber?: string | null; platform?: Platform | null
}
interface ImageRecord { id: string; url: string; alt?: string | null; isPrimary: boolean }

interface ItemSlideOverProps {
  item: {
    id: string; title: string; titleOriginal?: string | null; description?: string | null
    brand?: string | null; itemType?: string | null; category?: string | null
    condition: Condition; purchasePrice?: number | string | null; askingPrice?: number | string | null
    status: ItemStatus; storageLocation?: string | null; notes?: string | null
    variant?: string | null; sourceAgent?: string | null; sourceUrl?: string | null
    source1688Id?: string | null; haulId: string; images: ImageRecord[]
    tags: Tag[]; sales: SaleRecord[]
  } | null
  open: boolean
  onClose: () => void
  allTags?: Tag[]
  platforms?: Platform[]
  onUpdated?: () => void
}

export function ItemSlideOver({ item, open, onClose, allTags = [], platforms = [], onUpdated }: ItemSlideOverProps) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showSaleForm, setShowSaleForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'sales' | 'images' | 'tags'>('details')

  const [form, setForm] = useState({
    title: '', brand: '', itemType: '', category: '', condition: 'GOOD' as Condition,
    purchasePrice: '', askingPrice: '', storageLocation: '', notes: '', description: '', variant: '',
  })
  const [saleForm, setSaleForm] = useState({
    salePrice: '', shippingCost: '', platformFee: '', platformId: '',
    buyerName: '', trackingNumber: '', notes: '',
  })

  useEffect(() => {
    if (item) {
      setForm({
        title: item.title, brand: item.brand ?? '', itemType: item.itemType ?? '',
        category: item.category ?? '', condition: item.condition,
        purchasePrice: item.purchasePrice ? String(item.purchasePrice) : '',
        askingPrice: item.askingPrice ? String(item.askingPrice) : '',
        storageLocation: item.storageLocation ?? '', notes: item.notes ?? '',
        description: item.description ?? '', variant: item.variant ?? '',
      })
      setEditing(false)
      setShowSaleForm(false)
    }
  }, [item?.id])

  if (!open || !item) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateItem(item.id, {
        title: form.title, brand: form.brand || undefined, itemType: form.itemType || undefined,
        category: form.category || undefined, condition: form.condition,
        purchasePrice: form.purchasePrice ? Number(form.purchasePrice) : undefined,
        askingPrice: form.askingPrice ? Number(form.askingPrice) : undefined,
        storageLocation: form.storageLocation || undefined, notes: form.notes || undefined,
        description: form.description || undefined, variant: form.variant || undefined,
      })
      setEditing(false)
      onUpdated?.()
    } finally { setSaving(false) }
  }

  const handleStatusChange = async (newStatus: ItemStatus) => {
    await updateItemStatus(item.id, newStatus)
    onUpdated?.()
  }

  const handleDelete = async () => {
    if (!confirm('Delete this item? This cannot be undone.')) return
    await deleteItem(item.id)
    onClose(); onUpdated?.()
  }

  const handleCreateSale = async () => {
    if (!saleForm.salePrice) return
    setSaving(true)
    try {
      await createSale({ itemId: item.id, salePrice: Number(saleForm.salePrice), shippingCost: saleForm.shippingCost ? Number(saleForm.shippingCost) : undefined, platformFee: saleForm.platformFee ? Number(saleForm.platformFee) : undefined, platformId: saleForm.platformId || undefined, buyerName: saleForm.buyerName || undefined, trackingNumber: saleForm.trackingNumber || undefined, notes: saleForm.notes || undefined })
      setShowSaleForm(false)
      setSaleForm({ salePrice: '', shippingCost: '', platformFee: '', platformId: '', buyerName: '', trackingNumber: '', notes: '' })
      onUpdated?.()
    } finally { setSaving(false) }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    for (const file of Array.from(files)) {
      const fd = new FormData(); fd.append('file', file)
      await uploadImage(fd, item.id)
    }
    onUpdated?.()
  }

  const handleTagToggle = async (tagId: string) => {
    const currentIds = item.tags.map((t) => t.id)
    const newIds = currentIds.includes(tagId) ? currentIds.filter((id) => id !== tagId) : [...currentIds, tagId]
    await assignTags(item.id, newIds)
    onUpdated?.()
  }

  const totalProfit = item.sales.reduce((sum, sale) => sum + calcProfit(sale.salePrice, item.purchasePrice, sale.platformFee, sale.shippingCost), 0)

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-xl flex-col overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.6)]"
        style={{
          background: 'rgba(14,14,30,0.85)',
          backdropFilter: 'blur(32px) saturate(200%)',
          WebkitBackdropFilter: 'blur(32px) saturate(200%)',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <StatusBadge status={item.status} />
            {item.sourceAgent && (
              <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] text-white/40">
                {item.sourceAgent}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <>
                <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>Edit</Button>
                <Button size="sm" variant="danger" onClick={handleDelete}>Delete</Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
              </>
            )}
            <button onClick={onClose} className="ml-1 rounded-lg p-1.5 text-white/30 hover:bg-white/[0.07] hover:text-white/70 transition-all">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Status workflow */}
        <div className="flex gap-1 overflow-x-auto border-b border-white/[0.07] px-4 py-2.5">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => handleStatusChange(s.value)}
              disabled={item.status === s.value}
              className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
                item.status === s.value
                  ? 'bg-indigo-500/80 text-white shadow-[0_2px_8px_rgba(99,102,241,0.3)]'
                  : 'bg-white/[0.06] text-white/40 hover:bg-white/[0.10] hover:text-white/70'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/[0.07]">
          {(['details', 'sales', 'images', 'tags'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-xs font-medium capitalize transition-all ${
                activeTab === tab
                  ? 'border-b-2 border-indigo-400 text-indigo-400'
                  : 'text-white/35 hover:text-white/60'
              }`}
            >
              {tab}
              {tab === 'sales' && item.sales.length > 0 && (
                <span className="ml-1.5 rounded-full bg-emerald-500/20 px-1.5 text-[10px] text-emerald-400">
                  {item.sales.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {activeTab === 'details' && (
            <div className="space-y-4">
              {editing ? (
                <>
                  <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
                    <Input label="Item Type" value={form.itemType} onChange={(e) => setForm({ ...form, itemType: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Purchase Price (€)" type="number" step="0.01" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} />
                    <Input label="Asking Price (€)" type="number" step="0.01" value={form.askingPrice} onChange={(e) => setForm({ ...form, askingPrice: e.target.value })} />
                  </div>
                  <Select label="Condition" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value as Condition })} options={CONDITIONS} />
                  <Input label="Variant" value={form.variant} onChange={(e) => setForm({ ...form, variant: e.target.value })} />
                  <Input label="Storage Location" value={form.storageLocation} onChange={(e) => setForm({ ...form, storageLocation: e.target.value })} />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Notes</label>
                    <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 bg-white/[0.07] border border-white/[0.08] focus:border-indigo-500/50 focus:ring-indigo-500/30 resize-none" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h3 className="text-base font-semibold text-white">{item.title}</h3>
                    {item.titleOriginal && <p className="mt-0.5 text-xs text-white/35">{item.titleOriginal}</p>}
                  </div>

                  <dl className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
                    {[
                      item.brand && ['Brand', item.brand],
                      item.itemType && ['Type', item.itemType],
                      item.variant && ['Variant', item.variant],
                      item.condition && ['Condition', item.condition.replace('_', ' ')],
                      item.purchasePrice && ['Purchase Price', formatCurrency(item.purchasePrice)],
                      item.askingPrice && ['Asking Price', formatCurrency(item.askingPrice)],
                      item.storageLocation && ['Storage', item.storageLocation],
                      item.source1688Id && ['1688 ID', item.source1688Id],
                    ].filter(Boolean).map(([label, value]) => (
                      <>
                        <dt key={`dt-${label}`} className="text-white/35">{label}</dt>
                        <dd key={`dd-${label}`} className={`font-medium ${label === 'Asking Price' ? 'text-indigo-400' : 'text-white/80'}`}>{value}</dd>
                      </>
                    ))}
                  </dl>

                  {item.notes && (
                    <div className="rounded-xl bg-white/[0.05] p-3 text-xs text-white/50">{item.notes}</div>
                  )}

                  {item.sales.length > 0 && (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.08] p-3">
                      <p className="text-sm font-semibold text-emerald-400">Profit: {formatCurrency(totalProfit)}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'sales' && (
            <div className="space-y-3">
              {item.sales.length === 0 && !showSaleForm && (
                <p className="text-sm text-white/30">No sales recorded yet.</p>
              )}

              {item.sales.map((sale) => (
                <div key={sale.id} className="rounded-xl border border-white/[0.07] p-3 bg-white/[0.03]">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-white/90 text-sm">{formatCurrency(sale.salePrice)}</p>
                      <p className="text-[10px] text-white/35 mt-0.5">{formatDate(sale.saleDate)}</p>
                      {sale.platform && <p className="text-[10px] text-white/35">{sale.platform.name}</p>}
                      {sale.buyerName && <p className="text-[10px] text-white/35">Buyer: {sale.buyerName}</p>}
                      {sale.trackingNumber && <p className="text-[10px] text-white/35">Tracking: {sale.trackingNumber}</p>}
                      <p className="mt-1 text-xs text-emerald-400 font-medium">
                        Profit: {formatCurrency(calcProfit(sale.salePrice, item.purchasePrice, sale.platformFee, sale.shippingCost))}
                      </p>
                    </div>
                    <button onClick={() => { if (confirm('Delete this sale record?')) deleteSale(sale.id).then(() => onUpdated?.()) }} className="text-xs text-red-400/50 hover:text-red-400 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {showSaleForm ? (
                <div className="space-y-3 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.08] p-4">
                  <h4 className="text-sm font-semibold text-white">Record Sale</h4>
                  <Input label="Sale Price (€)" type="number" step="0.01" value={saleForm.salePrice} onChange={(e) => setSaleForm({ ...saleForm, salePrice: e.target.value })} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Shipping Cost (€)" type="number" step="0.01" value={saleForm.shippingCost} onChange={(e) => setSaleForm({ ...saleForm, shippingCost: e.target.value })} />
                    <Input label="Platform Fee (€)" type="number" step="0.01" value={saleForm.platformFee} onChange={(e) => setSaleForm({ ...saleForm, platformFee: e.target.value })} />
                  </div>
                  {platforms.length > 0 && (
                    <Select label="Platform" value={saleForm.platformId} onChange={(e) => {
                      const plat = platforms.find((p) => p.id === e.target.value)
                      const fee = plat?.feePercent ? String((Number(saleForm.salePrice || 0) * Number(plat.feePercent)) / 100) : saleForm.platformFee
                      setSaleForm({ ...saleForm, platformId: e.target.value, platformFee: fee })
                    }}>
                      <option value="">No platform</option>
                      {platforms.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </Select>
                  )}
                  <Input label="Buyer Name" value={saleForm.buyerName} onChange={(e) => setSaleForm({ ...saleForm, buyerName: e.target.value })} />
                  <Input label="Tracking Number" value={saleForm.trackingNumber} onChange={(e) => setSaleForm({ ...saleForm, trackingNumber: e.target.value })} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleCreateSale} disabled={saving}>{saving ? 'Saving...' : 'Record Sale'}</Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowSaleForm(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <Button size="sm" variant="secondary" onClick={() => setShowSaleForm(true)} disabled={item.status === 'SOLD'}>
                  + Record Sale
                </Button>
              )}
            </div>
          )}

          {activeTab === 'images' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {item.images.map((img) => (
                  <div key={img.id} className="relative group">
                    <div className="relative h-24 w-full overflow-hidden rounded-xl bg-white/[0.05]">
                      <Image src={img.url} alt={img.alt || ''} fill className="object-cover" sizes="200px" />
                    </div>
                    {img.isPrimary && (
                      <span className="absolute top-1 left-1 rounded-full bg-indigo-500/80 px-1.5 py-0.5 text-[10px] text-white">Primary</span>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 bg-black/50 rounded-xl transition-opacity">
                      {!img.isPrimary && (
                        <button onClick={() => setPrimaryImage(img.id, item.id).then(() => onUpdated?.())} className="rounded-lg bg-white/20 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">Primary</button>
                      )}
                      <button onClick={() => deleteImage(img.id).then(() => onUpdated?.())} className="rounded-lg bg-red-500/80 px-2 py-1 text-[10px] font-medium text-white">Del</button>
                    </div>
                  </div>
                ))}
              </div>
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-white/15 p-4 hover:border-indigo-500/40 hover:bg-white/[0.03] transition-all">
                <svg className="h-5 w-5 text-white/25" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm text-white/30">Upload images</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
          )}

          {activeTab === 'tags' && (
            <div className="space-y-3">
              <p className="text-xs text-white/30">Click to toggle tag assignment.</p>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => {
                  const assigned = item.tags.some((t) => t.id === tag.id)
                  return (
                    <button
                      key={tag.id}
                      onClick={() => handleTagToggle(tag.id)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-all border ${assigned ? 'opacity-100' : 'opacity-35 hover:opacity-60'}`}
                      style={tag.color ? { backgroundColor: tag.color + '22', color: tag.color, borderColor: tag.color + '40' } : {}}
                    >
                      {assigned ? '✓ ' : ''}{tag.name}
                    </button>
                  )
                })}
                {allTags.length === 0 && <p className="text-xs text-white/30">No tags. Create tags in Settings.</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
