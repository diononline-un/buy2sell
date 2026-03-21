'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export interface HaulData {
  name: string
  source?: string
  date?: Date | string
  totalCost: number | string
  notes?: string
}

export async function createHaul(data: HaulData) {
  const haul = await prisma.haul.create({
    data: {
      name: data.name,
      source: data.source || null,
      date: data.date ? new Date(data.date) : new Date(),
      totalCost: Number(data.totalCost),
      notes: data.notes || null,
    },
  })
  revalidatePath('/hauls')
  revalidatePath('/')
  return haul
}

export async function updateHaul(id: string, data: Partial<HaulData>) {
  const haul = await prisma.haul.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.source !== undefined && { source: data.source || null }),
      ...(data.date !== undefined && { date: new Date(data.date!) }),
      ...(data.totalCost !== undefined && { totalCost: Number(data.totalCost) }),
      ...(data.notes !== undefined && { notes: data.notes || null }),
    },
  })
  revalidatePath('/hauls')
  revalidatePath(`/hauls/${id}`)
  revalidatePath('/')
  return haul
}

export async function deleteHaul(id: string) {
  await prisma.haul.delete({ where: { id } })
  revalidatePath('/hauls')
  revalidatePath('/')
}

export async function getHauls() {
  const hauls = await prisma.haul.findMany({
    orderBy: { date: 'desc' },
    include: {
      items: {
        include: {
          sales: true,
        },
      },
    },
  })

  return hauls.map((haul) => {
    const soldItems = haul.items.filter((item) => item.status === 'SOLD')
    const totalRevenue = soldItems.reduce((sum, item) => {
      const itemRevenue = item.sales.reduce((s, sale) => s + Number(sale.salePrice), 0)
      return sum + itemRevenue
    }, 0)
    const totalFees = soldItems.reduce((sum, item) => {
      return (
        sum +
        item.sales.reduce(
          (s, sale) => s + Number(sale.platformFee ?? 0) + Number(sale.shippingCost ?? 0),
          0
        )
      )
    }, 0)
    const totalCostAllocated = haul.items.reduce(
      (sum, item) => sum + Number(item.purchasePrice ?? 0),
      0
    )
    const profit = totalRevenue - totalFees - totalCostAllocated

    return {
      ...haul,
      totalCost: Number(haul.totalCost),
      itemCount: haul.items.length,
      soldCount: soldItems.length,
      totalRevenue,
      profit,
    }
  })
}

export async function getHaul(id: string) {
  return prisma.haul.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          tags: true,
          sales: {
            include: { platform: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}
