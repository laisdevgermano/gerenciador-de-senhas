// ============================================================
// AUTENTICAÇÃO JWT — verificação de token nas requisições
// ============================================================
// Usado por todas as rotas da API para proteger endpoints.
// O token é enviado no header Authorization: Bearer <token>
// ============================================================

import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Extrai e verifica o token JWT do header Authorization.
// Retorna o payload decodificado { userId, role } ou null se inválido.
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

// Retorna uma resposta 401 (Não autorizado) padronizada.
export function unauthorized() {
  return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
}
