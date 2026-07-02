// ============================================================
// /api/tags — CRUD de tags (etiquetas)
// ============================================================
// GET  /api/tags  → lista todas as tags
// POST /api/tags  → cria uma nova tag
// PUT  /api/tags  → reordena tags (drag-and-drop)
// ============================================================

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth, unauthorized } from '@/lib/auth'

// Lista todas as tags, ordenadas por sortOrder + nome
export async function GET(request) {
  const auth = verifyAuth(request)
  if (!auth) return unauthorized()
  try {
    const tags = await prisma.tag.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    })
    return NextResponse.json(tags)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao listar tags' }, { status: 500 })
  }
}

// Cria uma nova tag com name e color opcional
export async function POST(request) {
  const auth = verifyAuth(request)
  if (!auth) return unauthorized()
  try {
    const data = await request.json()
    const tag = await prisma.tag.create({ data })
    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar tag' }, { status: 500 })
  }
}

// Reordena tags via drag-and-drop (atualização em lote)
export async function PUT(request) {
  const auth = verifyAuth(request)
  if (!auth) return unauthorized()
  try {
    const { order } = await request.json()
    if (!Array.isArray(order)) {
      return NextResponse.json({ error: 'Formato inválido' }, { status: 400 })
    }
    await prisma.$transaction(
      order.map(({ id, sortOrder }, idx) =>
        prisma.tag.update({
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
