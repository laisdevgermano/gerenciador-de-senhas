import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
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

    const filePath = join(process.cwd(), 'public', document.storagePath)
    const fileBuffer = await readFile(filePath)

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': document.mimeType,
        'Content-Disposition': `attachment; filename="${document.fileName}"`,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Erro ao baixar arquivo' }, { status: 500 })
  }
}
