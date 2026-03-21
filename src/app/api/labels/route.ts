import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { renderToBuffer, Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import QRCode from 'qrcode'
import { createElement } from 'react'
import { truncate } from '@/lib/utils'

const LABELS_PER_PAGE = 32

const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    backgroundColor: '#fff',
  },
  label: {
    width: 130,
    height: 90,
    border: '1pt solid #ccc',
    margin: 3,
    padding: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  qr: {
    width: 60,
    height: 60,
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  itemId: {
    fontSize: 7,
    color: '#666',
    fontFamily: 'Courier',
    marginBottom: 3,
  },
  title: {
    fontSize: 7,
    color: '#1a1a1a',
    lineHeight: 1.3,
  },
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const ids: string[] = body.ids ?? []

    if (ids.length === 0) {
      return NextResponse.json({ error: 'No item IDs provided' }, { status: 400 })
    }

    const items = await prisma.item.findMany({
      where: { id: { in: ids } },
      select: { id: true, title: true, brand: true },
    })

    // Generate QR codes as base64 data URLs
    const itemsWithQR = await Promise.all(
      items.map(async (item) => {
        const qrDataUrl = await QRCode.toDataURL(item.id, {
          width: 120,
          margin: 1,
          color: { dark: '#1a1a1a', light: '#ffffff' },
        })
        return { ...item, qrDataUrl }
      })
    )

    // Split into pages
    const pages: (typeof itemsWithQR)[] = []
    for (let i = 0; i < itemsWithQR.length; i += LABELS_PER_PAGE) {
      pages.push(itemsWithQR.slice(i, i + LABELS_PER_PAGE))
    }

    const docElement = createElement(
      Document,
      {},
      ...pages.map((pageItems, pi) =>
        createElement(
          Page,
          { key: `page-${pi}`, size: 'A4', style: styles.page },
          ...pageItems.map((item) =>
            createElement(
              View,
              { key: item.id, style: styles.label },
              createElement(Image, { style: styles.qr, src: item.qrDataUrl }),
              createElement(
                View,
                { style: styles.textContainer },
                createElement(Text, { style: styles.itemId }, item.id.slice(-8)),
                createElement(Text, { style: styles.title }, truncate(item.title, 60))
              )
            )
          )
        )
      )
    )

    const buffer = await renderToBuffer(docElement)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="buy2sell-labels.pdf"',
      },
    })
  } catch (error) {
    console.error('Label generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate labels' },
      { status: 500 }
    )
  }
}
