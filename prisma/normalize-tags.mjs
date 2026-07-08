import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

async function main() {
  const tags = await prisma.tag.findMany()

  let updated = 0
  for (const tag of tags) {
    const normalized = capitalize(tag.name)
    if (normalized !== tag.name) {
      await prisma.tag.update({
        where: { id: tag.id },
        data: { name: normalized },
      })
      console.log(`  "${tag.name}" → "${normalized}"`)
      updated++
    }
  }

  console.log(`\n${updated} tag(s) padronizada(s).`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
