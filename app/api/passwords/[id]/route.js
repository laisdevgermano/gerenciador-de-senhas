import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const data = await request.json()
    const { tags, sharedWith, ...passwordData } = data

    const password = await prisma.password.update({
      where: { id },
      data: {
        ...passwordData,
        tags: tags
          ? { deleteMany: {}, create: tags.map((tagId) => ({ tagId })) }
          : undefined,
        sharedWith: sharedWith
          ? { deleteMany: {}, create: sharedWith.map((userId) => ({ userId, permission: 'read' })) }
          : undefined,
      },
      include: {
        tags: { include: { tag: true } },
        sharedWith: { include: { user: true } },
      },
    })

    return NextResponse.json(password)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar senha' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    await prisma.password.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir senha' }, { status: 500 })
  }
}
