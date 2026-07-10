import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth, unauthorized } from '@/lib/auth'

export async function GET(request) {
  const auth = await verifyAuth(request)
  if (!auth) return unauthorized()
  try {
    if (auth.role === 'admin') {
      const folders = await prisma.folder.findMany({
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      })
      return NextResponse.json(folders)
    }

    const directFolders = await prisma.folder.findMany({
      where: {
        passwords: { some: { sharedWith: { some: { userId: auth.userId } } } },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    })

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
    return NextResponse.json(allFolders.filter((f) => folderIds.has(f.id)))
  } catch {
    return NextResponse.json({ error: 'Erro ao listar pastas' }, { status: 500 })
  }
}

export async function POST(request) {
  const auth = await verifyAuth(request)
  if (!auth || auth.role !== 'admin') return unauthorized()
  try {
    const { name, parentId, color } = await request.json()
    const folder = await prisma.folder.create({
      data: {
        name: String(name || 'Nova pasta').slice(0, 100),
        parentId: parentId || null,
        color: String(color || '#6366f1').slice(0, 7),
      },
    })
    return NextResponse.json(folder, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro ao criar pasta' }, { status: 500 })
  }
}

export async function PUT(request) {
  const auth = await verifyAuth(request)
  if (!auth) return unauthorized()
  try {
    const { order } = await request.json()
    if (!Array.isArray(order)) {
      return NextResponse.json({ error: 'Formato inválido' }, { status: 400 })
    }
    await prisma.$transaction(
      order.map(({ id, sortOrder }, idx) =>
        prisma.folder.update({
          where: { id: String(id) },
          data: { sortOrder: typeof sortOrder === 'number' ? sortOrder : idx },
        })
      )
    )
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao reordenar' }, { status: 500 })
  }
}
