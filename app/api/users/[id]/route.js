import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { del } from '@vercel/blob'
import prisma from '@/lib/prisma'
import { verifyAuth, unauthorized } from '@/lib/auth'

const USER_SELECT = {
  id: true, name: true, email: true, role: true, status: true,
  cargo: true, departamento: true, telefone: true, avatar: true,
  mfaEnabled: true, lastLogin: true, sortOrder: true, createdAt: true,
}

export async function PUT(request, { params }) {
  const auth = await verifyAuth(request)
  if (!auth || auth.role !== 'admin') return unauthorized()
  try {
    const { id } = await params
    const body = await request.json()

    const data = {}
    if (body.name !== undefined) data.name = String(body.name).slice(0, 100)
    if (body.email !== undefined) data.email = String(body.email).slice(0, 200).toLowerCase()
    if (body.cargo !== undefined) data.cargo = String(body.cargo || '').slice(0, 100)
    if (body.departamento !== undefined) data.departamento = String(body.departamento || '').slice(0, 100)
    if (body.telefone !== undefined) data.telefone = String(body.telefone || '').slice(0, 20)
    if (body.avatar !== undefined) data.avatar = String(body.avatar || '').slice(0, 500)
    if (body.status !== undefined) data.status = ['active', 'inactive'].includes(body.status) ? body.status : undefined

    if (body.passphrase) {
      data.passphrase = await bcrypt.hash(String(body.passphrase), 10)
      data.tokenVersion = { increment: 1 }
    }

    const user = await prisma.user.update({ where: { id }, data, select: USER_SELECT })
    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const auth = await verifyAuth(request)
  if (!auth || auth.role !== 'admin') return unauthorized()

  try {
    const { id } = await params

    const documents = await prisma.document.findMany({ where: { userId: id } })
    for (const doc of documents) {
      if (doc.storagePath) await del(doc.storagePath).catch(() => {})
    }

    await prisma.document.deleteMany({ where: { userId: id } })
    await prisma.sharedAccess.deleteMany({ where: { userId: id } })
    await prisma.password.deleteMany({ where: { createdBy: id } })
    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 })
  }
}
