// ============================================================
// /api/folders — CRUD de pastas
// ============================================================
// GET  /api/folders        → lista todas as pastas
// POST /api/folders        → cria uma nova pasta
// PUT  /api/folders        → reordena pastas (drag-and-drop)
// ============================================================

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth, unauthorized } from '@/lib/auth'

// Lista todas as pastas, ordenadas por sortOrder (reordenação)
export async function GET(request) {
  const auth = verifyAuth(request)
  if (!auth) return unauthorized()
  try {
    const folders = await prisma.folder.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    })
    return NextResponse.json(folders)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao listar pastas' }, { status: 500 })
  }
}

// Cria uma nova pasta com os dados fornecidos (name, parentId, color)
export async function POST(request) {
  const auth = verifyAuth(request)
  if (!auth) return unauthorized()
  try {
    const data = await request.json()
    const folder = await prisma.folder.create({ data })
    return NextResponse.json(folder, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar pasta' }, { status: 500 })
  }
}

// Reordena pastas via drag-and-drop
// Recebe { order: [{ id, sortOrder }] } e atualiza em lote
export async function PUT(request) {
  const auth = verifyAuth(request)
  if (!auth) return unauthorized()
  try {
    const { order } = await request.json()
    if (!Array.isArray(order)) {
      return NextResponse.json({ error: 'Formato inválido' }, { status: 400 })
    }
    // Transação Prisma: atualiza múltiplas pastas atomicamente
    await prisma.$transaction(
      order.map(({ id, sortOrder }, idx) =>
        prisma.folder.update({
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
