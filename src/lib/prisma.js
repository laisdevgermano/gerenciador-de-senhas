import { PrismaClient } from '@prisma/client'
import { encrypt, decrypt } from '@/lib/encryption'

const globalForPrisma = globalThis

function createPrisma() {
  const client = new PrismaClient()

  if (!process.env.ENCRYPTION_KEY) return client

  return client.$extends({
    name: 'PasswordEncryption',
    query: {
      password: {
        async $allOperations({ operation, args, query }) {
          if (operation === 'create' || operation === 'createMany') {
            if (operation === 'create' && args.data?.password) {
              args.data.password = encrypt(args.data.password)
            }
            if (operation === 'createMany' && args.data) {
              const items = Array.isArray(args.data) ? args.data : [args.data]
              for (const item of items) {
                if (item.password) item.password = encrypt(item.password)
              }
            }
          }

          if (operation === 'update' || operation === 'updateMany' || operation === 'upsert') {
            const data = args.data
            if (data?.password && typeof data.password === 'string' && !data.password.includes(':')) {
              data.password = encrypt(data.password)
            }
          }

          const result = await query(args)

          const decryptObj = (obj) => {
            if (obj && typeof obj === 'object' && obj.password && typeof obj.password === 'string' && obj.password.includes(':')) {
              try { obj.password = decrypt(obj.password) } catch {}
            }
            return obj
          }

          if (Array.isArray(result)) return result.map(decryptObj)
          return decryptObj(result)
        },
      },
    },
  })
}

const prisma = globalForPrisma.prisma || createPrisma()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
