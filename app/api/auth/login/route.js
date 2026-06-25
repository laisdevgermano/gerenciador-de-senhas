import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { neon } from '@neondatabase/serverless'

export const maxDuration = 60

const sql = neon(process.env.DATABASE_URL)

export async function POST(request) {
  try {
    const { email, passphrase } = await request.json()

    if (!email || !passphrase) {
      return NextResponse.json({ error: 'Email e frase secreta são obrigatórios' }, { status: 400 })
    }

    const users = await sql`SELECT * FROM "User" WHERE email = ${email} LIMIT 1`
    const user = users[0]

    if (!user || !user.passphrase) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
    }

    const valid = await bcrypt.compare(passphrase, user.passphrase)
    if (!valid) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
    }

    await sql`UPDATE "User" SET "lastLogin" = NOW() WHERE id = ${user.id}`

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
