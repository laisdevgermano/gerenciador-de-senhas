import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const { memberIds, ...data } = await request.json()

    const group = await prisma.group.update({
      where: { id },
      data: {
        ...data,
        members: memberIds
          ? {
              deleteMany: {},
              create: memberIds.map((userId) => ({ userId })),
            }
          : undefined,
      },
      include: { members: { include: { user: true } } },
    })

    return NextResponse.json(group)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar grupo' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    await prisma.group.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir grupo' }, { status: 500 })
  }
}
