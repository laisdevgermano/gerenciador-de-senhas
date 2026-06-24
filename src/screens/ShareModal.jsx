import { useState } from 'react'
import { Search, Share2, X, UserPlus, Users } from 'lucide-react'
import Modal from '../components/Modal'
import Input from '../components/Input'
import Button from '../components/Button'
import Avatar from '../components/Avatar'
import Badge from '../components/Badge'
import { useStore } from '../context/StoreContext'

/* FUTURE: chamada de API real
 *   const sharePassword = async (passwordId, shares) => {
 *     await api.post(`/passwords/${passwordId}/share`, { shares })
 *   } */
export default function ShareModal({ password, onClose, onShare }) {
  const { users, groups } = useStore()
  const [search, setSearch] = useState('')
  const [selectedShares, setSelectedShares] = useState(
    (password.sharedWith || []).reduce(
      (acc, uid) => ({ ...acc, [uid]: 'read' }),
      {}
    )
  )

  const filteredUsers = users.filter(
    (u) =>
      u.id !== 'u1' &&
      (u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()))
  )

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  )

  const toggleUser = (userId) => {
    setSelectedShares((prev) => {
      if (prev[userId]) {
        const { [userId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [userId]: 'read' }
    })
  }

  const setPermission = (id, perm) => {
    setSelectedShares((prev) => ({ ...prev, [id]: perm }))
  }

  const handleShare = () => {
    const userIds = Object.keys(selectedShares)
    onShare(userIds)
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Compartilhar senha"
      subtitle={`Compartilhe "${password.name}" com outros usuários ou grupos`}
      size="md"
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            icon={Share2}
            onClick={handleShare}
            disabled={Object.keys(selectedShares).length === 0}
          >
            Compartilhar ({Object.keys(selectedShares).length})
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          placeholder="Buscar usuários ou grupos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={Search}
        />

        <div className="max-h-64 overflow-y-auto space-y-2">
          {filteredUsers.length === 0 && filteredGroups.length === 0 && (
            <p className="text-sm text-text-muted text-center py-4">
              Nenhum resultado encontrado.
            </p>
          )}

          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-tertiary transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950 flex items-center justify-center">
                <Users size={16} className="text-purple-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{group.name}</p>
                <p className="text-xs text-text-muted">{group.memberIds.length} membros</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedShares[group.id] || ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      setPermission(group.id, e.target.value)
                    } else {
                      toggleUser(group.id)
                    }
                  }}
                  className={`h-8 rounded-lg border text-xs px-2 focus:outline-none focus:ring-2 focus:ring-brand/40 ${
                    selectedShares[group.id]
                      ? 'border-brand bg-brand-light text-brand'
                      : 'border-border bg-surface text-text-secondary'
                  }`}
                >
                  {!selectedShares[group.id] && (
                    <option value="">Sem acesso</option>
                  )}
                  <option value="read">Leitura</option>
                  <option value="write">Edição</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          ))}

          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-tertiary transition-colors"
            >
              <Avatar name={user.name} email={user.email} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{user.name}</p>
                <p className="text-xs text-text-muted truncate">{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedShares[user.id] || ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      setPermission(user.id, e.target.value)
                    } else {
                      toggleUser(user.id)
                    }
                  }}
                  className={`h-8 rounded-lg border text-xs px-2 focus:outline-none focus:ring-2 focus:ring-brand/40 ${
                    selectedShares[user.id]
                      ? 'border-brand bg-brand-light text-brand'
                      : 'border-border bg-surface text-text-secondary'
                  }`}
                >
                  {!selectedShares[user.id] && (
                    <option value="">Sem acesso</option>
                  )}
                  <option value="read">Leitura</option>
                  <option value="write">Edição</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        {Object.keys(selectedShares).length > 0 && (
          <div className="p-3 rounded-lg bg-brand-light border border-brand/20">
            <p className="text-xs font-medium text-brand mb-2">
              Compartilhado com ({Object.keys(selectedShares).length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(selectedShares).map(([id, perm]) => {
                const user = users.find((u) => u.id === id) || groups.find((g) => g.id === id)
                const label = user?.name || user?.email || id
                return (
                  <Badge key={id} variant="brand">
                    {label}
                    <span className="text-[10px] uppercase opacity-70 ml-1">
                      {perm === 'read' ? 'R' : perm === 'write' ? 'RW' : 'Admin'}
                    </span>
                    <button
                      onClick={() => toggleUser(id)}
                      className="ml-1 hover:opacity-70 cursor-pointer"
                    >
                      <X size={10} />
                    </button>
                  </Badge>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
