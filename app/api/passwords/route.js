import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth, unauthorized } from '@/lib/auth'

export async function GET(request) {
  const auth = await verifyAuth(request)
  if (!auth) return unauthorized()
  try {
    const where = auth.role === 'admin'
      ? {}
      : { sharedWith: { some: { userId: auth.userId } } }

    const passwords = await prisma.password.findMany({
      where,
      include: {
        tags: { include: { tag: true } },
        sharedWith: { include: { user: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
    })

    return NextResponse.json(passwords)
  } catch {
    return NextResponse.json({ error: 'Erro ao listar senhas' }, { status: 500 })
  }
}

export async function POST(request) {
  const auth = await verifyAuth(request)
  if (!auth) return unauthorized()
  try {
    const body = await request.json()
    const { tags, sharedWith, ...restData } = body

    const pwData = {
      name: String(restData.name || '').slice(0, 200),
      username: String(restData.username || '').slice(0, 200),
      password: String(restData.password || ''),
      url: String(restData.url || '').slice(0, 500),
      notes: String(restData.notes || '').slice(0, 2000),
      folderId: restData.folderId || null,
      favorite: Boolean(restData.favorite),
      createdBy: auth.userId,
    }

    const created = await prisma.password.create({
      data: {
        ...pwData,
        tags: tags?.length
          ? { create: tags.map((tagId) => ({ tagId: String(tagId) })) }
          : undefined,
        sharedWith: sharedWith?.length
          ? { create: sharedWith.map((sa) => ({ userId: String(sa.userId || sa), permission: sa.permission || 'read' })) }
          : undefined,
      },
      include: {
        tags: { include: { tag: true } },
        sharedWith: { include: { user: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json(password, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro ao criar senha' }, { status: 500 })
  }
}

export async function PUT(request) {
  const auth = await verifyAuth(request)
  if (!auth) return unauthorized()
  try {
    const { order } = await request.json()
    if (!Array.isArray(order)) {
      return NextResponse.json({ error: 'Formato inválido' }, { status: 400 })
    }

    const ids = order.map((o) => String(o.id)).filter(Boolean)
    if (auth.role !== 'admin') {
      const owned = await prisma.sharedAccess.findMany({
        where: { userId: auth.userId, passwordId: { in: ids }, permission: 'write' },
        select: { passwordId: true },
      })
      const allowedIds = new Set(owned.map((a) => a.passwordId))
      if (ids.some((id) => !allowedIds.has(id))) {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
      }
    }

    await prisma.$transaction(
      order.map(({ id, sortOrder }, idx) =>
        prisma.password.update({
          where: { id: String(id) },
          data: { sortOrder: typeof sortOrder === 'number' ? sortOrder : idx },
        })
      )
    )
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao reordenar' }, { status: 500 })
  }
}
