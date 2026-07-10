import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth, unauthorized } from '@/lib/auth'

export async function GET(request, { params }) {
  const auth = await verifyAuth(request)
  if (!auth) return unauthorized()
  try {
    const { id } = await params
    const document = await prisma.document.findUnique({ where: { id } })
    if (!document) {
      return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 })
    }

    return NextResponse.redirect(document.storagePath)
  } catch {
    return NextResponse.json({ error: 'Erro ao baixar arquivo' }, { status: 500 })
  }
}
