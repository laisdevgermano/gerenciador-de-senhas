// ============================================================
// FolderScreen — gerenciamento de Clientes (admin)
// ============================================================
// CRUD de clientes com suporte a subpastas (parentId).
// Exibe árvore expansível com drag-and-drop para reordenação.
// Cada cliente raiz é uma pasta principal; dentro dela podem
// existir subpastas para organizar as senhas do cliente.
// ============================================================

import { useState, useRef } from 'react'
import {
  FolderClosed,
  Plus,
  Edit3,
  Trash2,
  FolderPlus,
  ChevronRight,
  ChevronDown,
  GripVertical,
} from 'lucide-react'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Input from '../components/Input'
import EmptyState from '../components/EmptyState'
import { useStore } from '../context/StoreContext'

export default function FolderScreen() {
  const { folders, getChildrenFolders, addFolder, updateFolder, deleteFolder, getPasswordsByFolder, reorderFolders, currentUser } = useStore()

  // Apenas admin pode gerenciar pastas
  if (currentUser?.role !== 'admin') {
    return (
      <div className="p-6">
        <p className="text-sm text-text-muted">Acesso restrito a administradores.</p>
      </div>
    )
  }
  const [showModal, setShowModal] = useState(false)
  const [editingFolder, setEditingFolder] = useState(null)
  const [expanded, setExpanded] = useState({})

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const rootFolders = folders.filter((f) => !f.parentId)

  const handleDelete = async (folder) => {
    const count = getPasswordsByFolder(folder.id).length
    const msg = count > 0
      ? `Excluir "${folder.name}"? Ela contém ${count} senha(s).`
      : `Excluir "${folder.name}"?`
    if (confirm(msg)) {
      await deleteFolder(folder.id)
    }
  }

  const handleReorder = (orderedIds) => {
    reorderFolders(orderedIds)
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Clientes</h2>
          <p className="text-sm text-text-muted">Organize as senhas por cliente</p>
        </div>
        <Button
          icon={Plus}
          onClick={() => {
            setEditingFolder(null)
            setShowModal(true)
          }}
        >
          Novo Cliente
        </Button>
      </div>

      {rootFolders.length === 0 ? (
        <EmptyState
          icon={FolderClosed}
          title="Nenhum Cliente"
          description="Crie clientes para organizar as senhas."
          action={
            <Button
              size="sm"
              icon={FolderPlus}
              onClick={() => setShowModal(true)}
            >
              Criar Cliente
            </Button>
          }
        />
      ) : (
        <div className="bg-surface rounded-xl border border-border shadow-sm">
          <FolderTree
            folders={rootFolders}
            expanded={expanded}
            onToggle={toggleExpand}
            onEdit={(f) => {
              setEditingFolder(f)
              setShowModal(true)
            }}
            onDelete={handleDelete}
            getChildren={getChildrenFolders}
            onReorder={handleReorder}
          />
        </div>
      )}

      {showModal && (
        <FolderFormModal
          folder={editingFolder}
          folders={folders}
          onClose={() => {
            setShowModal(false)
            setEditingFolder(null)
          }}
          onSave={async (data) => {
            if (editingFolder) {
              await updateFolder(editingFolder.id, data)
            } else {
              await addFolder(data)
            }
            setShowModal(false)
            setEditingFolder(null)
          }}
        />
      )}
    </div>
  )
}

function FolderTree({ folders, expanded, onToggle, onEdit, onDelete, getChildren, onReorder, depth = 0 }) {
  const [dragIndex, setDragIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)
  const dragNode = useRef(null)

  const handleDragStart = (e, idx) => {
    dragNode.current = idx
    setDragIndex(idx)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', folders[idx].id)
    setTimeout(() => {
      e.target.closest('[data-folder-row]')?.classList.add('opacity-50')
    }, 0)
  }

  const handleDragOver = (e, idx) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragNode.current !== idx) {
      setDragOverIndex(idx)
    }
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e, dropIdx) => {
    e.preventDefault()
    e.target.closest('[data-folder-row]')?.classList.remove('opacity-50')
    if (dragNode.current === null || dragNode.current === dropIdx) {
      setDragIndex(null)
      setDragOverIndex(null)
      dragNode.current = null
      return
    }

    const newFolders = [...folders]
    const dragged = newFolders[dragNode.current]
    newFolders.splice(dragNode.current, 1)
    newFolders.splice(dropIdx, 0, dragged)

    setDragIndex(null)
    setDragOverIndex(null)
    dragNode.current = null

    onReorder?.(newFolders.map((f) => f.id))
  }

  const handleDragEnd = (e) => {
    e.target.closest('[data-folder-row]')?.classList.remove('opacity-50')
    setDragIndex(null)
    setDragOverIndex(null)
    dragNode.current = null
  }

  return (
    <>
      {folders.map((folder, idx) => {
        const children = getChildren(folder.id)
        const hasChildren = children.length > 0
        const isExpanded = expanded[folder.id]
        const isDragOver = dragOverIndex === idx && dragIndex !== idx

        return (
          <div key={folder.id}>
            <div
              data-folder-row
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-2 px-4 py-3 hover:bg-surface-tertiary transition-colors border-b border-border/50 last:border-b-0 group ${
                isDragOver ? 'border-t-2 border-t-brand' : ''
              }`}
              style={{ paddingLeft: 16 + depth * 24 }}
            >
              <div className="text-text-muted cursor-grab active:cursor-grabbing shrink-0">
                <GripVertical size={14} />
              </div>

              <button
                onClick={() => hasChildren && onToggle(folder.id)}
                className={`p-0.5 rounded text-text-muted hover:text-text-primary transition-colors cursor-pointer ${
                  !hasChildren ? 'invisible' : ''
                }`}
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>

              <FolderClosed
                size={16}
                className="shrink-0"
                style={{ color: folder.color || '#94a3b8' }}
              />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{folder.name}</p>
                {folder.parentId && (
                  <p className="text-xs text-text-muted">Subpasta</p>
                )}
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit(folder)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-brand hover:bg-brand-light transition-colors cursor-pointer"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => onDelete(folder)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {hasChildren && isExpanded && (
              <FolderTree
                folders={children}
                expanded={expanded}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
                getChildren={getChildren}
                onReorder={onReorder}
                depth={depth + 1}
              />
            )}
          </div>
        )
      })}
    </>
  )
}

function FolderFormModal({ folder, folders, onClose, onSave }) {
  const [name, setName] = useState(folder?.name || '')
  const [color, setColor] = useState(folder?.color || '#0c11cf')
  const [parentId, setParentId] = useState(folder?.parentId || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name, color, parentId: parentId || null })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={folder ? 'Editar Cliente' : 'Novo Cliente'}
      size="sm"
      disableOverlayClose
      actions={
        <>
          <Button variant="danger" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit}>{folder ? 'Salvar' : 'Criar'}</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome do Cliente"
          placeholder="Ex: Empresa XYZ"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div>
          <label className="text-sm font-medium text-text-primary block mb-1.5">Cor</label>
          <div className="flex gap-2">
            {['#0c11cf', '#7c3aed', '#059669', '#d97706', '#dc2626', '#e11d48', '#6366f1'].map(
              (c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all cursor-pointer ${
                    color === c ? 'border-text-primary scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              )
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-text-primary block mb-1.5">
            Cliente pai (opcional)
          </label>
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40"
          >
            <option value="">Nenhuma (raiz)</option>
            {folders
              .filter((f) => f.id !== folder?.id)
              .map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
          </select>
        </div>
      </form>
    </Modal>
  )
}