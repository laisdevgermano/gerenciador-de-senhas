// ============================================================
// POST /api/auth/login — autenticação do usuário
// ============================================================
// Recebe email + passphrase, verifica o hash bcrypt no banco
// e retorna um token JWT (válido por 7 dias) + dados do usuário.
// ============================================================

import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '@/lib/prisma'

export async function POST(request) {
  try {
    const { email, passphrase } = await request.json()

    // Validação básica dos campos obrigatórios
    if (!email || !passphrase) {
      return NextResponse.json({ error: 'Email e frase secreta são obrigatórios' }, { status: 400 })
    }

    // Busca o usuário pelo email
    const user = await prisma.user.findUnique({ where: { email } })

    // Verifica se existe e tem passphrase cadastrada
    if (!user || !user.passphrase) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
    }

    // Compara a passphrase fornecida com o hash armazenado
    const valid = await bcrypt.compare(passphrase, user.passphrase)
    if (!valid) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
    }

    // Atualiza o timestamp do último login
    await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } })

    // Gera token JWT com userId e role (expira em 7 dias)
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Retorna dados do usuário (sem a passphrase) + token
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
