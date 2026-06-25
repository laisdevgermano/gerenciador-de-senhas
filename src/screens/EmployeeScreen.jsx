import { useState } from 'react'
import { Users, Plus, Edit3, Trash2, X, Eye, EyeOff } from 'lucide-react'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Input from '../components/Input'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import { useStore } from '../context/StoreContext'

export default function EmployeeScreen() {
  const { employees, passwords, addEmployee, updateEmployee, deleteEmployee, setEmployeeAccess, getEmployeeAccess } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Funcionários</h2>
          <p className="text-sm text-text-muted">Cadastre e gerencie o acesso dos funcionários</p>
        </div>
        <Button
          icon={Plus}
          onClick={() => {
            setEditing(null)
            setShowModal(true)
          }}
        >
          Novo funcionário
        </Button>
      </div>

      {employees.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum funcionário"
          description="Cadastre funcionários e defina quais senhas cada um pode acessar."
          action={
            <Button size="sm" icon={Plus} onClick={() => setShowModal(true)}>
              Cadastrar funcionário
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {employees.map((emp) => {
            const empAccess = getEmployeeAccess(emp.id)
            return (
              <div
                key={emp.id}
                className="bg-surface rounded-xl border border-border p-5 shadow-sm group hover:border-border-hover transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-light flex items-center justify-center">
                      <Users size={18} className="text-brand" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary">{emp.name}</h3>
                      <p className="text-xs text-text-muted">{emp.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditing({ ...emp, access: empAccess.map((p) => ({ id: p.id, permission: p.sharedWith.find((sa) => sa.userId === emp.id)?.permission || 'read' })) })
                        setShowModal(true)
                      }}
                      className="p-1.5 rounded-lg text-text-muted hover:text-brand hover:bg-brand-light transition-colors cursor-pointer"
                    >
                      <Edit3 size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  {emp.cargo && <Badge variant="info">{emp.cargo}</Badge>}
                  {emp.departamento && <Badge variant="success">{emp.departamento}</Badge>}
                  {emp.telefone && <span className="text-text-muted">{emp.telefone}</span>}
                  <Badge variant={emp.status === 'active' ? 'success' : 'warning'}>
                    {emp.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>

                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-text-muted mb-1">
                    Acesso a <strong>{empAccess.length}</strong> senha(s)
                  </p>
                  {empAccess.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {empAccess.map((p) => (
                        <span key={p.id} className="text-xs px-2 py-0.5 rounded-full bg-surface-tertiary text-text-secondary">
                          {p.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <EmployeeFormModal
          employee={editing}
          passwords={passwords}
          onClose={() => {
            setShowModal(false)
            setEditing(null)
          }}
          onSave={async (data) => {
            setSaving(true)
            try {
              if (editing) {
                const { access, ...rest } = data
                await updateEmployee(editing.id, rest)
                if (access) await setEmployeeAccess(editing.id, access)
              } else {
                const { access, ...rest } = data
                const emp = await addEmployee(rest)
                if (access?.length) await setEmployeeAccess(emp.id, access)
              }
              setShowModal(false)
              setEditing(null)
            } finally {
              setSaving(false)
            }
          }}
          onDelete={async (id) => {
            await deleteEmployee(id)
            setShowModal(false)
            setEditing(null)
          }}
          saving={saving}
        />
      )}
    </div>
  )
}

function EmployeeFormModal({ employee, passwords, onClose, onSave, onDelete, saving }) {
  const [name, setName] = useState(employee?.name || '')
  const [email, setEmail] = useState(employee?.email || '')
  const [passphrase, setPassphrase] = useState('')
  const [confirmPassphrase, setConfirmPassphrase] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [passError, setPassError] = useState('')
  const [cargo, setCargo] = useState(employee?.cargo || '')
  const [departamento, setDepartamento] = useState(employee?.departamento || '')
  const [telefone, setTelefone] = useState(employee?.telefone || '')
  const [access, setAccess] = useState(employee?.access || [])

  const togglePassword = (pwd) => {
    setAccess((prev) => {
      const exists = prev.find((a) => a.id === pwd.id)
      if (exists) return prev.filter((a) => a.id !== pwd.id)
      return [...prev, { id: pwd.id, permission: 'read' }]
    })
  }

  const setPermission = (passwordId, permission) => {
    setAccess((prev) => prev.map((a) => a.id === passwordId ? { ...a, permission } : a))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    if (!employee && !passphrase.trim()) return
    if (passphrase && passphrase !== confirmPassphrase) return
    if (passphrase && passphrase.length < 6) {
      setPassError('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    onSave({
      name: name.trim(),
      email: email.trim(),
      ...(passphrase.trim() ? { passphrase: passphrase.trim() } : {}),
      cargo: cargo.trim() || undefined,
      departamento: departamento.trim() || undefined,
      telefone: telefone.trim() || undefined,
      access,
    })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={employee ? 'Editar funcionário' : 'Novo funcionário'}
      size="md"
      actions={
        <>
          <Button variant="danger" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} loading={saving}>
            {employee ? 'Salvar' : 'Criar'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Nome completo" placeholder="Ex: João Silva" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" type="email" placeholder="joao@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!!employee} />
          <div className="relative">
            <Input label={employee ? 'Nova senha (opcional)' : 'Senha provisória'} type={showPass ? 'text' : 'password'} placeholder={employee ? 'Deixe em branco para manter' : 'Defina uma senha'} value={passphrase} onChange={(e) => { setPassphrase(e.target.value); setPassError('') }} />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-[38px] text-text-muted hover:text-text-primary cursor-pointer">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <Input label={employee ? 'Confirmar nova senha' : 'Confirmar senha'} type={showPass ? 'text' : 'password'} placeholder="Repita a senha" value={confirmPassphrase} onChange={(e) => { setConfirmPassphrase(e.target.value); setPassError('') }} error={passError || (confirmPassphrase && passphrase !== confirmPassphrase ? 'As senhas não coincidem' : '')} />
          <Input label="Telefone" placeholder="(11) 99999-9999" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
          <Input label="Cargo" placeholder="Ex: Desenvolvedor" value={cargo} onChange={(e) => setCargo(e.target.value)} />
          <Input label="Departamento" placeholder="Ex: TI" value={departamento} onChange={(e) => setDepartamento(e.target.value)} />
        </div>

        <div>
          <label className="text-sm font-medium text-text-primary block mb-2">
            Acesso a senhas ({access.length} selecionadas)
          </label>
          <div className="max-h-48 overflow-y-auto space-y-1 border border-border rounded-lg p-2">
            {passwords.length === 0 && (
              <p className="text-xs text-text-muted p-2">Nenhuma senha cadastrada ainda.</p>
            )}
            {passwords.map((pwd) => {
              const selected = access.find((a) => a.id === pwd.id)
              return (
                <div key={pwd.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface-tertiary transition-colors">
                  <input
                    type="checkbox"
                    checked={!!selected}
                    onChange={() => togglePassword(pwd)}
                    className="accent-brand rounded"
                  />
                  <span className="flex-1 text-sm text-text-primary">{pwd.name}</span>
                  {selected && (
                    <select
                      value={selected.permission}
                      onChange={(e) => setPermission(pwd.id, e.target.value)}
                      className="text-xs border border-border rounded-lg px-2 py-1 bg-surface text-text-primary"
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
        </div>

        {employee && (
          <div className="pt-4 border-t border-border">
            <Button
              variant="ghost"
              icon={Trash2}
              onClick={() => {
                if (confirm(`Excluir funcionário "${employee.name}" permanentemente?`)) {
                  onDelete(employee.id)
                }
              }}
            >
              Excluir funcionário
            </Button>
          </div>
        )}
      </form>
    </Modal>
  )
}
