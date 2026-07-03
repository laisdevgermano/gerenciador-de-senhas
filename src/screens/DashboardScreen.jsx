// ============================================================
// DashboardScreen — tela principal do sistema
// ============================================================
// Composição: Sidebar (navegação) + Main (conteúdo)
// Gerencia:
//   - Filtro selecionado (all, folder:, tag:, employee:)
//   - Busca textual (filtra por nome, username, url, notes)
//   - CRUD de senhas (criar/editar/excluir via modais)
//   - Compartilhamento (ShareModal)
//   - Navegação entre Settings, Employees, Folders, Tags
//   - Reordenação de senhas via drag-and-drop na tabela
//   - Painel de detalhes da senha selecionada
// ============================================================

import { useState, useMemo, useEffect } from 'react'
import {
  Globe,
  User,
  Clock,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  Edit3,
  Trash2,
  Share2,
  FolderClosed,
  Tags,
  Lock,
  Search,
} from 'lucide-react'
import { useStore } from '../context/StoreContext'
import Sidebar from '../components/Sidebar'
import Table from '../components/Table'
import Badge from '../components/Badge'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import ThemeToggle from '../components/ThemeToggle'
import PasswordFormModal from './PasswordFormModal'
import ShareModal from './ShareModal'
import SettingsScreen from './SettingsScreen'
import EmployeeScreen from './EmployeeScreen'
import FolderScreen from './FolderScreen'
import TagScreen from './TagScreen'

export default function DashboardScreen({ onLogout }) {
  const {
    passwords,
    folders,
    tags,
    employees,
    loading,
    currentUser,
    addPassword,
    updatePassword,
    deletePassword,
    reorderPasswords,
    reorderFolders,
    reorderTags,
    reorderEmployees,
    getFolderById,
    getTagById,
    getUserById,
    loadData,
  } = useStore()

  useEffect(() => { loadData() }, [loadData])

  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedPassword, setSelectedPassword] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswords, setShowPasswords] = useState({})
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editingPassword, setEditingPassword] = useState(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [sharingPassword, setSharingPassword] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setSelectedPassword(null)
    setIsEditing(false)
    setIsCreating(false)
    setEditingPassword(null)
  }, [selectedFilter])

  const isAdmin = currentUser?.role === 'admin'

  const filteredPasswords = useMemo(() => {
    let result = passwords

    if (selectedFilter === 'all') {
      result = passwords
    } else if (selectedFilter.startsWith('folder:')) {
      const folderId = selectedFilter.split(':')[1]
      result = passwords.filter((p) => p.folderId === folderId)
    } else if (selectedFilter.startsWith('tag:')) {
      const tagId = selectedFilter.split(':')[1]
      result = passwords.filter((p) => p.tags.includes(tagId))
    } else if (selectedFilter.startsWith('employee:')) {
      const empId = selectedFilter.split(':')[1]
      result = passwords.filter((p) =>
        p.sharedWith?.some((sa) => sa.userId === empId)
      )
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.username.toLowerCase().includes(q) ||
        (p.url && p.url.toLowerCase().includes(q)) ||
        (p.notes && p.notes.toLowerCase().includes(q))
      )
    }

    return result
  }, [passwords, selectedFilter, searchQuery])

  const visibleFolders = useMemo(() => {
    if (!currentUser || isAdmin) return folders
    const folderIdsWithAccess = new Set(
      passwords.map((p) => p.folderId).filter(Boolean)
    )
    const visible = new Set(folderIdsWithAccess)
    for (const fid of folderIdsWithAccess) {
      let pid = folders.find((f) => f.id === fid)?.parentId
      while (pid) {
        visible.add(pid)
        pid = folders.find((f) => f.id === pid)?.parentId
      }
    }
    return folders.filter((f) => visible.has(f.id))
  }, [folders, passwords, currentUser, isAdmin])

  const visibleTags = useMemo(() => {
    if (!currentUser || isAdmin) return tags
    const tagIdsWithAccess = new Set(
      passwords.flatMap((p) => p.tags ?? [])
    )
    return tags.filter((t) => tagIdsWithAccess.has(t.id))
  }, [tags, passwords, currentUser, isAdmin])

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const togglePasswordVisibility = (id) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text)
  }

  const handleEditPassword = (pw) => {
    setEditingPassword(pw)
    setIsEditing(true)
  }

  const handleNewPassword = () => {
    setSelectedPassword(null)
    setEditingPassword(null)
    setIsCreating(true)
  }

  const handleDeletePassword = (pw) => {
    if (confirm(`Excluir a senha "${pw.name}" permanentemente?`)) {
      deletePassword(pw.id)
      if (selectedPassword?.id === pw.id) setSelectedPassword(null)
    }
  }

  const handleShare = (pw) => {
    setSharingPassword(pw)
    setShowShareModal(true)
  }

  const getHeaderTitle = () => {
    if (isCreating) return 'Nova senha'
    if (selectedFilter === 'all') return 'Todas as senhas'
    if (selectedFilter.startsWith('folder:'))
      return getFolderById(selectedFilter.split(':')[1])?.name || 'Pasta'
    if (selectedFilter.startsWith('tag:'))
      return getTagById(selectedFilter.split(':')[1])?.name || 'Tag'
    if (selectedFilter.startsWith('employee:')) {
      const emp = getUserById(selectedFilter.split(':')[1])
      return emp?.name || 'Funcionário'
    }
    return ''
  }

  const columns = [
    {
      key: 'name',
      label: 'Nome',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-light flex items-center justify-center shrink-0">
            <Lock size={14} className="text-brand" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-text-primary truncate max-w-[200px]">
              {row.name}
            </p>
            {row.username && (
              <p className="text-xs text-text-muted truncate max-w-[200px]">{row.username}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'sharedWith',
      label: 'Funcionário',
      render: (row) => {
        const names = (row.sharedWith || [])
          .map((sa) => {
            const id = sa.userId || sa
            return sa.user?.name || getUserById(id)?.name || null
          })
          .filter(Boolean)
        return (
          <div className="flex items-center gap-1.5">
            <User size={14} className="text-text-muted shrink-0" />
            <span className="text-sm text-text-secondary truncate max-w-[160px]">
              {names.length > 0 ? names.join(', ') : '—'}
            </span>
          </div>
        )
      },
    },
    {
      key: 'url',
      label: 'URL',
      render: (row) =>
        row.url ? (
          <div className="flex items-center gap-1.5">
            <Globe size={14} className="text-text-muted shrink-0" />
            <span className="text-sm text-text-muted truncate max-w-[160px]">{row.url}</span>
          </div>
        ) : (
          <span className="text-sm text-text-muted">—</span>
        ),
    },
    {
      key: 'updatedAt',
      label: 'Modificado em',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-text-muted shrink-0" />
          <span className="text-sm text-text-secondary">{formatDate(row.updatedAt)}</span>
        </div>
      ),
    },
  ]

  if (selectedFilter === 'settings') {
    return (
      <div className="flex h-screen">
        <Sidebar
          folders={visibleFolders}
          tags={visibleTags}
          employees={employees}
          selectedFilter={selectedFilter}
          onSelectFilter={setSelectedFilter}
          onNewPassword={handleNewPassword}
          onLogout={onLogout}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          currentUser={currentUser}
          onReorderFolders={reorderFolders}
          onReorderTags={reorderTags}
          onReorderEmployees={reorderEmployees}
        />
        <main className="flex-1 overflow-y-auto">
          <SettingsScreen />
        </main>
      </div>
    )
  }

  if (selectedFilter === 'employees') {
    return (
      <div className="flex h-screen">
        <Sidebar
          folders={visibleFolders}
          tags={visibleTags}
          employees={employees}
          selectedFilter={selectedFilter}
          onSelectFilter={setSelectedFilter}
          onNewPassword={handleNewPassword}
          onLogout={onLogout}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          currentUser={currentUser}
          onReorderFolders={reorderFolders}
          onReorderTags={reorderTags}
          onReorderEmployees={reorderEmployees}
        />
        <main className="flex-1 overflow-y-auto">
          <EmployeeScreen />
        </main>
      </div>
    )
  }

  if (selectedFilter === 'manage-folders') {
    return (
      <div className="flex h-screen">
        <Sidebar
          folders={visibleFolders}
          tags={visibleTags}
          employees={employees}
          selectedFilter={selectedFilter}
          onSelectFilter={setSelectedFilter}
          onNewPassword={handleNewPassword}
          onLogout={onLogout}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          currentUser={currentUser}
          onReorderFolders={reorderFolders}
          onReorderTags={reorderTags}
          onReorderEmployees={reorderEmployees}
        />
        <main className="flex-1 overflow-y-auto">
          <FolderScreen />
        </main>
      </div>
    )
  }

  if (selectedFilter === 'manage-tags') {
    return (
      <div className="flex h-screen">
        <Sidebar
          folders={visibleFolders}
          tags={visibleTags}
          employees={employees}
          selectedFilter={selectedFilter}
          onSelectFilter={setSelectedFilter}
          onNewPassword={handleNewPassword}
          onLogout={onLogout}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          currentUser={currentUser}
          onReorderFolders={reorderFolders}
          onReorderTags={reorderTags}
          onReorderEmployees={reorderEmployees}
        />
        <main className="flex-1 overflow-y-auto">
          <TagScreen />
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-surface-secondary">
      <Sidebar
        folders={visibleFolders}
        tags={visibleTags}
        employees={employees}
        selectedFilter={selectedFilter}
        onSelectFilter={setSelectedFilter}
        onNewPassword={handleNewPassword}
        onLogout={onLogout}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          currentUser={currentUser}
          onReorderFolders={reorderFolders}
          onReorderTags={reorderTags}
          onReorderEmployees={reorderEmployees}
        />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-border bg-surface flex items-center justify-between px-6 shrink-0 gap-4">
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-text-primary">
              {getHeaderTitle()}
            </h1>
            <p className="text-xs text-text-muted">{isCreating ? 'Preencha os dados da nova senha' : `${filteredPasswords.length} recursos`}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Pesquisar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-52 rounded-lg border border-border bg-surface pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
              />
            </div>
            <ThemeToggle />
            {(selectedFilter === 'all' || selectedFilter.startsWith('folder:') || selectedFilter.startsWith('employee:')) && !isCreating && (
              <Button size="sm" onClick={handleNewPassword}>
                Nova senha
              </Button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded-lg text-sm text-danger">
              {error}
              <button onClick={() => setError('')} className="ml-2 text-danger/70 hover:text-danger cursor-pointer">×</button>
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
            </div>
          ) : isCreating ? (
            <PasswordFormModal
              asModal={false}
              folders={visibleFolders}
              password={null}
              onClose={() => setIsCreating(false)}
                onSave={async (data) => {
                  try {
                    await addPassword({ ...data, createdBy: currentUser?.id })
                    setIsCreating(false)
                    setError('')
                  } catch (err) {
                    setError(err.message || 'Erro ao criar senha')
                  }
                }}
            />
          ) : filteredPasswords.length === 0 ? (
            <EmptyState
              title="Nenhuma senha encontrada"
              description={
                searchQuery
                  ? 'Nenhuma senha corresponde à sua pesquisa.'
                  : 'Sua lista está vazia. Crie sua primeira senha.'
              }
              action={
                <Button size="sm" onClick={handleNewPassword}>
                  Criar senha
                </Button>
              }
            />
          ) : selectedPassword ? (
            isEditing && editingPassword ? (
              <PasswordFormModal
                asModal={false}
                folders={visibleFolders}
                password={editingPassword}
                onClose={() => {
                  setIsEditing(false)
                  setEditingPassword(null)
                }}
                onSave={async (data) => {
                  try {
                    await updatePassword(editingPassword.id, data)
                    setIsEditing(false)
                    setEditingPassword(null)
                    setError('')
                  } catch (err) {
                    setError(err.message || 'Erro ao atualizar senha')
                  }
                }}
              />
            ) : (
              <PasswordDetailPanel
                password={selectedPassword}
                showPassword={showPasswords[selectedPassword.id]}
                onToggleVisibility={() => togglePasswordVisibility(selectedPassword.id)}
                onCopy={() => copyToClipboard(selectedPassword.password)}
                onCopyUsername={() => copyToClipboard(selectedPassword.username)}
                onEdit={() => handleEditPassword(selectedPassword)}
                onDelete={() => handleDeletePassword(selectedPassword)}
                onShare={() => handleShare(selectedPassword)}
                onClose={() => setSelectedPassword(null)}
                getFolderById={getFolderById}
                getTagById={getTagById}
                currentUser={currentUser}
              />
            )
          ) : (
            <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
              <Table
                columns={columns}
                data={filteredPasswords}
                selectedId={selectedPassword?.id}
                onRowClick={(row) => setSelectedPassword(row)}
                emptyMessage="Nenhum recurso encontrado."
                onReorder={reorderPasswords}
              />
            </div>
          )}
        </div>
      </main>

      {showShareModal && sharingPassword && (
        <ShareModal
          password={sharingPassword}
          onClose={() => {
            setShowShareModal(false)
            setSharingPassword(null)
          }}
          onShare={async (sharedWith) => {
            try {
              await updatePassword(sharingPassword.id, { sharedWith })
              setShowShareModal(false)
              setSharingPassword(null)
              setError('')
            } catch (err) {
              setError(err.message || 'Erro ao compartilhar senha')
            }
          }}
        />
      )}
    </div>
  )
}

function PasswordDetailPanel({
  password,
  showPassword,
  onToggleVisibility,
  onCopy,
  onCopyUsername,
  onEdit,
  onDelete,
  onShare,
  onClose,
  getFolderById,
  getTagById,
  currentUser,
}) {
  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const folder = password.folderId ? getFolderById(password.folderId) : null
  const tags = password.tags?.map((t) => getTagById(t)).filter(Boolean) || []
  const isAdmin = currentUser?.role === 'admin'
  const myAccess = !isAdmin ? password.sharedWith?.find((sa) => sa.userId === currentUser?.id) : null
  const canWrite = isAdmin || myAccess?.permission === 'write'

  return (
    <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-text-primary">Detalhes</h3>
        <div className="flex items-center gap-2">
          {canWrite && (
            <Button variant="outline" size="sm" icon={Edit3} onClick={onEdit}
              className="!bg-gray-900 !text-white !border-gray-600 hover:!bg-gray-700">
              Editar
            </Button>
          )}
          {isAdmin && (
            <Button variant="primary" size="sm" icon={Share2} onClick={onShare}>
              Compartilhar
            </Button>
          )}
          <button onClick={onClose} className="text-text-muted hover:text-text-primary text-sm cursor-pointer ml-1">Fechar</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1">Nome</p>
          <p className="text-sm font-medium text-text-primary">{password.name}</p>
        </div>

        <div>
          <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1">Usuário</p>
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">{password.username}</p>
            <button onClick={onCopyUsername} className="text-text-muted hover:text-brand cursor-pointer" title="Copiar usuário">
              <Copy size={14} />
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1">Senha</p>
          <div className="flex items-center justify-between">
            <p className="text-sm font-mono text-text-primary">
              {showPassword ? password.password : '••••••••••••'}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={onToggleVisibility} className="text-text-muted hover:text-brand cursor-pointer" title={showPassword ? 'Ocultar' : 'Mostrar'}>
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button onClick={onCopy} className="text-text-muted hover:text-brand cursor-pointer" title="Copiar senha">
                <Copy size={14} />
              </button>
            </div>
          </div>
        </div>

        {password.url && (
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1">URL</p>
            <a
              href={password.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand hover:underline flex items-center gap-1"
            >
              <ExternalLink size={14} />
              {password.url}
            </a>
          </div>
        )}

        <div>
          <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-2">Organização</p>
          <div className="flex flex-wrap gap-2">
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
          </div>
        </div>

        {password.notes && (
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1">Observações</p>
            <p className="text-sm text-text-secondary bg-surface-tertiary rounded-lg p-3 whitespace-pre-wrap">
              {password.notes}
            </p>
          </div>
        )}

        {canWrite && (
          <div className="pt-4 border-t border-border">
            <Button variant="danger" size="sm" icon={Trash2} onClick={onDelete}>
              Excluir senha
            </Button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-xs text-text-muted pt-2 border-t border-border">
          <div>
            <p className="font-semibold uppercase tracking-wider">Criado em</p>
            <p>{formatDate(password.createdAt)}</p>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-wider">Modificado</p>
            <p>{formatDate(password.updatedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
