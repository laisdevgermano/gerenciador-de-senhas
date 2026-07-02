// ============================================================
// /api/passwords — CRUD de senhas
// ============================================================
// GET  /api/passwords         → lista todas (admin) ou
//      /api/passwords?userId= → só as compartilhadas (employee)
// POST /api/passwords         → cria nova senha
// PUT  /api/passwords         → reordena senhas (drag-and-drop)
// ============================================================

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth, unauthorized } from '@/lib/auth'

// Lista senhas. Se ?userId= for passado, filtra apenas as
// que foram compartilhadas com aquele usuário.
export async function GET(request) {
  const auth = verifyAuth(request)
  if (!auth) return unauthorized()
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Funcionários só veem senhas compartilhadas com eles
    const where = userId
      ? { sharedWith: { some: { userId } } }
      : {}

    // Inclui tags (N:N via PasswordTag), compartilhamentos e criador
    const passwords = await prisma.password.findMany({
      where,
      include: {
        tags: { include: { tag: true } },
        sharedWith: { include: { user: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
      // Ordena primeiro por sortOrder (reordenação manual),
      // depois por updatedAt (mais recente primeiro)
      orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
    })

    return NextResponse.json(passwords)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao listar senhas' }, { status: 500 })
  }
}

// Cria uma nova senha com tags e compartilhamentos opcionais
export async function POST(request) {
  const auth = verifyAuth(request)
  if (!auth) return unauthorized()
  try {
    const data = await request.json()
    const { tags, sharedWith, ...passwordData } = data

    // Cria a senha e já relaciona tags e compartilhamentos
    const password = await prisma.password.create({
      data: {
        ...passwordData,
        // Cria registros na tabela pivô PasswordTag
        tags: tags?.length
          ? { create: tags.map((tagId) => ({ tagId })) }
          : undefined,
        // Cria registros na tabela SharedAccess
        sharedWith: sharedWith?.length
          ? { create: sharedWith.map((sa) => ({ userId: sa.userId || sa, permission: sa.permission || 'read' })) }
          : undefined,
      },
      include: {
        tags: { include: { tag: true } },
        sharedWith: { include: { user: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json(password, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar senha' }, { status: 500 })
  }
}

// Reordena senhas via drag-and-drop (atualização em lote)
// Recebe { order: [{ id, sortOrder }] }
export async function PUT(request) {
  const auth = verifyAuth(request)
  if (!auth) return unauthorized()
  try {
    const { order } = await request.json()
    if (!Array.isArray(order)) {
      return NextResponse.json({ error: 'Formato inválido' }, { status: 400 })
    }
    // Transação atômica: atualiza sortOrder de múltiplas senhas
    await prisma.$transaction(
      order.map(({ id, sortOrder }, idx) =>
        prisma.password.update({
          where: { id },
          data: { sortOrder: sortOrder ?? idx },
        })
      )
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao reordenar' }, { status: 500 })
  }
}
