import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const data = await request.json()
    if (data.passphrase) {
      data.passphrase = await bcrypt.hash(data.passphrase, 10)
    }
    const user = await prisma.user.update({ where: { id }, data })
    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    await prisma.sharedAccess.deleteMany({ where: { userId: id } })
    await prisma.password.deleteMany({ where: { createdBy: id } })
    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 })
  }
}
