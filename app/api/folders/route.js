// ============================================================
// /api/folders — CRUD de pastas
// ============================================================
// GET  /api/folders        → lista todas (admin) ou
//      /api/folders?userId=→ só pastas com senhas que o
//                            funcionário pode ver
// POST /api/folders        → cria uma nova pasta
// PUT  /api/folders        → reordena pastas (drag-and-drop)
// ============================================================

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth, unauthorized } from '@/lib/auth'

export async function GET(request) {
  const auth = await verifyAuth(request)
  if (!auth) return unauthorized()
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Funcionário: só pastas que contêm senhas compartilhadas com ele,
    // mais os pais dessas pastas (para manter a árvore navegável)
    if (userId) {
      // 1. Pastas que têm senhas compartilhadas diretamente
      const directFolders = await prisma.folder.findMany({
        where: {
          passwords: {
            some: {
              sharedWith: { some: { userId } },
            },
          },
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      })

      // 2. Incluir pais para manter a hierarquia
      const folderIds = new Set(directFolders.map((f) => f.id))
      const allFolders = await prisma.folder.findMany({
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      })
      const folderMap = new Map(allFolders.map((f) => [f.id, f]))
      for (const f of directFolders) {
        let pid = f.parentId
        while (pid && !folderIds.has(pid)) {
          folderIds.add(pid)
          pid = folderMap.get(pid)?.parentId
        }
      }
      const result = allFolders.filter((f) => folderIds.has(f.id))
      return NextResponse.json(result)
    }

    // Admin: todas as pastas
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
  const auth = await verifyAuth(request)
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
  const auth = await verifyAuth(request)
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
