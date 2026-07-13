import { useState, useMemo } from 'react'
import { RefreshCw, Clock, Copy, Eye, EyeOff, Edit3, FolderClosed, Tags, AlertTriangle } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import PasswordFormModal from './PasswordFormModal'

const PERIOD_OPTIONS = [
  { value: 3, label: '3' },
  { value: 7, label: '7' },
  { value: 15, label: '15' },
  { value: 30, label: '30' },
  { value: 90, label: '90' },
]

export default function SubstituirScreen() {
  const { passwords, getFolderById, getTagById, updatePassword } = useStore()
  const [days, setDays] = useState(30)
  const [showPasswords, setShowPasswords] = useState({})
  const [copiedId, setCopiedId] = useState(null)
  const [editingPassword, setEditingPassword] = useState(null)
  const [error, setError] = useState('')

  const stalePasswords = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    return passwords
      .filter((pw) => new Date(pw.updatedAt) < cutoff)
      .sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt))
  }, [passwords, days])

  const togglePasswordVisibility = (id) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const copyToClipboard = (text, id) => {
    navigator.clipboard?.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getDaysAgo = (dateStr) => {
    const updated = new Date(dateStr)
    const now = new Date()
    const diffMs = now - updated
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'hoje'
    if (diffDays === 1) return 'há 1 dia'
    return `há ${diffDays} dias`
  }

  return (
    <div className="p-6 max-w-5xl">
      {error && (
        <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded-lg text-sm text-danger">
          {error}
          <button onClick={() => setError('')} className="ml-2 text-danger/70 hover:text-danger cursor-pointer">×</button>
        </div>
      )}

      {editingPassword ? (
        <PasswordFormModal
          asModal={false}
          password={editingPassword}
          onClose={() => setEditingPassword(null)}
          onSave={async (data) => {
            try {
              await updatePassword(editingPassword.id, data)
              setEditingPassword(null)
              setError('')
            } catch (err) {
              setError(err.message || 'Erro ao atualizar senha')
            }
          }}
        />
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center">
                <RefreshCw size={20} className="text-amber-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Substituir</h2>
                <p className="text-sm text-text-muted">Senhas que precisam ser atualizadas</p>
              </div>
            </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted font-medium">Não modificadas há:</span>
          <div className="flex gap-1 bg-surface-tertiary rounded-lg p-1">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDays(opt.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  days === opt.value
                    ? 'bg-brand text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                }`}
              >
                {opt.label} dias
              </button>
            ))}
          </div>
        </div>
      </div>

      {stalePasswords.length > 0 && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl">
          <AlertTriangle size={16} className="text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            <span className="font-semibold">{stalePasswords.length}</span>
            {' '}
            {stalePasswords.length === 1 ? 'senha precisa' : 'senhas precisam'}
            {' '} ser substituída{stalePasswords.length === 1 ? '' : 's'} há mais de {days} dias.
          </p>
        </div>
      )}

      {stalePasswords.length === 0 ? (
        <EmptyState
          icon={RefreshCw}
          title="Nenhuma senha desatualizada"
          description={`Todas as senhas foram modificadas nos últimos ${days} dias.`}
        />
      ) : (
        <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Nome</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Usuário</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Última modificação</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Pasta</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {stalePasswords.map((pw) => {
                const folder = pw.folderId ? getFolderById(pw.folderId) : null
                const tags = pw.tags?.map((t) => getTagById(t)).filter(Boolean) || []
                const isStale = new Date(pw.updatedAt) < new Date(Date.now() - days * 24 * 60 * 60 * 1000)
                const daysAgo = getDaysAgo(pw.updatedAt)

                return (
                  <tr
                    key={pw.id}
                    className="border-b border-border last:border-b-0 hover:bg-surface-tertiary transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${isStale ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate max-w-[200px]">{pw.name}</p>
                          {pw.url && (
                            <p className="text-xs text-text-muted truncate max-w-[200px]">{pw.url}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-text-secondary">{pw.username || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-amber-500 shrink-0" />
                        <span className="text-sm font-medium text-amber-600 dark:text-amber-400">{daysAgo}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {folder && (
                          <Badge color={folder.color}>
                            <FolderClosed size={12} />
                            {folder.name}
                          </Badge>
                        )}
                        {tags.map((tag) => (
                          <Badge key={tag.id} color={tag.color}>
                            <Tags size={12} />
                            {tag.name}
                          </Badge>
                        ))}
                        {!folder && tags.length === 0 && (
                          <span className="text-sm text-text-muted">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingPassword(pw)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-tertiary transition-colors cursor-pointer"
                          title="Editar senha"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => togglePasswordVisibility(pw.id)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-tertiary transition-colors cursor-pointer"
                          title={showPasswords[pw.id] ? 'Ocultar senha' : 'Mostrar senha'}
                        >
                          {showPasswords[pw.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(pw.password, pw.id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            copiedId === pw.id
                              ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950'
                              : 'text-text-muted hover:text-text-primary hover:bg-surface-tertiary'
                          }`}
                          title="Copiar senha"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
        </>
      )}
    </div>
  )
}
