import { NextResponse } from 'next/server'
import { getDownloadUrl } from '@vercel/blob'
import prisma from '@/lib/prisma'
import { verifyAuth, unauthorized } from '@/lib/auth'

export async function GET(request, { params }) {
  const auth = await verifyAuth(request)
  if (!auth) return unauthorized()
  try {
    const { id } = await params
    const document = await prisma.document.findUnique({ where: { id } })
    if (!document) return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 })

    if (auth.role !== 'admin') {
      let hasAccess = false
      if (document.folderId) {
        const pw = await prisma.password.findFirst({
          where: { folderId: document.folderId, sharedWith: { some: { userId: auth.userId } } },
        })
        hasAccess = !!pw
      }
      if (document.userId && document.userId === auth.userId) hasAccess = true
      if (!hasAccess) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const url = getDownloadUrl(document.storagePath)
    return NextResponse.json({ url, mimeType: document.mimeType })
  } catch {
    return NextResponse.json({ error: 'Erro ao gerar URL' }, { status: 500 })
  }
}
