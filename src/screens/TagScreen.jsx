// ============================================================
// TagScreen — gerenciamento de tags (admin)
// ============================================================
// CRUD de tagsetiquetas com nome e cor.
// Exibe cards com contagem de senhas vinculadas.
// ============================================================

import { useState } from 'react'
import { Tags, Plus, Edit3, Trash2, X } from 'lucide-react'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Input from '../components/Input'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import { useStore } from '../context/StoreContext'

export default function TagScreen() {
  const { tags, passwords, addTag, updateTag, deleteTag, currentUser } = useStore()

  // Apenas admin pode gerenciar tags
  if (currentUser?.role !== 'admin') {
    return (
      <div className="p-6">
        <p className="text-sm text-text-muted">Acesso restrito a administradores.</p>
      </div>
    )
  }
  const [showModal, setShowModal] = useState(false)
  const [editingTag, setEditingTag] = useState(null)

  const getPasswordCount = (tagId) =>
    passwords.filter((p) => p.tags.includes(tagId)).length

  const handleDelete = async (tag) => {
    const count = getPasswordCount(tag.id)
    const msg = count > 0
      ? `Excluir tag "${tag.name}"? ${count} senha(s) usam esta tag.`
      : `Excluir tag "${tag.name}"?`
    if (confirm(msg)) {
      await deleteTag(tag.id)
    }
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Tags</h2>
          <p className="text-sm text-text-muted">Categorize senhas com tags</p>
        </div>
        <Button
          icon={Plus}
          onClick={() => {
            setEditingTag(null)
            setShowModal(true)
          }}
        >
          Nova tag
        </Button>
      </div>

      {tags.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="Nenhuma tag"
          description="Crie tags para categorizar suas senhas."
          action={
            <Button size="sm" icon={Plus} onClick={() => setShowModal(true)}>
              Criar tag
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="bg-surface rounded-xl border border-border p-4 shadow-sm flex items-center gap-3 group hover:border-border-hover transition-colors"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${tag.color}18` }}
              >
                <Tags size={16} style={{ color: tag.color }} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{tag.name}</p>
                <p className="text-xs text-text-muted">
                  {getPasswordCount(tag.id)} senha{getPasswordCount(tag.id) !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    setEditingTag(tag)
                    setShowModal(true)
                  }}
                  className="p-1.5 rounded-lg text-text-muted hover:text-brand hover:bg-brand-light transition-colors cursor-pointer"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(tag)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <TagFormModal
          tag={editingTag}
          onClose={() => {
            setShowModal(false)
            setEditingTag(null)
          }}
          onSave={async (data) => {
            if (editingTag) {
              await updateTag(editingTag.id, data)
            } else {
              await addTag(data)
            }
            setShowModal(false)
            setEditingTag(null)
          }}
        />
      )}
    </div>
  )
}

function TagFormModal({ tag, onClose, onSave }) {
  const [name, setName] = useState(tag?.name || '')
  const [color, setColor] = useState(tag?.color || '#0c11cf')

  const capitalize = (str) => {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: capitalize(name.trim()), color })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={tag ? 'Editar tag' : 'Nova tag'}
      size="sm"
      disableOverlayClose
      actions={
        <>
          <Button variant="danger" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit}>{tag ? 'Salvar' : 'Criar'}</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome da tag"
          placeholder="Ex: DevOps"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div>
          <label className="text-sm font-medium text-text-primary block mb-1.5">Cor</label>
          <div className="flex gap-2">
            {['#0c11cf', '#7c3aed', '#059669', '#d97706', '#dc2626', '#e11d48', '#6366f1', '#0891b2'].map(
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

        {tag && (
          <Badge color={color} className="self-start">
            {name || 'Preview'}
          </Badge>
        )}
      </form>
    </Modal>
  )
}
