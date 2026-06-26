import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export function verifyAuth(request) {
  const auth = request.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) {
    return null
  }
  try {
    const token = auth.slice(7)
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    return null
  }
}

export function unauthorized() {
  return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
}