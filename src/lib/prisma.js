// ============================================================
// CLIENTE PRISMA — singleton para conectar ao PostgreSQL
// ============================================================
// Reutiliza a mesma instância do PrismaClient em toda a app
// para evitar múltiplas conexões durante hot-reload em dev.
// ============================================================

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

// Cria uma nova instância apenas se não existir uma globalmente
const prisma = globalForPrisma.prisma || new PrismaClient()

// Em desenvolvimento, armazena no globalThis para persistir
// entre hot-reloads sem criar novas conexões
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
