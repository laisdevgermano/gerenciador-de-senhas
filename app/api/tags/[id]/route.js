import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth, unauthorized } from '@/lib/auth'

export async function PUT(request, { params }) {
  const auth = await verifyAuth(request)
  if (!auth || auth.role !== 'admin') return unauthorized()
  try {
    const { id } = await params
    const { name, color, sortOrder } = await request.json()
    const data = {}
    if (name !== undefined) data.name = String(name).slice(0, 50)
    if (color !== undefined) data.color = String(color).slice(0, 7)
    if (sortOrder !== undefined) data.sortOrder = typeof sortOrder === 'number' ? sortOrder : 0
    const tag = await prisma.tag.update({ where: { id }, data })
    return NextResponse.json(tag)
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar tag' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const auth = await verifyAuth(request)
  if (!auth || auth.role !== 'admin') return unauthorized()
  try {
    const { id } = await params
    await prisma.tag.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao excluir tag' }, { status: 500 })
  }
}
