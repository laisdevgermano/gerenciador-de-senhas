import { useState } from 'react'
import {
  User,
  Shield,
  Key,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react'
import { useStore } from '../context/StoreContext'
import Button from '../components/Button'
import Input from '../components/Input'
import Avatar from '../components/Avatar'
import AuditScreen from './AuditScreen'

/* FUTURE: salvar configurações no backend
 *   const saveProfile = (data) => api.put('/users/me', data)
 *   const enableMFA = () => api.post('/auth/mfa/enable') */
export default function SettingsScreen() {
  const { currentUser } = useStore()
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { key: 'profile', label: 'Meu Perfil', icon: User },
    { key: 'audit', label: 'Auditoria', icon: Shield },
  ]

  return (
    <div className="flex h-full">
      <nav className="w-56 border-r border-border p-2 shrink-0 overflow-y-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left cursor-pointer ${
                isActive
                  ? 'bg-surface-active font-medium'
                  : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary'
              }`}
            >
              <tab.icon size={16} className={`shrink-0 ${isActive ? 'text-brand' : ''}`} />
              <span className="truncate">{tab.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'profile' && <ProfileSettings user={currentUser} />}
        {activeTab === 'audit' && currentUser?.role === 'admin' && <AuditScreen />}
        {activeTab === 'audit' && currentUser?.role !== 'admin' && (
          <div className="p-6 text-text-muted text-sm">Acesso restrito a administradores.</div>
        )}
      </div>
    </div>
  )
}

function ProfileSettings({ user }) {
  const { updateUser } = useStore()
  const [name, setName] = useState(user?.name || '')
  const [email] = useState(user?.email || '')
  const [saved, setSaved] = useState(false)

  const [newPassphrase, setNewPassphrase] = useState('')
  const [confirmPassphrase, setConfirmPassphrase] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passSaved, setPassSaved] = useState(false)
  const [passError, setPassError] = useState('')
  const [savingPass, setSavingPass] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleChangePassphrase = async () => {
    setPassError('')
    if (!newPassphrase.trim()) {
      setPassError('Informe a nova frase secreta.')
      return
    }
    if (newPassphrase.length < 6) {
      setPassError('A frase secreta deve ter pelo menos 6 caracteres.')
      return
    }
    if (newPassphrase !== confirmPassphrase) {
      setPassError('As frases não coincidem.')
      return
    }
    setSavingPass(true)
    try {
      await updateUser(user.id, { passphrase: newPassphrase })
      setPassSaved(true)
      setNewPassphrase('')
      setConfirmPassphrase('')
      setTimeout(() => setPassSaved(false), 2000)
    } catch {
      setPassError('Erro ao alterar a frase secreta.')
    } finally {
      setSavingPass(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text-primary">Meu Perfil</h3>
        <p className="text-sm text-text-muted">Suas informações pessoais</p>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <Avatar name={user?.name} size="xl" />
          <div>
            <p className="text-sm font-medium text-text-primary">{user?.name}</p>
            <p className="text-xs text-text-muted">{user?.role === 'admin' ? 'Administrador' : 'Usuário'}</p>
          </div>
        </div>

        <Input
          label="Nome completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input label="Email" value={email} disabled hint="O email não pode ser alterado." />

        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} icon={saved ? Check : undefined}>
            {saved ? 'Salvo' : 'Salvar alterações'}
          </Button>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Key size={16} className="text-brand" />
          <h4 className="text-sm font-semibold text-text-primary">Alterar frase secreta</h4>
        </div>
        <p className="text-xs text-text-muted -mt-2">
          Apenas você pode alterar sua própria frase secreta.
        </p>

        <div className="relative">
          <Input
            label="Nova frase secreta"
            type={showNew ? 'text' : 'password'}
            placeholder="Mínimo de 6 caracteres"
            value={newPassphrase}
            onChange={(e) => setNewPassphrase(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-[38px] text-text-muted hover:text-text-primary cursor-pointer"
          >
            {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div className="relative">
          <Input
            label="Confirmar nova frase secreta"
            type={showConfirm ? 'text' : 'password'}
            placeholder="Repita a nova frase secreta"
            value={confirmPassphrase}
            onChange={(e) => setConfirmPassphrase(e.target.value)}
            error={passError}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-[38px] text-text-muted hover:text-text-primary cursor-pointer"
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <Button
            onClick={handleChangePassphrase}
            icon={passSaved ? Check : RefreshCw}
            loading={savingPass}
          >
            {passSaved ? 'Alterada' : 'Alterar frase secreta'}
          </Button>
        </div>
      </div>
    </div>
  )
}
