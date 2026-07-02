// ============================================================
// PasswordFormModal — formulário de criação/edição de senha
// ============================================================
// Funciona como modal (asModal=true) ou como painel inline
// (asModal=false). Campos: nome, URL, usuário, senha, pasta,
// tags, compartilhamento com funcionários, observações.
// ============================================================

import { useState } from 'react'
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  X,
  Users,
} from 'lucide-react'
import Modal from '../components/Modal'
import Input from '../components/Input'
import Button from '../components/Button'
import Badge from '../components/Badge'
import Avatar from '../components/Avatar'
import { useStore } from '../context/StoreContext'

export default function PasswordFormModal({ password, onClose, onSave, folders: propFolders, asModal = true }) {
  const { folders: storeFolders, tags, employees, currentUser } = useStore()
  const folders = propFolders ?? storeFolders
  const isAdmin = currentUser?.role === 'admin'

  const isEditing = !!password
  const [form, setForm] = useState({
    name: password?.name || '',
    username: password?.username || '',
    password: password?.password || '',
    url: password?.url || '',
    folderId: password?.folderId || '',
    tags: password?.tags || [],
    notes: password?.notes || '',
  })

  const [sharedWith, setSharedWith] = useState(() => {
    if (!isAdmin) return {}
    const sw = {}
    ;(password?.sharedWith || []).forEach((s) => {
      const id = s.userId || s
      const perm = s.permission || 'read'
      sw[id] = perm
    })
    return sw
  })

  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  const [errors, setErrors] = useState({})

  const toggleTag = (tagId) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((t) => t !== tagId)
        : [...prev.tags, tagId],
    }))
  }

  const toggleEmployee = (userId) => {
    setSharedWith((prev) => {
      if (prev[userId]) {
        const { [userId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [userId]: 'read' }
    })
  }

  const setEmployeePermission = (userId, permission) => {
    setSharedWith((prev) => ({ ...prev, [userId]: permission }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Nome é obrigatório.'
    if (!form.username.trim()) errs.username = 'Usuário é obrigatório.'
    if (!form.password.trim()) errs.password = 'Senha é obrigatória.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    const sharedWithArr = Object.entries(sharedWith).map(([userId, permission]) => ({ userId, permission }))
    onSave({
      ...form,
      sharedWith: sharedWithArr.length ? sharedWithArr : undefined,
      updatedAt: new Date().toISOString(),
    })
  }

  const handleCopyPassword = () => {
    navigator.clipboard?.writeText(form.password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nome do recurso"
          placeholder="Ex: AWS Console"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          error={errors.name}
        />
        <Input
          label="URL"
          placeholder="https://..."
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Usuário"
          placeholder="exemplo@email.com"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          error={errors.username}
        />

        <div>
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <Input
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                error={errors.password}
              />
              <div className="absolute right-2 top-[38px] flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-text-muted hover:text-text-primary cursor-pointer"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              icon={copied ? Check : Copy}
              onClick={handleCopyPassword}
              className={copied ? 'text-success' : ''}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-text-primary block mb-2">
          Pasta
        </label>
        <select
          value={form.folderId}
          onChange={(e) => setForm({ ...form, folderId: e.target.value })}
          className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
        >
          <option value="">Sem pasta</option>
          {folders.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-text-primary block mb-2">
          Tags
        </label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const selected = form.tags.includes(tag.id)
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`tag-pill ${selected ? 'selected' : ''}`}
                style={{
                  color: tag.color,
                  borderColor: tag.color,
                  backgroundColor: selected ? `${tag.color}18` : 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 6px ${tag.color}, 0 0 14px ${tag.color}, 0 0 30px ${tag.color}`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {selected ? '✓ ' : ''}
                {tag.name}
              </button>
            )
          })}
        </div>
      </div>

      {isAdmin && (
        <div>
          <label className="text-sm font-medium text-text-primary block mb-2">
            <Users size={14} className="inline mr-1" />
            Funcionários com acesso ({Object.keys(sharedWith).length})
          </label>
          <div className="border border-border rounded-lg p-2 space-y-1 max-h-40 overflow-y-auto">
            {employees.length === 0 && (
              <p className="text-xs text-text-muted p-2">Nenhum funcionário cadastrado.</p>
            )}
            {employees.map((emp) => {
              const selected = sharedWith[emp.id]
              return (
                <div
                  key={emp.id}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-tertiary transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={!!selected}
                    onChange={() => toggleEmployee(emp.id)}
                    className="accent-brand rounded"
                  />
                  <Avatar name={emp.name} email={emp.email} size="sm" />
                  <span className="flex-1 text-sm text-text-primary">{emp.name}</span>
                  {selected && (
                    <select
                      value={selected}
                      onChange={(e) => setEmployeePermission(emp.id, e.target.value)}
                      className="text-xs border border-border rounded-lg px-2 py-1 bg-surface text-text-primary cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="read">Ver</option>
                      <option value="write">Editar</option>
                    </select>
                  )}
                </div>
              )
            })}
          </div>
          {Object.keys(sharedWith).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {Object.entries(sharedWith).map(([id, perm]) => {
                const emp = employees.find((e) => e.id === id)
                const label = emp?.name || id
                return (
                  <Badge key={id} variant="brand">
                    {label}
                    <span className="text-[10px] uppercase opacity-70 ml-1">
                      {perm === 'read' ? 'R' : 'RW'}
                    </span>
                    <button onClick={() => toggleEmployee(id)} className="ml-1 hover:opacity-70 cursor-pointer">
                      <X size={10} />
                    </button>
                  </Badge>
                )
              })}
            </div>
          )}
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-text-primary block mb-1.5">
          Observações
        </label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Anotações adicionais..."
          rows={3}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand resize-none"
        />
      </div>
    </form>
  )

  if (asModal) {
    return (
      <Modal
        open
        onClose={onClose}
        title={isEditing ? 'Editar senha' : 'Nova senha'}
        subtitle={isEditing ? `Editando ${password.name}` : 'Adicione um novo recurso ao cofre'}
        size="lg"
        actions={
          <>
            <Button variant="danger" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {isEditing ? 'Salvar alterações' : 'Criar senha'}
            </Button>
          </>
        }
      >
        {formContent}
      </Modal>
    )
  }

  return (
    <div className="bg-surface rounded-xl border border-border shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-text-primary">
          {isEditing ? 'Editar senha' : 'Nova senha'}
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {formContent}
      </div>
      <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
        <Button variant="danger" size="sm" onClick={onClose}>
          Cancelar
        </Button>
        <Button size="sm" onClick={handleSubmit}>
          {isEditing ? 'Salvar' : 'Criar'}
        </Button>
      </div>
    </div>
  )
}
