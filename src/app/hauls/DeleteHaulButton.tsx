'use client'

import { deleteHaul } from '@/lib/actions/hauls'
import { useRouter } from 'next/navigation'

export function DeleteHaulButton({ id }: { id: string }) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Delete this haul and ALL its items? This cannot be undone.')) return
    await deleteHaul(id)
    router.refresh()
  }

  return (
    <button onClick={handleDelete} className="text-red-400/60 hover:text-red-400 transition-colors">
      Delete
    </button>
  )
}
