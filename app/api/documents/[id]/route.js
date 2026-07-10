import { NextResponse } from 'next/server'
import { del } from '@vercel/blob'
import prisma from '@/lib/prisma'
import { verifyAuth, unauthorized } from '@/lib/auth'

export async function PUT(request, { params }) {
  const auth = await verifyAuth(request)
  if (!auth) return unauthorized()
  try {
    const { id } = await params
    const document = await prisma.document.findUnique({ where: { id } })
    if (!document) return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 })

    if (auth.role !== 'admin') {
      const owner = document.userId === auth.userId || document.createdBy === auth.userId
      if (!owner) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const updates = {}
    if (body.name !== undefined) updates.name = String(body.name).slice(0, 200)
    if (body.folderId !== undefined) updates.folderId = body.folderId || null
    if (body.userId !== undefined) updates.userId = body.userId || null
    if (body.tagId !== undefined) updates.tagId = body.tagId || null
    const doc = await prisma.document.update({ where: { id }, data: updates })
    return NextResponse.json(doc)
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar documento' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const auth = await verifyAuth(request)
  if (!auth) return unauthorized()
  try {
    const { id } = await params
    const document = await prisma.document.findUnique({ where: { id } })
    if (!document) return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 })

    if (auth.role !== 'admin') {
      const owner = document.userId === auth.userId || document.createdBy === auth.userId
      if (!owner) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    if (document.storagePath) await del(document.storagePath).catch(() => {})
    await prisma.document.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao excluir documento' }, { status: 500 })
  }
}
