import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const access = await prisma.sharedAccess.findMany({
      where: { userId: id },
      include: { password: { select: { id: true, name: true } } },
    })
    return NextResponse.json(access)
  } catch {
    return NextResponse.json({ error: 'Erro' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const { passwordIds } = await request.json()
    await prisma.sharedAccess.deleteMany({ where: { userId: id } })
    if (passwordIds?.length) {
      await prisma.sharedAccess.createMany({
        data: passwordIds.map((p) => ({ passwordId: p.id, userId: id, permission: p.permission || 'read' })),
      })
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erro' }, { status: 500 })
  }
}
