'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { ItemStatus, Condition } from '@prisma/client'

export interface ItemData {
  title: string
  titleOriginal?: string
  description?: string
  brand?: string
  itemType?: string
  category?: string
  condition?: Condition
  purchasePrice?: number | string
  askingPrice?: number | string
  status?: ItemStatus
  storageLocation?: string
  notes?: string
  sourceAgent?: string
  sourceItemId?: string
  sourceOrderId?: string
  source1688Id?: string
  sourceUrl?: string
  variant?: string
  haulId: string
  tagIds?: string[]
}

export interface ItemFilters {
  status?: ItemStatus
  haulId?: string
  search?: string
  tags?: string[]
}

export async function createItem(data: ItemData) {
  const { tagIds, ...rest } = data
  const item = await prisma.item.create({
    data: {
      ...rest,
      purchasePrice: rest.purchasePrice != null ? Number(rest.purchasePrice) : null,
      askingPrice: rest.askingPrice != null ? Number(rest.askingPrice) : null,
      condition: rest.condition ?? 'GOOD',
      status: rest.status ?? 'UNLISTED',
      tags: tagIds?.length
        ? { connect: tagIds.map((id) => ({ id })) }
        : undefined,
    },
    include: { images: true, tags: true },
  })
  revalidatePath('/items')
  revalidatePath(`/hauls/${data.haulId}`)
  return item
}

export async function updateItem(id: string, data: Partial<ItemData>) {
  const { tagIds, haulId, ...rest } = data
  const item = await prisma.item.update({
    where: { id },
    data: {
      ...rest,
      ...(rest.purchasePrice !== undefined && {
        purchasePrice: rest.purchasePrice != null ? Number(rest.purchasePrice) : null,
      }),
      ...(rest.askingPrice !== undefined && {
        askingPrice: rest.askingPrice != null ? Number(rest.askingPrice) : null,
      }),
      ...(tagIds !== undefined && {
        tags: { set: tagIds.map((tid) => ({ id: tid })) },
      }),
    },
    include: { images: true, tags: true, sales: { include: { platform: true } } },
  })
  revalidatePath('/items')
  revalidatePath(`/hauls/${item.haulId}`)
  return item
}

export async function deleteItem(id: string) {
  const item = await prisma.item.findUnique({ where: { id }, select: { haulId: true } })
  await prisma.item.delete({ where: { id } })
  revalidatePath('/items')
  if (item) revalidatePath(`/hauls/${item.haulId}`)
}

export async function getItems(filters?: ItemFilters) {
  const where: Record<string, unknown> = {}

  if (filters?.status) {
    where.status = filters.status
  }
  if (filters?.haulId) {
    where.haulId = filters.haulId
  }
  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { brand: { contains: filters.search, mode: 'insensitive' } },
      { itemType: { contains: filters.search, mode: 'insensitive' } },
    ]
  }
  if (filters?.tags && filters.tags.length > 0) {
    where.tags = { some: { id: { in: filters.tags } } }
  }

  return prisma.item.findMany({
    where,
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      tags: true,
      sales: { include: { platform: true } },
      haul: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getItem(id: string) {
  return prisma.item.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      tags: true,
      sales: { include: { platform: true }, orderBy: { saleDate: 'desc' } },
      haul: true,
    },
  })
}

export async function updateItemStatus(id: string, status: ItemStatus) {
  const item = await prisma.item.update({
    where: { id },
    data: { status },
  })
  revalidatePath('/items')
  revalidatePath(`/hauls/${item.haulId}`)
  return item
}

export async function setLabelPrinted(ids: string[]) {
  await prisma.item.updateMany({
    where: { id: { in: ids } },
    data: { labelPrinted: true },
  })
  revalidatePath('/items')
  revalidatePath('/labels')
}

export async function bulkUpdateStatus(ids: string[], status: ItemStatus) {
  await prisma.item.updateMany({
    where: { id: { in: ids } },
    data: { status },
  })
  revalidatePath('/items')
}
