import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const invites = await prisma.pendingInvite.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(invites)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao listar convites' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    const invite = await prisma.pendingInvite.create({ data })
    return NextResponse.json(invite, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar convite' }, { status: 500 })
  }
}
