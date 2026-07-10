import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import prisma from '@/lib/prisma'
import { verifyAuth, unauthorized } from '@/lib/auth'

const MAX_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = [
  'application/pdf',
  'text/plain',
  'text/csv',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]

export async function GET(request, { params }) {
  const auth = await verifyAuth(request)
  if (!auth) return unauthorized()
  try {
    const { id } = await params
    const documents = await prisma.document.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(documents)
  } catch (e) {
    console.error('GET /api/users/[id]/documents error:', e)
    return NextResponse.json({ error: 'Erro ao listar documentos' }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  const auth = await verifyAuth(request)
  if (!auth) return unauthorized()
  try {
    const { id } = await params
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Arquivo excede 10MB' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de arquivo não permitido' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    const blob = await put(uniqueName, file, {
      access: 'public',
      contentType: file.type,
    })

    const document = await prisma.document.create({
      data: {
        name: file.name.replace(/\.[^.]+$/, ''),
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        storagePath: blob.url,
        userId: id,
        createdBy: auth.userId,
      },
    })

    return NextResponse.json(document, { status: 201 })
  } catch (e) {
    console.error('POST /api/users/[id]/documents error:', e)
    return NextResponse.json({ error: 'Erro ao enviar arquivo' }, { status: 500 })
  }
}
