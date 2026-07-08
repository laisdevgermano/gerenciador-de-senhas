import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

async function main() {
  const passwords = await prisma.password.findMany()

  let updated = 0
  for (const pw of passwords) {
    const newName = capitalize(pw.name)
    const newUsername = pw.username.toLowerCase()
    if (newName !== pw.name || newUsername !== pw.username) {
      await prisma.password.update({
        where: { id: pw.id },
        data: { name: newName, username: newUsername },
      })
      console.log(`  "${pw.name}" → "${newName}" | "${pw.username}" → "${newUsername}"`)
      updated++
    }
  }

  console.log(`\n${updated} senha(s) padronizada(s).`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
