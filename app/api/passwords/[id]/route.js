// ============================================================
// /api/passwords/[id] — CRUD de senha individual
// ============================================================
// PUT   /api/passwords/:id → atualiza senha
// DELETE /api/passwords/:id → exclui senha
// ============================================================

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth, unauthorized } from '@/lib/auth'

// Atualiza uma senha: dados básicos + substituição de tags e
// compartilhamentos (deleta os antigos e recria os novos)
// Admin pode editar qualquer senha; funcionário precisa ter
// permissão "write" no SharedAccess da senha.
export async function PUT(request, { params }) {
  const auth = verifyAuth(request)
  if (!auth) return unauthorized()
  try {
    const { id } = await params

    // Funcionário: verifica permissão write antes de editar
    if (auth.role !== 'admin') {
      const access = await prisma.sharedAccess.findFirst({
        where: { passwordId: id, userId: auth.userId, permission: 'write' },
      })
      if (!access) {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
      }
    }

    const data = await request.json()
    const { tags, sharedWith, ...passwordData } = data

    const password = await prisma.password.update({
      where: { id },
      data: {
        ...passwordData,
        tags: tags
          ? { deleteMany: {}, create: tags.map((tagId) => ({ tagId })) }
          : undefined,
        sharedWith: sharedWith
          ? { deleteMany: {}, create: sharedWith.map((sa) => ({ userId: sa.userId || sa, permission: sa.permission || 'read' })) }
          : undefined,
      },
      include: {
        tags: { include: { tag: true } },
        sharedWith: { include: { user: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json(password)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar senha' }, { status: 500 })
  }
}

// Exclui uma senha (cascade deleta PasswordTag e SharedAccess)
// Admin pode excluir qualquer uma; funcionário precisa de "write"
export async function DELETE(request, { params }) {
  const auth = verifyAuth(request)
  if (!auth) return unauthorized()
  try {
    const { id } = await params

    // Funcionário: verifica permissão write antes de excluir
    if (auth.role !== 'admin') {
      const access = await prisma.sharedAccess.findFirst({
        where: { passwordId: id, userId: auth.userId, permission: 'write' },
      })
      if (!access) {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
      }
    }

    await prisma.password.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir senha' }, { status: 500 })
  }
}
