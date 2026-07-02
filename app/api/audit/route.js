// ============================================================
// GET /api/audit — trilha de auditoria (admin apenas)
// ============================================================
// Retorna eventos combinados (criação/edição de senhas e
// cadastro de usuários) ordenados do mais recente para o
// mais antigo. Limitado aos 100 registros mais recentes.
// ============================================================

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth, unauthorized } from '@/lib/auth'

export async function GET(request) {
  // Apenas administradores podem acessar
  const auth = await verifyAuth(request)
  if (!auth || auth.role !== 'admin') return unauthorized()

  try {
    // Busca as 100 senhas e 100 usuários mais recentes em paralelo
    const [passwords, users] = await Promise.all([
      prisma.password.findMany({
        include: { creator: { select: { name: true, email: true } } },
        orderBy: { updatedAt: 'desc' },
        take: 100,
      }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
    ])

    // Combina em um array de eventos padronizados
    const events = [
      // Eventos de senha: criada ou editada
      ...passwords.map((p) => ({
        type: p.createdAt === p.updatedAt ? 'senha_criada' : 'senha_editada',
        desc: `${p.creator?.name || '—'} ${p.createdAt === p.updatedAt ? 'criou' : 'editou'} "${p.name}"`,
        user: p.creator?.name || '—',
        date: p.updatedAt,
      })),
      // Eventos de cadastro de funcionários
      ...users.map((u) => ({
        type: 'usuario_criado',
        desc: `Funcionário "${u.name}" (${u.email}) foi cadastrado`,
        user: u.name,
        date: u.createdAt,
      })),
    ]

    // Ordena por data (mais recente primeiro)
    events.sort((a, b) => new Date(b.date) - new Date(a.date))

    return NextResponse.json(events)
  } catch {
    return NextResponse.json({ error: 'Erro' }, { status: 500 })
  }
}
