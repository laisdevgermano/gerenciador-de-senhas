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

  console.log('Seed concluído. Admin: caique@germano.com / senha123')
}

main().catch(console.error).finally(() => prisma.$disconnect())
