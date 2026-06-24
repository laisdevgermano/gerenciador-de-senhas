import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    /* FUTURE: autenticação real — extrair userId do token JWT
     *   const userId = request.headers.get('x-user-id') */
    
    const passwords = await prisma.password.findMany({
      include: {
        tags: { include: { tag: true } },
        sharedWith: { include: { user: true } },
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
          ? { create: sharedWith.map((userId) => ({ userId, permission: 'read' })) }
          : undefined,
      },
      include: {
        tags: { include: { tag: true } },
        sharedWith: { include: { user: true } },
      },
    })

    return NextResponse.json(password, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar senha' }, { status: 500 })
  }
}
