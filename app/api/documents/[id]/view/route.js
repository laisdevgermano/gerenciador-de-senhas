import { NextResponse } from 'next/server'
import { get } from '@vercel/blob'
import prisma from '@/lib/prisma'
import { verifyAuth, unauthorized } from '@/lib/auth'

async function checkAccess(document, userId, role) {
  if (role === 'admin') return true
  if (document.userId && document.userId === userId) return true
  if (document.createdBy && document.createdBy === userId) return true
  if (document.folderId) {
    const pw = await prisma.password.findFirst({
      where: { folderId: document.folderId, sharedWith: { some: { userId } } },
    })
    if (pw) return true
  }
  return false
}

export async function GET(request, { params }) {
  const auth = await verifyAuth(request)
  if (!auth) return unauthorized()
  try {
    const { id } = await params
    const document = await prisma.document.findUnique({ where: { id } })
    if (!document) return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 })

    if (!await checkAccess(document, auth.userId, auth.role)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const blob = await get(document.storagePath, { access: 'private' })
    if (!blob) return NextResponse.json({ error: 'Arquivo não encontrado no storage' }, { status: 404 })

    return new Response(blob.stream, {
      headers: {
        'Content-Type': document.mimeType,
        'Content-Disposition': `inline; filename="${document.fileName}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (e) {
    console.error('View error:', e?.message)
    return NextResponse.json({ error: 'Erro ao visualizar' }, { status: 500 })
  }
}
