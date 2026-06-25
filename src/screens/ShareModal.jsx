import { useState } from 'react'
import { Search, Share2, X } from 'lucide-react'
import Modal from '../components/Modal'
import Input from '../components/Input'
import Button from '../components/Button'
import Avatar from '../components/Avatar'
import Badge from '../components/Badge'
import { useStore } from '../context/StoreContext'

export default function ShareModal({ password, onClose, onShare }) {
  const { employees } = useStore()
  const [search, setSearch] = useState('')
  const [selectedShares, setSelectedShares] = useState(
    (password.sharedWith || []).reduce(
      (acc, sa) => ({ ...acc, [sa.userId || sa]: sa.permission || 'read' }),
      {}
    )
  )

  const filtered = employees.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
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
    const shares = Object.entries(selectedShares).map(([userId, permission]) => ({ userId, permission }))
    onShare(shares)
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Compartilhar senha"
      subtitle={`Compartilhe "${password.name}" com funcionários`}
      size="md"
      actions={
        <>
          <Button variant="danger" onClick={onClose}>Cancelar</Button>
          <Button icon={Share2} onClick={handleShare} disabled={Object.keys(selectedShares).length === 0}>
            Compartilhar ({Object.keys(selectedShares).length})
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          placeholder="Buscar funcionários..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={Search}
        />

        <div className="max-h-64 overflow-y-auto space-y-2">
          {filtered.length === 0 && (
            <p className="text-sm text-text-muted text-center py-4">
              {search ? 'Nenhum resultado encontrado.' : 'Nenhum funcionário cadastrado.'}
            </p>
          )}

          {filtered.map((user) => {
            const isShared = !!selectedShares[user.id]
            return (
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
                    value={isShared ? selectedShares[user.id] : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        setPermission(user.id, e.target.value)
                      } else {
                        toggleUser(user.id)
                      }
                    }}
                    className={`h-8 rounded-lg border text-xs px-2 focus:outline-none focus:ring-2 focus:ring-brand/40 cursor-pointer ${
                      isShared
                        ? 'border-brand bg-brand-light text-brand'
                        : 'border-border bg-surface text-text-secondary'
                    }`}
                  >
                    {!isShared && <option value="">Sem acesso</option>}
                    <option value="read">Ver</option>
                    <option value="write">Editar</option>
                  </select>
                </div>
              </div>
            )
          })}
        </div>

        {Object.keys(selectedShares).length > 0 && (
          <div className="p-3 rounded-lg bg-brand-light border border-brand/20">
            <p className="text-xs font-medium text-brand mb-2">
              Compartilhado com ({Object.keys(selectedShares).length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(selectedShares).map(([id, perm]) => {
                const user = employees.find((u) => u.id === id)
                const label = user?.name || id
                return (
                  <Badge key={id} variant="brand">
                    {label}
                    <span className="text-[10px] uppercase opacity-70 ml-1">
                      {perm === 'read' ? 'R' : 'RW'}
                    </span>
                    <button onClick={() => toggleUser(id)} className="ml-1 hover:opacity-70 cursor-pointer">
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
