import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
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
  try {
    const data = await request.json()
    const folder = await prisma.folder.create({ data })
    return NextResponse.json(folder, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar pasta' }, { status: 500 })
  }
}
