import { useState } from 'react'
import {
  Shield,
  Users,
  UserPlus,
  Mail,
  Clock,
  MoreHorizontal,
  Check,
  X,
  Ban,
  Trash2,
} from 'lucide-react'
import { useStore } from '../context/StoreContext'
import Avatar from '../components/Avatar'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Input from '../components/Input'
import Dropdown from '../components/Dropdown'
import Table from '../components/Table'
import EmptyState from '../components/EmptyState'

export default function AdminScreen() {
  const { users, pendingInvites, currentUser, updateUser, addInvite, deleteInvite } = useStore()
  const [showInviteModal, setShowInviteModal] = useState(false)

  const roleColors = {
    admin: 'brand',
    user: 'default',
  }

  const statusColors = {
    active: 'success',
    pending: 'warning',
    suspended: 'danger',
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Nunca'
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const columns = [
    {
      key: 'user',
      label: 'Usuário',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} email={row.email} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary">{row.name}</p>
            <p className="text-xs text-text-muted">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Função',
      render: (row) => (
        <Badge variant={roleColors[row.role]}>
          {row.role === 'admin' ? 'Admin' : 'Usuário'}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={statusColors[row.status]}>
          {row.status === 'active' ? 'Ativo' : row.status === 'pending' ? 'Pendente' : 'Suspenso'}
        </Badge>
      ),
    },
    {
      key: 'mfa',
      label: 'MFA',
      render: (row) =>
        row.mfaEnabled ? (
          <span className="text-sm text-success flex items-center gap-1">
            <Check size={14} /> Ativo
          </span>
        ) : (
          <span className="text-sm text-text-muted">—</span>
        ),
    },
    {
      key: 'lastLogin',
      label: 'Último login',
      render: (row) => (
        <span className="text-sm text-text-secondary">{formatDate(row.lastLogin)}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      width: '40px',
      render: (row) => (
        <Dropdown
          align="right"
          trigger={<MoreHorizontal size={16} className="text-text-muted" />}
          items={[
            {
              label: row.role === 'admin' ? 'Remover admin' : 'Tornar admin',
              icon: Shield,
              onClick: () => {
                updateUser(row.id, { role: row.role === 'admin' ? 'user' : 'admin' })
              },
            },
            {
              label: row.status === 'active' ? 'Suspender' : 'Ativar',
              icon: row.status === 'active' ? Ban : Check,
              onClick: () => {
                updateUser(row.id, { status: row.status === 'active' ? 'suspended' : 'active' })
              },
            },
            { separator: true },
            {
              label: 'Remover',
              icon: Trash2,
              danger: true,
              onClick: () => {
                if (confirm(`Remover usuário "${row.name}"?`)) {
                  updateUser(row.id, { status: 'suspended' })
                }
              },
            },
          ]}
        />
      ),
    },
  ]

  return (
    <div className="p-6 max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Administração</h2>
          <p className="text-sm text-text-muted">Gerencie usuários e convites</p>
        </div>
        <Button icon={UserPlus} onClick={() => setShowInviteModal(true)}>
          Convidar usuário
        </Button>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <Users size={16} />
          Usuários ({users.length})
        </h3>
        <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
          <Table columns={columns} data={users} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <Mail size={16} />
          Convites pendentes ({pendingInvites.length})
        </h3>

        {pendingInvites.length === 0 ? (
          <EmptyState
            icon={UserPlus}
            title="Nenhum convite pendente"
            description="Convide novos usuários para o cofre."
          />
        ) : (
          <div className="space-y-2">
            {pendingInvites.map((invite) => (
              <div
                key={invite.id}
                className="bg-surface rounded-xl border border-border p-4 flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950 flex items-center justify-center">
                    <Mail size={16} className="text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{invite.email}</p>
                    <p className="text-xs text-text-muted">
                      Convidado em {formatDate(invite.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="warning">Pendente</Badge>
                  <button
                    onClick={async () => {
                      if (confirm(`Remover convite de "${invite.email}"?`)) {
                        await deleteInvite(invite.id)
                      }
                    }}
                    className="p-1.5 rounded-lg text-text-muted hover:text-danger transition-colors cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showInviteModal && (
        <InviteUserModal
          onClose={() => setShowInviteModal(false)}
          onInvite={async (email, role) => {
            await addInvite({ email, role, invitedBy: currentUser?.id })
            setShowInviteModal(false)
          }}
        />
      )}
    </div>
  )
}

function InviteUserModal({ onClose, onInvite }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('user')

  return (
    <Modal
      open
      onClose={onClose}
      title="Convidar usuário"
      subtitle="Um email será enviado com instruções para acesso."
      size="sm"
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onInvite(email, role)}>Enviar convite</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Email do convidado"
          type="email"
          placeholder="novo@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div>
          <label className="text-sm font-medium text-text-primary block mb-1.5">Função</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40"
          >
            <option value="user">Usuário</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
      </div>
    </Modal>
  )
}
