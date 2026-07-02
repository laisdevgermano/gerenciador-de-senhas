// ============================================================
// AUTENTICAÇÃO JWT — verificação de token nas requisições
// ============================================================
// Usado por todas as rotas da API para proteger endpoints.
// O token é enviado no header Authorization: Bearer <token>
//
// Valida a assinatura E compara o tokenVersion do token com
// o valor atual no banco. Se a senha foi alterada depois que
// o token foi emitido, a versão não confere → 401.
// ============================================================

import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import prisma from '@/lib/prisma'

// Extrai e verifica o token JWT do header Authorization.
// Retorna o payload decodificado { userId, role, tokenVersion }
// ou null se inválido / versão desatualizada.
export async function verifyAuth(request) {
  const auth = request.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) {
    return null
  }
  try {
    const token = auth.slice(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { tokenVersion: true },
    })

    if (!user || user.tokenVersion !== decoded.tokenVersion) {
      return null
    }

    return decoded
  } catch {
    return null
  }
}

// Retorna uma resposta 401 (Não autorizado) padronizada.
export function unauthorized() {
  return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
}
