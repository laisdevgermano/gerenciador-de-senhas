import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth, unauthorized } from '@/lib/auth'

export async function PUT(request, { params }) {
  const auth = verifyAuth(request)
  if (!auth) return unauthorized()
  try {
    const { id } = await params
    const data = await request.json()
    const tag = await prisma.tag.update({ where: { id }, data })
    return NextResponse.json(tag)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar tag' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const auth = verifyAuth(request)
  if (!auth) return unauthorized()

  try {
    const { id } = await params
    await prisma.tag.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir tag' }, { status: 500 })
  }
}
