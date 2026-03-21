'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export interface SaleData {
  itemId: string
  salePrice: number | string
  shippingCost?: number | string
  platformFee?: number | string
  saleDate?: Date | string
  buyerName?: string
  trackingNumber?: string
  notes?: string
  platformId?: string
}

export async function createSale(data: SaleData) {
  const sale = await prisma.sale.create({
    data: {
      itemId: data.itemId,
      salePrice: Number(data.salePrice),
      shippingCost: data.shippingCost != null ? Number(data.shippingCost) : null,
      platformFee: data.platformFee != null ? Number(data.platformFee) : null,
      saleDate: data.saleDate ? new Date(data.saleDate) : new Date(),
      buyerName: data.buyerName || null,
      trackingNumber: data.trackingNumber || null,
      notes: data.notes || null,
      platformId: data.platformId || null,
    },
    include: { platform: true },
  })

  // Update item status to SOLD
  await prisma.item.update({
    where: { id: data.itemId },
    data: { status: 'SOLD' },
  })

  revalidatePath('/items')
  revalidatePath('/')
  return sale
}

export async function deleteSale(id: string) {
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: { item: { select: { id: true, haulId: true } } },
  })

  await prisma.sale.delete({ where: { id } })

  // Revert item to LISTED if no more sales
  if (sale) {
    const remainingSales = await prisma.sale.count({ where: { itemId: sale.itemId } })
    if (remainingSales === 0) {
      await prisma.item.update({
        where: { id: sale.itemId },
        data: { status: 'LISTED' },
      })
    }
  }

  revalidatePath('/items')
  revalidatePath('/')
}

type Period = 'week' | 'month' | 'quarter' | 'all'

function getPeriodDate(period: Period): Date | null {
  const now = new Date()
  switch (period) {
    case 'week':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
    case 'month':
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    case 'quarter':
      return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
    case 'all':
    default:
      return null
  }
}

export async function getSalesStats(period: Period = 'all') {
  const since = getPeriodDate(period)
  const where = since ? { saleDate: { gte: since } } : {}

  const sales = await prisma.sale.findMany({
    where,
    include: {
      item: { select: { purchasePrice: true, haulId: true, title: true } },
      platform: { select: { id: true, name: true, color: true } },
    },
  })

  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.salePrice), 0)
  const totalFees = sales.reduce(
    (sum, s) => sum + Number(s.platformFee ?? 0) + Number(s.shippingCost ?? 0),
    0
  )
  const totalCost = sales.reduce((sum, s) => sum + Number(s.item.purchasePrice ?? 0), 0)
  const totalProfit = totalRevenue - totalFees - totalCost
  const roi = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0
  const avgMargin = sales.length > 0 ? totalProfit / sales.length : 0

  // Platform breakdown
  const platformMap = new Map<string, { name: string; color: string | null; count: number; revenue: number }>()
  for (const sale of sales) {
    const key = sale.platform?.id ?? 'none'
    const name = sale.platform?.name ?? 'Unknown'
    const color = sale.platform?.color ?? null
    const existing = platformMap.get(key) ?? { name, color, count: 0, revenue: 0 }
    existing.count += 1
    existing.revenue += Number(sale.salePrice)
    platformMap.set(key, existing)
  }
  const platformBreakdown = Array.from(platformMap.values())

  // Haul breakdown
  const haulMap = new Map<
    string,
    { haulId: string; count: number; revenue: number; cost: number }
  >()
  for (const sale of sales) {
    const haulId = sale.item.haulId
    const existing = haulMap.get(haulId) ?? { haulId, count: 0, revenue: 0, cost: 0 }
    existing.count += 1
    existing.revenue += Number(sale.salePrice)
    existing.cost += Number(sale.item.purchasePrice ?? 0)
    haulMap.set(haulId, existing)
  }

  return {
    totalRevenue,
    totalFees,
    totalCost,
    totalProfit,
    roi,
    avgMargin,
    itemsSold: sales.length,
    platformBreakdown,
  }
}

export async function getDashboardData(period: Period = 'all') {
  const stats = await getSalesStats(period)

  // Haul drilldown
  const hauls = await prisma.haul.findMany({
    include: {
      items: {
        include: {
          sales: true,
        },
      },
    },
    orderBy: { date: 'desc' },
  })

  const haulDrilldown = hauls.map((haul) => {
    const soldItems = haul.items.filter((item) => item.status === 'SOLD')
    const revenue = soldItems.reduce(
      (sum, item) => sum + item.sales.reduce((s, sale) => s + Number(sale.salePrice), 0),
      0
    )
    const fees = soldItems.reduce(
      (sum, item) =>
        sum +
        item.sales.reduce(
          (s, sale) => s + Number(sale.platformFee ?? 0) + Number(sale.shippingCost ?? 0),
          0
        ),
      0
    )
    const cost = haul.items.reduce((sum, item) => sum + Number(item.purchasePrice ?? 0), 0)
    const profit = revenue - fees - cost

    return {
      id: haul.id,
      name: haul.name,
      source: haul.source,
      date: haul.date,
      itemCount: haul.items.length,
      soldCount: soldItems.length,
      totalCost: Number(haul.totalCost),
      revenue,
      profit,
    }
  })

  // Winners: items where source1688Id is repeated and are SOLD
  const winners = await prisma.item.groupBy({
    by: ['source1688Id'],
    where: {
      source1688Id: { not: null },
      status: 'SOLD',
    },
    _count: { source1688Id: true },
    having: { source1688Id: { _count: { gt: 1 } } },
  })

  return {
    ...stats,
    haulDrilldown,
    winners,
  }
}
