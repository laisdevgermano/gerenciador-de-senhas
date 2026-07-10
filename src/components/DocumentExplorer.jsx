import { useState, useRef, useCallback } from 'react'
import {
  FileText,
  Image,
  File,
  Download,
  Upload,
  X,
  MoreVertical,
  Pencil,
  FolderInput,
  Check,
  Eye,
} from 'lucide-react'
import Button from './Button'
import { useStore } from '../context/StoreContext'

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
const MAX_SIZE = 10 * 1024 * 1024

const ACCEPT_EXT = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt,.png,.jpg,.jpeg,.gif,.webp,.svg,.bmp'

function getFileIcon(mimeType) {
  if (mimeType === 'application/pdf') return FileText
  if (mimeType === 'text/plain' || mimeType === 'text/csv') return FileText
  if (mimeType.startsWith('image/')) return Image
  if (mimeType.includes('word') || mimeType.includes('document')) return FileText
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return FileText
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return FileText
  return File
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function ImageThumb({ doc }) {
  return <img src={`/api/documents/${doc.id}/view`} alt={doc.name} className="w-full h-20 object-cover rounded mb-2" />
}

export default function DocumentExplorer({ type = 'folder', id, inline = false }) {
  const {
    documents, folders, users, tags,
    addDocument, deleteDocument, renameDocument, moveDocument,
    getDocumentsByFolder, getDocumentsByUser, getDocumentsByTag,
  } = useStore()
  const [isDragging, setIsDragging] = useState(false)
  const [menuOpen, setMenuOpen] = useState(null)
  const [renamingId, setRenamingId] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [movingId, setMovingId] = useState(null)
  const [previewDoc, setPreviewDoc] = useState(null)
  const [previewContent, setPreviewContent] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const fileInputRef = useRef(null)

  const docs = (() => {
    if (!id) return documents
    if (type === 'user') return getDocumentsByUser(id)
    if (type === 'tag') return getDocumentsByTag(id)
    return getDocumentsByFolder(id)
  })()

  const handleUpload = async (uploadType, uploadId, file) => {
    if (file.size > MAX_SIZE) {
      alert('Arquivo excede 10MB')
      return
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('Tipo de arquivo não permitido')
      return
    }
    const formData = new FormData()
    formData.append('file', file)
    await addDocument(uploadType, uploadId, formData)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file && id) handleUpload(type, id, file)
    e.target.value = ''
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && id) handleUpload(type, id, file)
  }, [type, id])

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDownload = (doc) => {
    const link = document.createElement('a')
    link.href = `/api/documents/${doc.id}/download`
    link.download = doc.fileName
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.click()
  }

  const handleStartRename = (doc) => {
    setRenamingId(doc.id)
    setRenameValue(doc.name)
    setMenuOpen(null)
  }

  const handleConfirmRename = async (docId) => {
    if (renameValue.trim()) {
      await renameDocument(docId, renameValue.trim())
    }
    setRenamingId(null)
    setRenameValue('')
  }

  const handleStartMove = (doc) => {
    setMovingId(doc.id)
    setMenuOpen(null)
  }

  const handleConfirmMove = async (docId, targetType, targetId) => {
    await moveDocument(docId, targetType, targetId)
    setMovingId(null)
  }

  const handleDelete = (doc) => {
    if (confirm(`Excluir "${doc.name}"?`)) {
      deleteDocument(doc.id)
    }
    setMenuOpen(null)
  }

  const canPreview = (mimeType) => {
    return mimeType.startsWith('image/') || mimeType === 'application/pdf' || mimeType === 'text/plain' || mimeType === 'text/csv'
  }

  const handlePreview = async (doc) => {
    setPreviewDoc(doc)
    setPreviewContent(null)
    setPreviewUrl(null)
    setPreviewLoading(true)
    try {
      const viewUrl = `/api/documents/${doc.id}/view`
      if (doc.mimeType === 'text/plain' || doc.mimeType === 'text/csv') {
        const textRes = await fetch(viewUrl, { credentials: 'include' })
        setPreviewContent(await textRes.text())
      } else {
        setPreviewUrl(viewUrl)
      }
    } catch {
      setPreviewContent('Erro ao carregar conteúdo.')
    } finally {
      setPreviewLoading(false)
    }
  }

  const rootFolders = folders.filter((f) => !f.parentId)
  const employees = users.filter((u) => u.role !== 'admin')

  return (
    <div className={inline ? '' : 'bg-surface rounded-xl border border-border shadow-sm p-4'}>
      {!inline && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-primary">Documentos</h3>
          <Button
            size="sm"
            icon={Upload}
            onClick={() => fileInputRef.current?.click()}
          >
            Enviar arquivo
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_EXT}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {inline && (
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_EXT}
          onChange={handleFileSelect}
          className="hidden"
        />
      )}

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg transition-colors ${
          isDragging
            ? 'border-brand bg-brand-light/20'
            : 'border-border hover:border-border-hover'
        } ${inline ? 'p-4' : 'p-6 text-center'}`}
      >
        {docs.length === 0 ? (
          <div className="space-y-2 text-center">
            <Upload size={24} className="mx-auto text-text-muted" />
            <p className="text-sm text-text-muted">
              Arraste um arquivo aqui ou clique em "Enviar arquivo"
            </p>
            <p className="text-xs text-text-muted">
              PDF, DOC, XLS, PPT, CSV, TXT, PNG, JPG, GIF, WEBP, SVG, BMP (max 10MB)
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {docs.map((doc) => {
              const Icon = getFileIcon(doc.mimeType)
              const isImage = doc.mimeType.startsWith('image/')
              const isRenaming = renamingId === doc.id
              const isMoving = movingId === doc.id

              return (
                <div
                  key={doc.id}
                  onClick={() => !isRenaming && !isMoving && canPreview(doc.mimeType) && handlePreview(doc)}
                  className={`relative group bg-surface-secondary rounded-lg border border-border p-3 hover:border-brand/50 transition-colors ${canPreview(doc.mimeType) && !isRenaming && !isMoving ? 'cursor-pointer' : ''}`}
                >
                  {isImage ? (
                    <ImageThumb doc={doc} />
                  ) : (
                    <div className="w-full h-20 flex items-center justify-center bg-surface-tertiary rounded mb-2">
                      <Icon size={24} className="text-text-muted" />
                    </div>
                  )}

                  {isRenaming ? (
                    <div className="flex items-center gap-1 mb-1">
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleConfirmRename(doc.id)
                          if (e.key === 'Escape') setRenamingId(null)
                        }}
                        className="flex-1 text-xs font-medium text-text-primary bg-surface border border-brand rounded px-1 py-0.5 focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleConfirmRename(doc.id)}
                        className="p-0.5 text-brand hover:text-brand/80 cursor-pointer"
                      >
                        <Check size={12} />
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs font-medium text-text-primary truncate mb-1">{doc.name}</p>
                  )}

                  {isMoving ? (
                    <div className="space-y-1 mb-1 max-h-24 overflow-y-auto">
                      <p className="text-[10px] text-text-muted font-semibold uppercase">Mover para:</p>
                      {type === 'folder' && rootFolders.filter((f) => f.id !== doc.folderId).map((f) => (
                        <button
                          key={f.id}
                          onClick={() => handleConfirmMove(doc.id, 'folder', f.id)}
                          className="w-full text-left text-xs text-text-secondary hover:text-brand hover:bg-brand-light/20 rounded px-1.5 py-0.5 transition-colors cursor-pointer truncate"
                        >
                          {f.name}
                        </button>
                      ))}
                      {type === 'user' && employees.filter((e) => e.id !== doc.userId).map((e) => (
                        <button
                          key={e.id}
                          onClick={() => handleConfirmMove(doc.id, 'user', e.id)}
                          className="w-full text-left text-xs text-text-secondary hover:text-brand hover:bg-brand-light/20 rounded px-1.5 py-0.5 transition-colors cursor-pointer truncate"
                        >
                          {e.name}
                        </button>
                      ))}
                      {type === 'tag' && tags.filter((t) => t.id !== doc.tagId).map((t) => (
                        <button
                          key={t.id}
                          onClick={() => handleConfirmMove(doc.id, 'tag', t.id)}
                          className="w-full text-left text-xs text-text-secondary hover:text-brand hover:bg-brand-light/20 rounded px-1.5 py-0.5 transition-colors cursor-pointer truncate"
                        >
                          {t.name}
                        </button>
                      ))}
                      <button
                        onClick={() => setMovingId(null)}
                        className="text-[10px] text-text-muted hover:text-danger cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-text-muted">{formatFileSize(doc.size)}</p>
                  )}

                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="relative">
                      <button
                        onClick={() => setMenuOpen(menuOpen === doc.id ? null : doc.id)}
                        className="p-1 rounded bg-surface hover:bg-surface-tertiary text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                      >
                        <MoreVertical size={12} />
                      </button>
                      {menuOpen === doc.id && (
                        <div className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-lg shadow-lg z-10 min-w-[120px]">
                          <button
                            onClick={() => handleDownload(doc)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-tertiary cursor-pointer"
                          >
                            <Download size={12} /> Baixar
                          </button>
                          <button
                            onClick={() => handleStartRename(doc)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-tertiary cursor-pointer"
                          >
                            <Pencil size={12} /> Renomear
                          </button>
                          <button
                            onClick={() => handleStartMove(doc)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-tertiary cursor-pointer"
                          >
                            <FolderInput size={12} /> Mover
                          </button>
                          <button
                            onClick={() => handleDelete(doc)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-danger hover:bg-rose-50 dark:hover:bg-rose-950 cursor-pointer"
                          >
                            <X size={12} /> Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setPreviewDoc(null)}>
          <div
            className="bg-surface rounded-xl border border-border shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-text-primary truncate">{previewDoc.name}</p>
                <p className="text-xs text-text-muted">{previewDoc.mimeType.split('/').pop().toUpperCase()} · {formatFileSize(previewDoc.size)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <Button size="sm" variant="outline" icon={Download} onClick={() => handleDownload(previewDoc)}>
                  Baixar
                </Button>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-tertiary transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-surface-secondary rounded-b-xl">
              {previewLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-3 border-brand/30 border-t-brand rounded-full animate-spin" />
                </div>
              )}

              {!previewLoading && previewDoc.mimeType.startsWith('image/') && previewUrl && (
                <img
                  src={previewUrl}
                  alt={previewDoc.name}
                  className="max-w-full max-h-[65vh] object-contain rounded"
                />
              )}

              {!previewLoading && previewDoc.mimeType === 'application/pdf' && previewUrl && (
                <iframe
                  src={previewUrl}
                  className="w-full h-[65vh] rounded border border-border"
                  title={previewDoc.name}
                />
              )}

              {(previewDoc.mimeType === 'text/plain' || previewDoc.mimeType === 'text/csv') && (
                <div className="w-full">
                  {previewLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-6 h-6 border-3 border-brand/30 border-t-brand rounded-full animate-spin" />
                    </div>
                  ) : (
                    <pre className="text-xs text-text-secondary bg-surface p-4 rounded-lg border border-border overflow-auto max-h-[65vh] whitespace-pre-wrap font-mono">
                      {previewContent || 'Sem conteúdo'}
                    </pre>
                  )}
                </div>
              )}

              {!previewDoc.mimeType.startsWith('image/') &&
                previewDoc.mimeType !== 'application/pdf' &&
                previewDoc.mimeType !== 'text/plain' &&
                previewDoc.mimeType !== 'text/csv' && (
                <div className="text-center py-12 space-y-4">
                  {(() => { const Icon = getFileIcon(previewDoc.mimeType); return <Icon size={48} className="mx-auto text-text-muted" /> })()}
                  <div>
                    <p className="text-sm font-medium text-text-primary">{previewDoc.fileName}</p>
                    <p className="text-xs text-text-muted mt-1">Pré-visualização não disponível para este tipo de arquivo.</p>
                  </div>
                  <Button size="sm" icon={Download} onClick={() => handleDownload(previewDoc)}>
                    Baixar arquivo
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
