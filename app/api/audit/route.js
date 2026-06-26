import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth, unauthorized } from '@/lib/auth'

export async function GET(request) {
  const auth = verifyAuth(request)
  if (!auth || auth.role !== 'admin') return unauthorized()
  try {
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

    const events = [
      ...passwords.map((p) => ({
        type: p.createdAt === p.updatedAt ? 'senha_criada' : 'senha_editada',
        desc: `${p.creator?.name || '—'} ${p.createdAt === p.updatedAt ? 'criou' : 'editou'} "${p.name}"`,
        user: p.creator?.name || '—',
        date: p.updatedAt,
      })),
      ...users.map((u) => ({
        type: 'usuario_criado',
        desc: `Funcionário "${u.name}" (${u.email}) foi cadastrado`,
        user: u.name,
        date: u.createdAt,
      })),
    ]

    events.sort((a, b) => new Date(b.date) - new Date(a.date))

    return NextResponse.json(events)
  } catch {
    return NextResponse.json({ error: 'Erro' }, { status: 500 })
  }
}
