import { useState, useCallback } from 'react'
import {
  Key,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Check,
  Sliders,
} from 'lucide-react'
import Modal from '../components/Modal'
import Input from '../components/Input'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { useStore } from '../context/StoreContext'

/* FUTURE: chamada de API real
 *   const save = async (data) => {
 *     if (password) {
 *       await api.put(`/passwords/${password.id}`, data)
 *     } else {
 *       await api.post('/passwords', data)
 *     }
 *   } */
export default function PasswordFormModal({ password, onClose, onSave }) {
  const { folders, tags } = useStore()

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

  const [showPassword, setShowPassword] = useState(false)
  const [showGenerator, setShowGenerator] = useState(false)
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
    onSave({
      ...form,
      updatedAt: new Date().toISOString(),
    })
  }

  const handleCopyPassword = () => {
    navigator.clipboard?.writeText(form.password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isEditing ? 'Editar senha' : 'Nova senha'}
      subtitle={isEditing ? `Editando ${password.name}` : 'Adicione um novo recurso ao cofre'}
      size="lg"
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            {isEditing ? 'Salvar alterações' : 'Criar senha'}
          </Button>
        </>
      }
    >
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
                variant="secondary"
                size="sm"
                icon={Key}
                onClick={() => setShowGenerator(!showGenerator)}
                className="mb-0.5"
              >
                Gerar
              </Button>
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

        {showGenerator && (
          <PasswordGenerator
            onGenerate={(pw) => setForm({ ...form, password: pw })}
          />
        )}

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
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`cursor-pointer transition-all ${
                  form.tags.includes(tag.id) ? 'scale-105' : 'opacity-60'
                }`}
              >
                <Badge color={tag.color}>
                  {form.tags.includes(tag.id) ? '✓ ' : ''}
                  {tag.name}
                </Badge>
              </button>
            ))}
          </div>
        </div>

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
    </Modal>
  )
}

function PasswordGenerator({ onGenerate }) {
  const [length, setLength] = useState(20)
  const [includeUpper, setIncludeUpper] = useState(true)
  const [includeLower, setIncludeLower] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSymbols, setIncludeSymbols] = useState(true)
  const [generated, setGenerated] = useState('')

  const generate = useCallback(() => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lower = 'abcdefghijklmnopqrstuvwxyz'
    const numbers = '0123456789'
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'

    let chars = ''
    if (includeUpper) chars += upper
    if (includeLower) chars += lower
    if (includeNumbers) chars += numbers
    if (includeSymbols) chars += symbols

    if (!chars) {
      setGenerated('')
      return
    }

    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)]
    }
    setGenerated(result)
    onGenerate?.(result)
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols, onGenerate])

  return (
    <div className="bg-surface-tertiary rounded-lg p-4 space-y-3 border border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
          <Sliders size={14} />
          Gerador de senha
        </div>
        <Button type="button" variant="ghost" size="sm" icon={RefreshCw} onClick={generate}>
          Regenerar
        </Button>
      </div>

      {generated && (
        <div className="bg-surface rounded border border-border px-3 py-2 font-mono text-sm text-brand break-all">
          {generated}
        </div>
      )}

      <div className="flex items-center gap-3">
        <label className="text-xs text-text-secondary whitespace-nowrap">Tamanho: {length}</label>
        <input
          type="range"
          min={8}
          max={64}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="flex-1 accent-brand"
        />
      </div>

      <div className="flex flex-wrap gap-4">
        {[
          { label: 'A-Z', value: includeUpper, set: setIncludeUpper },
          { label: 'a-z', value: includeLower, set: setIncludeLower },
          { label: '0-9', value: includeNumbers, set: setIncludeNumbers },
          { label: '!@#', value: includeSymbols, set: setIncludeSymbols },
        ].map((opt) => (
          <label key={opt.label} className="flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={opt.value}
              onChange={(e) => opt.set(e.target.checked)}
              className="accent-brand rounded"
            />
            {opt.label}
          </label>
        ))}
      </div>

      <Button type="button" variant="primary" size="sm" onClick={generate} className="w-full">
        Gerar senha
      </Button>
    </div>
  )
}
