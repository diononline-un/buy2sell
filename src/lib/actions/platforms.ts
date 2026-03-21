'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export interface PlatformData {
  name: string
  url?: string
  feePercent?: number | string
  color?: string
}

export async function getPlatforms() {
  const platforms = await prisma.platform.findMany({ orderBy: { name: 'asc' } })
  return platforms.map((p) => ({ ...p, feePercent: p.feePercent != null ? Number(p.feePercent) : null }))
}

export async function createPlatform(data: PlatformData) {
  const platform = await prisma.platform.create({
    data: {
      name: data.name,
      url: data.url || null,
      feePercent: data.feePercent != null ? Number(data.feePercent) : null,
      color: data.color || null,
    },
  })
  revalidatePath('/settings')
  return platform
}

export async function updatePlatform(id: string, data: Partial<PlatformData>) {
  const platform = await prisma.platform.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.url !== undefined && { url: data.url || null }),
      ...(data.feePercent !== undefined && {
        feePercent: data.feePercent != null ? Number(data.feePercent) : null,
      }),
      ...(data.color !== undefined && { color: data.color || null }),
    },
  })
  revalidatePath('/settings')
  return platform
}

export async function deletePlatform(id: string) {
  await prisma.platform.delete({ where: { id } })
  revalidatePath('/settings')
}
