import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Platforms
  const platforms = [
    { name: 'eBay', url: 'https://ebay.com', feePercent: 11.0, color: '#e53e3e' },
    { name: 'Kleinanzeigen', url: 'https://kleinanzeigen.de', feePercent: 0, color: '#38a169' },
    { name: 'Vinted', url: 'https://vinted.de', feePercent: 5.0, color: '#805ad5' },
    { name: 'Lokal', url: null, feePercent: 0, color: '#dd6b20' },
  ]

  for (const platform of platforms) {
    await prisma.platform.upsert({
      where: { name: platform.name },
      update: {},
      create: platform,
    })
  }
  console.log(`Seeded ${platforms.length} platforms.`)

  // Tags
  const tags = [
    { name: 'Electronics', color: '#3b82f6' },
    { name: 'Clothing', color: '#8b5cf6' },
    { name: 'Books', color: '#10b981' },
    { name: 'Sports', color: '#f59e0b' },
    { name: 'Home', color: '#ef4444' },
  ]

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: {},
      create: tag,
    })
  }
  console.log(`Seeded ${tags.length} tags.`)

  console.log('Seeding complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
