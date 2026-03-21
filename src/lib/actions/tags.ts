'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function getTags() {
  return prisma.tag.findMany({ orderBy: { name: 'asc' } })
}

export async function createTag(name: string, color?: string) {
  const tag = await prisma.tag.create({
    data: { name, color: color || null },
  })
  revalidatePath('/items')
  revalidatePath('/settings')
  return tag
}

export async function assignTags(itemId: string, tagIds: string[]) {
  const item = await prisma.item.update({
    where: { id: itemId },
    data: {
      tags: { set: tagIds.map((id) => ({ id })) },
    },
    include: { tags: true },
  })
  revalidatePath('/items')
  return item
}
