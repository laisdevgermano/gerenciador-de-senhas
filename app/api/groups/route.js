import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const groups = await prisma.group.findMany({
      include: { members: { include: { user: true } } },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(groups)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao listar grupos' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { memberIds, ...data } = await request.json()
    const group = await prisma.group.create({
      data: {
        ...data,
        members: memberIds?.length
          ? { create: memberIds.map((userId) => ({ userId })) }
          : undefined,
      },
      include: { members: { include: { user: true } } },
    })
    return NextResponse.json(group, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar grupo' }, { status: 500 })
  }
}
