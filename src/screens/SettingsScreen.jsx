import { useState } from 'react'
import {
  User,
  Shield,
  Key,
  Smartphone,
  Download,
  Upload,
  RefreshCw,
  Check,
  Copy,
  Eye,
  EyeOff,
  ChevronRight,
  Lock,
  LogOut,
} from 'lucide-react'
import { useStore } from '../context/StoreContext'
import Button from '../components/Button'
import Input from '../components/Input'
import Badge from '../components/Badge'
import Avatar from '../components/Avatar'
import TagScreen from './TagScreen'
import FolderScreen from './FolderScreen'
import GroupScreen from './GroupScreen'
import AdminScreen from './AdminScreen'
import ImportExportScreen from './ImportExportScreen'

/* FUTURE: salvar configurações no backend
 *   const saveProfile = (data) => api.put('/users/me', data)
 *   const enableMFA = () => api.post('/auth/mfa/enable') */
export default function SettingsScreen() {
  const { currentUser } = useStore()
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { key: 'profile', label: 'Meu Perfil', icon: User },
    { key: 'security', label: 'Segurança', icon: Shield },
    { key: 'folders', label: 'Pastas', icon: Lock },
    { key: 'tags', label: 'Tags', icon: Key },
    { key: 'groups', label: 'Grupos', icon: Lock },
    { key: 'admin', label: 'Administração', icon: Shield },
    { key: 'import-export', label: 'Importar / Exportar', icon: Download },
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
        {activeTab === 'security' && <SecuritySettings />}
        {activeTab === 'folders' && <FolderScreen />}
        {activeTab === 'tags' && <TagScreen />}
        {activeTab === 'groups' && <GroupScreen />}
        {activeTab === 'admin' && currentUser?.role === 'admin' && <AdminScreen />}
        {activeTab === 'admin' && currentUser?.role !== 'admin' && (
          <div className="p-6 text-text-muted text-sm">Acesso restrito a administradores.</div>
        )}
        {activeTab === 'import-export' && <ImportExportScreen />}
      </div>
    </div>
  )
}

function ProfileSettings({ user }) {
  const [name, setName] = useState(user?.name || '')
  const [email] = useState(user?.email || '')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    /* FUTURE: api.put('/users/me', { name }) */
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
    </div>
  )
}

function SecuritySettings() {
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)

  const mockPublicKey = `-----BEGIN PGP PUBLIC KEY BLOCK-----
xsFNBGcAAAAAABAAxFKx4L5f2g3H...
-----END PGP PUBLIC KEY BLOCK-----`

  const handleCopyKey = () => {
    navigator.clipboard?.writeText(mockPublicKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text-primary">Segurança</h3>
        <p className="text-sm text-text-muted">Gerencie sua chave e autenticação</p>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6 shadow-sm space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-text-primary">Chave pública</p>
              <p className="text-xs text-text-muted">Compartilhe esta chave para receber senhas</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={copied ? Check : Copy}
              onClick={handleCopyKey}
            >
              {copied ? 'Copiado' : 'Copiar'}
            </Button>
          </div>
          <div className="bg-surface-tertiary rounded-lg p-3 font-mono text-xs text-text-secondary break-all max-h-24 overflow-y-auto border border-border">
            {showKey ? mockPublicKey : mockPublicKey.slice(0, 60) + '...'}
          </div>
          <button
            onClick={() => setShowKey(!showKey)}
            className="text-xs text-brand hover:underline mt-1 cursor-pointer"
          >
            {showKey ? 'Ocultar' : 'Mostrar'} chave completa
          </button>
        </div>

        <div className="h-px bg-border" />

        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-text-primary">Autenticação de dois fatores (MFA)</p>
              <p className="text-xs text-text-muted">Adicione uma camada extra de segurança</p>
            </div>
            <Badge variant={false ? 'success' : 'warning'}>
              {false ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
          <Button variant="outline" size="sm" icon={Smartphone}>
            Configurar MFA
          </Button>
          {/* FUTURE: fluxo de configuração de MFA
           *   1. api.post('/auth/mfa/setup') -> retorna QR code
           *   2. api.post('/auth/mfa/verify', { code }) -> habilita MFA */}
        </div>

        <div className="h-px bg-border" />

        <div>
          <p className="text-sm font-medium text-text-primary mb-1">Frase secreta</p>
          <p className="text-xs text-text-muted mb-3">
            Você pode alterar sua frase secreta a qualquer momento.
          </p>
          <Button variant="secondary" size="sm" icon={RefreshCw}>
            Alterar frase secreta
          </Button>
        </div>
      </div>
    </div>
  )
}
