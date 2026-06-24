import { useState } from 'react'
import { Users, Plus, Edit3, Trash2, User, X } from 'lucide-react'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Input from '../components/Input'
import Avatar from '../components/Avatar'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import { useStore } from '../context/StoreContext'

export default function GroupScreen() {
  const { groups, users, addGroup, updateGroup, deleteGroup } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [editingGroup, setEditingGroup] = useState(null)
  const [saving, setSaving] = useState(false)

  const getMembers = (memberIds) =>
    users.filter((u) => memberIds.includes(u.id))

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Grupos</h2>
          <p className="text-sm text-text-muted">Gerencie grupos de usuários</p>
        </div>
        <Button
          icon={Plus}
          onClick={() => {
            setEditingGroup(null)
            setShowModal(true)
          }}
        >
          Novo grupo
        </Button>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum grupo"
          description="Crie grupos para facilitar o compartilhamento."
          action={
            <Button size="sm" icon={Plus} onClick={() => setShowModal(true)}>
              Criar grupo
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {groups.map((group) => {
            const members = getMembers(group.memberIds)
            return (
              <div
                key={group.id}
                className="bg-surface rounded-xl border border-border p-5 shadow-sm group hover:border-border-hover transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950 flex items-center justify-center">
                      <Users size={18} className="text-purple-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary">{group.name}</h3>
                      <p className="text-xs text-text-muted">{group.description || 'Sem descrição'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingGroup(group)
                        setShowModal(true)
                      }}
                      className="p-1.5 rounded-lg text-text-muted hover:text-brand hover:bg-brand-light transition-colors cursor-pointer"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Excluir grupo "${group.name}"?`)) {
                          await deleteGroup(group.id)
                        }
                      }}
                      className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-surface-tertiary"
                    >
                      <Avatar name={member.name} size="sm" />
                      <span className="text-xs text-text-secondary">{member.name}</span>
                    </div>
                  ))}
                  {members.length === 0 && (
                    <p className="text-xs text-text-muted">Nenhum membro</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <GroupFormModal
          group={editingGroup}
          users={users}
          onClose={() => {
            setShowModal(false)
            setEditingGroup(null)
          }}
          onSave={async (data) => {
            setSaving(true)
            if (editingGroup) {
              await updateGroup(editingGroup.id, data)
            } else {
              await addGroup(data)
            }
            setSaving(false)
            setShowModal(false)
            setEditingGroup(null)
          }}
        />
      )}
    </div>
  )
}

function GroupFormModal({ group, users, onClose, onSave }) {
  const [name, setName] = useState(group?.name || '')
  const [description, setDescription] = useState(group?.description || '')
  const [selectedMembers, setSelectedMembers] = useState(group?.memberIds || [])

  const toggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave({
      name: name.trim(),
      description: description.trim(),
      memberIds: selectedMembers,
    })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={group ? 'Editar grupo' : 'Novo grupo'}
      size="md"
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit}>{group ? 'Salvar' : 'Criar'}</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome do grupo"
          placeholder="Ex: Engenharia"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="Descrição"
          placeholder="Descrição opcional..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div>
          <label className="text-sm font-medium text-text-primary block mb-2">
            Membros ({selectedMembers.length})
          </label>
          <div className="max-h-48 overflow-y-auto space-y-1 border border-border rounded-lg p-2">
            {users.map((user) => (
              <label
                key={user.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-tertiary transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(user.id)}
                  onChange={() => toggleMember(user.id)}
                  className="accent-brand rounded"
                />
                <Avatar name={user.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary">{user.name}</p>
                  <p className="text-xs text-text-muted">{user.email}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  )
}
