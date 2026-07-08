import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  await prisma.sharedAccess.deleteMany()
  await prisma.passwordTag.deleteMany()
  await prisma.password.deleteMany()
  await prisma.folder.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.user.deleteMany()

  const hash = await bcrypt.hash('senha123', 10)

  await prisma.user.create({
    data: {
      name: 'Caique Germano',
      email: 'caique@germano.com',
      passphrase: hash,
      role: 'admin',
      status: 'active',
      cargo: 'Administrador',
    },
  })

  const clienteA = await prisma.folder.create({
    data: { name: 'Empresa Alpha', color: '#0c11cf', sortOrder: 0 },
  })

  const clienteB = await prisma.folder.create({
    data: { name: 'Empresa Beta', color: '#059669', sortOrder: 1 },
  })

  await prisma.folder.create({
    data: { name: 'Infraestrutura', parentId: clienteA.id, color: '#6366f1', sortOrder: 0 },
  })

  await prisma.folder.create({
    data: { name: 'Financeiro', parentId: clienteA.id, color: '#d97706', sortOrder: 1 },
  })

  await prisma.folder.create({
    data: { name: 'Produção', parentId: clienteB.id, color: '#dc2626', sortOrder: 0 },
  })

  await prisma.folder.create({
    data: { name: 'Homologação', parentId: clienteB.id, color: '#7c3aed', sortOrder: 1 },
  })

  console.log('Seed concluído. Admin: caique@germano.com / senha123')
  console.log('Clientes criados: Empresa Alpha, Empresa Beta (com subpastas)')
}

main().catch(console.error).finally(() => prisma.$disconnect())
