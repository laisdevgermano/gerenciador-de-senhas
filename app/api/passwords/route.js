import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    const where = userId
      ? { sharedWith: { some: { userId } } }
      : {}

    const passwords = await prisma.password.findMany({
      where,
      include: {
        tags: { include: { tag: true } },
        sharedWith: { include: { user: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(passwords)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao listar senhas' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    const { tags, sharedWith, ...passwordData } = data

    const password = await prisma.password.create({
      data: {
        ...passwordData,
        tags: tags?.length
          ? { create: tags.map((tagId) => ({ tagId })) }
          : undefined,
        sharedWith: sharedWith?.length
          ? { create: sharedWith.map((sa) => ({ userId: sa.userId || sa, permission: sa.permission || 'read' })) }
          : undefined,
      },
      include: {
        tags: { include: { tag: true } },
        sharedWith: { include: { user: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json(password, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar senha' }, { status: 500 })
  }
}
