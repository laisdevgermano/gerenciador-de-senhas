import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth, unauthorized } from '@/lib/auth'

export async function PUT(request, { params }) {
  const auth = await verifyAuth(request)
  if (!auth) return unauthorized()
  try {
    const { id } = await params

    if (auth.role !== 'admin') {
      const access = await prisma.sharedAccess.findFirst({
        where: { passwordId: id, userId: auth.userId, permission: 'write' },
      })
      if (!access) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { name, username, password, url, notes, folderId, favorite, tags, sharedWith } = body

    const pwData = {}
    if (name !== undefined) pwData.name = String(name).slice(0, 200)
    if (username !== undefined) pwData.username = String(username).slice(0, 200)
    if (password !== undefined) pwData.password = String(password)
    if (url !== undefined) pwData.url = String(url).slice(0, 500)
    if (notes !== undefined) pwData.notes = String(notes).slice(0, 2000)
    if (folderId !== undefined) pwData.folderId = folderId || null
    if (favorite !== undefined) pwData.favorite = Boolean(favorite)

    const updated = await prisma.password.update({
      where: { id },
      data: {
        ...pwData,
        tags: tags
          ? { deleteMany: {}, create: tags.map((tagId) => ({ tagId: String(tagId) })) }
          : undefined,
        sharedWith: sharedWith
          ? { deleteMany: {}, create: sharedWith.map((sa) => ({ userId: String(sa.userId || sa), permission: sa.permission || 'read' })) }
          : undefined,
      },
      include: {
        tags: { include: { tag: true } },
        sharedWith: { include: { user: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('[PUT /passwords/[id]]', err)
    return NextResponse.json({ error: 'Erro ao atualizar senha', detail: err.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const auth = await verifyAuth(request)
  if (!auth) return unauthorized()
  try {
    const { id } = await params

    if (auth.role !== 'admin') {
      const access = await prisma.sharedAccess.findFirst({
        where: { passwordId: id, userId: auth.userId, permission: 'write' },
      })
      if (!access) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    await prisma.password.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao excluir senha' }, { status: 500 })
  }
}
