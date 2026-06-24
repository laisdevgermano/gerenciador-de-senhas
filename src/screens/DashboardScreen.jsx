import { useState, useMemo } from 'react'
import {
  Globe,
  User,
  Clock,
  Star,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  MoreHorizontal,
  Edit3,
  Trash2,
  Share2,
  FolderClosed,
  Tags,
  Lock,
} from 'lucide-react'
import { useStore } from '../context/StoreContext'
import Sidebar from '../components/Sidebar'
import Table from '../components/Table'
import Badge from '../components/Badge'
import Avatar from '../components/Avatar'
import Tooltip from '../components/Tooltip'
import Dropdown from '../components/Dropdown'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import ThemeToggle from '../components/ThemeToggle'
import PasswordFormModal from './PasswordFormModal'
import ShareModal from './ShareModal'
import SettingsScreen from './SettingsScreen'

/* FUTURE: usar react-router-dom para navegação
 *   const navigate = useNavigate()
 *   <Route path="/dashboard" element={<DashboardScreen />} /> */
export default function DashboardScreen({ onLogout }) {
  const {
    passwords,
    folders,
    tags,
    loading,
    currentUser,
    addPassword,
    updatePassword,
    deletePassword,
    getFolderById,
    getTagById,
  } = useStore()

  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedPassword, setSelectedPassword] = useState(null)
  const [showPasswords, setShowPasswords] = useState({})
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingPassword, setEditingPassword] = useState(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [sharingPassword, setSharingPassword] = useState(null)

  /* FUTURE: carregamento real com skeleton loader
   *   useEffect(() => {
   *     setLoading(true)
   *     api.get('/passwords').then(data => {
   *       setPasswords(data)
   *       setLoading(false)
   *     })
   *   }, []) */

  const filteredPasswords = useMemo(() => {
    if (selectedFilter === 'all') return passwords
    if (selectedFilter === 'favorites') return passwords.filter((p) => p.favorite)
    if (selectedFilter === 'shared') return passwords.filter((p) => p.sharedWith.length > 0)
    if (selectedFilter.startsWith('folder:')) {
      const folderId = selectedFilter.split(':')[1]
      return passwords.filter((p) => p.folderId === folderId)
    }
    if (selectedFilter.startsWith('tag:')) {
      const tagId = selectedFilter.split(':')[1]
      return passwords.filter((p) => p.tags.includes(tagId))
    }
    return passwords
  }, [passwords, selectedFilter])

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
    /* FUTURE: mostrar toast de confirmação */
  }

  const handleEditPassword = (pw) => {
    setEditingPassword(pw)
    setShowFormModal(true)
  }

  const handleNewPassword = () => {
    setEditingPassword(null)
    setShowFormModal(true)
  }

  const handleDeletePassword = (pw) => {
    /* FUTURE: modal de confirmação
     *   const confirmed = await confirmDialog('Tem certeza?')
     *   if (confirmed) await api.delete(`/passwords/${pw.id}`) */
    deletePassword(pw.id)
    if (selectedPassword?.id === pw.id) setSelectedPassword(null)
  }

  const handleShare = (pw) => {
    setSharingPassword(pw)
    setShowShareModal(true)
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
              {row.favorite && (
                <Star size={12} className="inline ml-1.5 text-amber-400 fill-amber-400" />
              )}
            </p>
            {row.username && (
              <p className="text-xs text-text-muted truncate max-w-[200px]">{row.username}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'username',
      label: 'Usuário',
      render: (row) => (
        <div className="flex items-center gap-2">
          <User size={14} className="text-text-muted shrink-0" />
          <span className="text-sm text-text-secondary truncate max-w-[140px]">{row.username}</span>
        </div>
      ),
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
          folders={folders}
          tags={tags}
          selectedFilter={selectedFilter}
          onSelectFilter={setSelectedFilter}
          onNewPassword={handleNewPassword}
          onLogout={onLogout}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="flex-1 overflow-y-auto">
          <SettingsScreen />
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-surface-secondary">
      <Sidebar
        folders={folders}
        tags={tags}
        selectedFilter={selectedFilter}
        onSelectFilter={setSelectedFilter}
        onNewPassword={handleNewPassword}
        onLogout={onLogout}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-border bg-surface flex items-center justify-between px-6 shrink-0">
          <div>
            <h1 className="text-sm font-semibold text-text-primary">
              {selectedFilter === 'all' && 'Todas as senhas'}
              {selectedFilter === 'favorites' && 'Favoritos'}
              {selectedFilter === 'shared' && 'Compartilhadas comigo'}
              {selectedFilter.startsWith('folder:') &&
                getFolderById(selectedFilter.split(':')[1])?.name}
              {selectedFilter.startsWith('tag:') &&
                getTagById(selectedFilter.split(':')[1])?.name}
            </h1>
            <p className="text-xs text-text-muted">{filteredPasswords.length} recursos</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button size="sm" onClick={handleNewPassword}>
              Nova senha
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
            </div>
          ) : filteredPasswords.length === 0 ? (
            <EmptyState
              title="Nenhuma senha encontrada"
              description={
                selectedFilter === 'favorites'
                  ? 'Você ainda não favoritou nenhuma senha.'
                  : selectedFilter === 'shared'
                  ? 'Nenhuma senha foi compartilhada com você ainda.'
                  : 'Sua lista está vazia. Crie sua primeira senha.'
              }
              action={
                <Button size="sm" onClick={handleNewPassword}>
                  Criar senha
                </Button>
              }
            />
          ) : (
            <div className={`grid gap-4 ${selectedPassword ? 'grid-cols-1 xl:grid-cols-5' : 'grid-cols-1'}`}>
              <div className={`${selectedPassword ? 'xl:col-span-3' : ''}`}>
                <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
                  <Table
                    columns={columns}
                    data={filteredPasswords}
                    selectedId={selectedPassword?.id}
                    onRowClick={(row) => setSelectedPassword(row)}
                    emptyMessage="Nenhum recurso encontrado."
                  />
                </div>
              </div>

              {selectedPassword && (
                <div className="xl:col-span-2">
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
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {showFormModal && (
        <PasswordFormModal
          password={editingPassword}
          onClose={() => {
            setShowFormModal(false)
            setEditingPassword(null)
          }}
          onSave={async (data) => {
            if (editingPassword) {
              await updatePassword(editingPassword.id, data)
            } else {
              await addPassword({ ...data, createdBy: currentUser?.id })
            }
            setShowFormModal(false)
            setEditingPassword(null)
          }}
        />
      )}

      {showShareModal && sharingPassword && (
        <ShareModal
          password={sharingPassword}
          onClose={() => {
            setShowShareModal(false)
            setSharingPassword(null)
          }}
          onShare={(sharedWith) => {
            /* FUTURE: chamada de API real
             *   await api.post(`/passwords/${sharingPassword.id}/share`, { userIds: sharedWith }) */
            updatePassword(sharingPassword.id, { sharedWith })
            setShowShareModal(false)
            setSharingPassword(null)
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

  return (
    <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-text-primary">Detalhes</h3>
        <button onClick={onClose} className="text-text-muted hover:text-text-primary text-sm cursor-pointer">Fechar</button>
      </div>

      <div className="p-4 space-y-5">
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

      <div className="flex items-center gap-2 p-4 border-t border-border">
        <Button variant="secondary" size="sm" icon={Edit3} onClick={onEdit}>
          Editar
        </Button>
        <Button variant="secondary" size="sm" icon={Share2} onClick={onShare}>
          Compartilhar
        </Button>
        <Dropdown
          align="right"
          className="ml-auto"
          trigger={<MoreHorizontal size={16} className="text-text-muted" />}
          items={[
            { label: 'Excluir', icon: Trash2, onClick: onDelete, danger: true },
          ]}
        />
      </div>
    </div>
  )
}
