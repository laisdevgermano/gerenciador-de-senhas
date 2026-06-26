import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '@/lib/prisma'

export async function POST(request) {
  try {
    const { email, passphrase } = await request.json()

    if (!email || !passphrase) {
      return NextResponse.json({ error: 'Email e frase secreta são obrigatórios' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || !user.passphrase) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
    }

    const valid = await bcrypt.compare(passphrase, user.passphrase)
    if (!valid) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
    }

    await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } })

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        mfaEnabled: user.mfaEnabled,
      },
      token,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
