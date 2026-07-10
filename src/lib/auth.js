import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import prisma from '@/lib/prisma'

export async function verifyAuth(request) {
  let token = null

  const auth = request.headers.get('Authorization')
  if (auth?.startsWith('Bearer ')) {
    token = auth.slice(7)
  }

  if (!token) {
    const cookies = request.headers.get('Cookie') || ''
    const match = cookies.match(/gpass-token=([^;]+)/)
    if (match) token = match[1]
  }

  if (!token) return null

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { tokenVersion: true },
    })
    if (!user || user.tokenVersion !== decoded.tokenVersion) return null
    return decoded
  } catch {
    return null
  }
}

export function unauthorized() {
  return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
}

export function corsHeaders() {
  return { headers: CORS_HEADERS }
}
