import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '@/lib/prisma'
import { rateLimit } from '@/lib/rateLimit'

function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return 'unknown'
}

export async function POST(request) {
  try {
    const ip = getClientIp(request)
    const limit = rateLimit(ip, 5, 60000)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em ' + limit.retryAfter + 's' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
      )
    }

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
      { userId: user.id, role: user.role, tokenVersion: user.tokenVersion },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    })

    response.cookies.set('gpass-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 8 * 60 * 60,
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
