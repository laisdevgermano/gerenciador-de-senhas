import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth, unauthorized } from '@/lib/auth'

export async function PUT(request, { params }) {
  const auth = verifyAuth(request)
  if (!auth) return unauthorized()
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
          ? { deleteMany: {}, create: sharedWith.map((sa) => ({ userId: sa.userId || sa, permission: sa.permission || 'read' })) }
          : undefined,
      },
      include: {
        tags: { include: { tag: true } },
        sharedWith: { include: { user: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json(password)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar senha' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const auth = verifyAuth(request)
  if (!auth) return unauthorized()

  try {
    const { id } = await params
    await prisma.password.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir senha' }, { status: 500 })
  }
}
