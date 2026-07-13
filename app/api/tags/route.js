import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth, unauthorized } from '@/lib/auth'

export async function GET(request) {
  const auth = await verifyAuth(request)
  if (!auth) return unauthorized()
  try {
    if (auth.role === 'admin') {
      const tags = await prisma.tag.findMany({
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      })
      return NextResponse.json(tags)
    }

    const tags = await prisma.tag.findMany({
      where: {
        passwords: {
          some: { password: { sharedWith: { some: { userId: auth.userId } } } },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    })
    return NextResponse.json(tags)
  } catch {
    return NextResponse.json({ error: 'Erro ao listar tags' }, { status: 500 })
  }
}

export async function POST(request) {
  const auth = await verifyAuth(request)
  if (!auth || auth.role !== 'admin') return unauthorized()
  try {
    const { name, color, parentId } = await request.json()
    const tag = await prisma.tag.create({
      data: {
        name: String(name || 'Nova tag').slice(0, 50),
        color: String(color || '#6366f1').slice(0, 7),
        parentId: parentId || null,
      },
    })
    return NextResponse.json(tag, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro ao criar tag' }, { status: 500 })
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
    await prisma.$transaction(
      order.map(({ id, sortOrder }, idx) =>
        prisma.tag.update({
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
