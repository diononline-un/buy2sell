import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string | null | undefined, currency = 'EUR'): string {
  if (amount === null || amount === undefined) return '—'
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '—'
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

export function calcProfit(
  salePrice: number | string | null | undefined,
  purchasePrice: number | string | null | undefined,
  platformFee: number | string | null | undefined,
  shippingCost: number | string | null | undefined
): number {
  const sale = parseFloat(String(salePrice ?? 0)) || 0
  const purchase = parseFloat(String(purchasePrice ?? 0)) || 0
  const fee = parseFloat(String(platformFee ?? 0)) || 0
  const shipping = parseFloat(String(shippingCost ?? 0)) || 0
  return sale - purchase - fee - shipping
}

export function calcROI(totalProfit: number, totalCost: number): number {
  if (totalCost === 0) return 0
  return (totalProfit / totalCost) * 100
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str
  return str.slice(0, maxLen - 3) + '...'
}
