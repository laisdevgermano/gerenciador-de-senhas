import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth, unauthorized } from '@/lib/auth'

export async function PUT(request, { params }) {
  const auth = verifyAuth(request)
  if (!auth) return unauthorized()
  try {
    const { id } = await params
    const data = await request.json()
    const folder = await prisma.folder.update({ where: { id }, data })
    return NextResponse.json(folder)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar pasta' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const auth = verifyAuth(request)
  if (!auth) return unauthorized()

  try {
    const { id } = await params
    await prisma.folder.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir pasta' }, { status: 500 })
  }
}
