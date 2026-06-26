import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth, unauthorized } from '@/lib/auth'

export async function GET(request) {
  const auth = verifyAuth(request)
  if (!auth) return unauthorized()
  try {
    const folders = await prisma.folder.findMany({
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(folders)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao listar pastas' }, { status: 500 })
  }
}

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
