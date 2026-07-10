import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth, unauthorized } from '@/lib/auth'

export async function PUT(request, { params }) {
  const auth = await verifyAuth(request)
  if (!auth || auth.role !== 'admin') return unauthorized()
  try {
    const { id } = await params
    const { name, parentId, color, sortOrder } = await request.json()
    const data = {}
    if (name !== undefined) data.name = String(name).slice(0, 100)
    if (parentId !== undefined) data.parentId = parentId || null
    if (color !== undefined) data.color = String(color).slice(0, 7)
    if (sortOrder !== undefined) data.sortOrder = typeof sortOrder === 'number' ? sortOrder : 0
    const folder = await prisma.folder.update({ where: { id }, data })
    return NextResponse.json(folder)
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar pasta' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const auth = await verifyAuth(request)
  if (!auth || auth.role !== 'admin') return unauthorized()
  try {
    const { id } = await params
    await prisma.folder.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao excluir pasta' }, { status: 500 })
  }
}
