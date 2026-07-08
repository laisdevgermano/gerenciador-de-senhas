import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const result = await prisma.$queryRawUnsafe(`
    SELECT datname FROM pg_database WHERE datistemplate = false;
  `)
  console.log('Databases in Neon:')
  for (const row of result) {
    console.log(`  - ${row.datname}`)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
