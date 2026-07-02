// ============================================================
// /api/users — CRUD de funcionários (admin apenas)
// ============================================================
// GET  /api/users       → lista todos (com sortOrder)
// POST /api/users       → cria funcionário com bcrypt
// PUT  /api/users       → reordena funcionários (drag-and-drop)
// ============================================================

import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { verifyAuth, unauthorized } from '@/lib/auth'

export async function GET(request) {
  const auth = await verifyAuth(request)
  if (!auth || auth.role !== 'admin') return unauthorized()
  try {
    const users = await prisma.user.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] })
    return NextResponse.json(users)
  } catch {
    return NextResponse.json({ error: 'Erro ao listar usuários' }, { status: 500 })
  }
}

export async function POST(request) {
  const auth = await verifyAuth(request)
  if (!auth || auth.role !== 'admin') return unauthorized()

  try {
    const { name, email, passphrase, cargo, departamento, telefone } = await request.json()
    const hash = await bcrypt.hash(passphrase, 10)
    const user = await prisma.user.create({
      data: { name, email, passphrase: hash, cargo, departamento, telefone, role: 'user', status: 'active' },
    })
    return NextResponse.json(user, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro ao criar funcionário' }, { status: 500 })
  }
}

export async function PUT(request) {
  const auth = await verifyAuth(request)
  if (!auth || auth.role !== 'admin') return unauthorized()

  try {
    const { order } = await request.json()

    if (!Array.isArray(order)) {
      return NextResponse.json({ error: 'Formato inválido' }, { status: 400 })
    }

    await prisma.$transaction(
      order.map(({ id, sortOrder }, idx) =>
        prisma.user.update({
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
