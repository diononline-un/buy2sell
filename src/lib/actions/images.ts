'use server'

import { revalidatePath } from 'next/cache'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { prisma } from '@/lib/prisma'

export async function uploadImage(formData: FormData, itemId: string) {
  const file = formData.get('file') as File
  if (!file || file.size === 0) throw new Error('No file provided')

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const uploadDir = join(process.cwd(), 'public', 'uploads', itemId)
  await mkdir(uploadDir, { recursive: true })

  const ext = file.name.split('.').pop() || 'jpg'
  const filename = `${Date.now()}.${ext}`
  const filepath = join(uploadDir, filename)
  await writeFile(filepath, buffer)

  const url = `/uploads/${itemId}/${filename}`

  // Check if this is the first image (make it primary)
  const existingCount = await prisma.image.count({ where: { itemId } })
  const isPrimary = existingCount === 0

  const image = await prisma.image.create({
    data: {
      url,
      alt: file.name,
      sortOrder: existingCount,
      isPrimary,
      itemId,
    },
  })

  revalidatePath('/items')
  return image
}

export async function deleteImage(imageId: string) {
  const image = await prisma.image.findUnique({ where: { id: imageId } })
  if (!image) throw new Error('Image not found')

  // Delete file from disk
  try {
    const filepath = join(process.cwd(), 'public', image.url)
    await unlink(filepath)
  } catch {
    // File may not exist, continue
  }

  await prisma.image.delete({ where: { id: imageId } })

  // If this was primary, set next image as primary
  if (image.isPrimary) {
    const next = await prisma.image.findFirst({
      where: { itemId: image.itemId },
      orderBy: { sortOrder: 'asc' },
    })
    if (next) {
      await prisma.image.update({ where: { id: next.id }, data: { isPrimary: true } })
    }
  }

  revalidatePath('/items')
}

export async function setPrimaryImage(imageId: string, itemId: string) {
  // Unset all primary for this item
  await prisma.image.updateMany({
    where: { itemId },
    data: { isPrimary: false },
  })
  // Set the selected image as primary
  await prisma.image.update({
    where: { id: imageId },
    data: { isPrimary: true },
  })
  revalidatePath('/items')
}
