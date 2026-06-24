import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(tags)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao listar tags' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    const tag = await prisma.tag.create({ data })
    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar tag' }, { status: 500 })
  }
}
