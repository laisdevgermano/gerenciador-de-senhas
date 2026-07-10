import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const clients = [
  'Alkegen',
  'Hiperfrios',
  'Varanda',
  'Espaço',
  'V3',
  'Souza Mendes',
  'Buratin',
  'Gabriela Oliveira',
  'Dinamica',
]

async function main() {
  const existing = await prisma.folder.findMany({ where: { parentId: null } })
  const existingNames = new Set(existing.map(f => f.name.toLowerCase()))

  let sortOrder = existing.length > 0
    ? Math.max(...existing.map(f => f.sortOrder ?? 0)) + 1
    : 0

  for (const name of clients) {
    if (existingNames.has(name.toLowerCase())) {
      console.log(`"${name}" já existe, pulando...`)
      continue
    }
    await prisma.folder.create({
      data: { name, sortOrder: sortOrder++ },
    })
    console.log(`"${name}" criado com sucesso.`)
  }

  console.log('Concluído!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
