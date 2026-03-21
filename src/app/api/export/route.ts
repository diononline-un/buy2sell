import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function GET(req: NextRequest) {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        item: {
          include: {
            haul: { select: { name: true } },
          },
        },
        platform: { select: { name: true } },
      },
      orderBy: { saleDate: 'desc' },
    })

    const headers = [
      'Sale ID',
      'Sale Date',
      'Item ID',
      'Item Title',
      'Brand',
      'Item Type',
      'Haul',
      'Platform',
      'Sale Price',
      'Shipping Cost',
      'Platform Fee',
      'Purchase Price',
      'Profit',
      'Buyer Name',
      'Tracking Number',
      'Notes',
    ]

    const rows = sales.map((sale) => {
      const purchasePrice = Number(sale.item.purchasePrice ?? 0)
      const salePrice = Number(sale.salePrice)
      const shippingCost = Number(sale.shippingCost ?? 0)
      const platformFee = Number(sale.platformFee ?? 0)
      const profit = salePrice - purchasePrice - shippingCost - platformFee

      return [
        sale.id,
        new Date(sale.saleDate).toISOString().split('T')[0],
        sale.item.id,
        sale.item.title,
        sale.item.brand ?? '',
        sale.item.itemType ?? '',
        sale.item.haul.name,
        sale.platform?.name ?? '',
        salePrice.toFixed(2),
        shippingCost.toFixed(2),
        platformFee.toFixed(2),
        purchasePrice.toFixed(2),
        profit.toFixed(2),
        sale.buyerName ?? '',
        sale.trackingNumber ?? '',
        sale.notes ?? '',
      ].map(escapeCSV)
    })

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="buy2sell-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 })
  }
}
