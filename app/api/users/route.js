import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { verifyAuth, unauthorized } from '@/lib/auth'

const USER_SELECT = {
  id: true, name: true, email: true, role: true, status: true,
  cargo: true, departamento: true, telefone: true, avatar: true,
  mfaEnabled: true, lastLogin: true, sortOrder: true, createdAt: true,
}

export async function GET(request) {
  const auth = await verifyAuth(request)
  if (!auth || auth.role !== 'admin') return unauthorized()
  try {
    const users = await prisma.user.findMany({
      select: USER_SELECT,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    })
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
    if (!name || !email || !passphrase) {
      return NextResponse.json({ error: 'Nome, email e frase secreta são obrigatórios' }, { status: 400 })
    }
    const hash = await bcrypt.hash(String(passphrase), 10)
    const user = await prisma.user.create({
      data: {
        name: String(name).slice(0, 100),
        email: String(email).slice(0, 200).toLowerCase(),
        passphrase: hash,
        cargo: String(cargo || '').slice(0, 100),
        departamento: String(departamento || '').slice(0, 100),
        telefone: String(telefone || '').slice(0, 20),
        role: 'user',
        status: 'active',
      },
      select: USER_SELECT,
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
