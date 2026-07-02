// ============================================================
// SettingsScreen — configurações do sistema
// ============================================================
// Abas:
//   - Meu Perfil: editar nome, alterar frase secreta
//   - Importar: upload JSON em lote (com preview e validação)
//   - Auditoria: histórico de ações (admin apenas)
// ============================================================

import { useState, useRef } from 'react'
import {
  User,
  Shield,
  Key,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  Upload,
  FileText,
  AlertCircle,
  Download,
} from 'lucide-react'
import { useStore } from '../context/StoreContext'
import Button from '../components/Button'
import Input from '../components/Input'
import Avatar from '../components/Avatar'
import AuditScreen from './AuditScreen'

export default function SettingsScreen() {
  const { currentUser } = useStore()
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { key: 'profile', label: 'Meu Perfil', icon: User },
    { key: 'import', label: 'Importar', icon: Upload },
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
        {activeTab === 'import' && <ImportPasswords />}
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

function ImportPasswords() {
  const { addPassword, folders, currentUser } = useStore()
  const fileInputRef = useRef(null)
  const [rawJson, setRawJson] = useState('')
  const [parsed, setParsed] = useState([])
  const [error, setError] = useState('')
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState(null)

  const handleFileUpload = (e) => {
    setError('')
    setResult(null)
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result
      if (typeof text === 'string') {
        setRawJson(text)
        parseAndPreview(text)
      }
    }
    reader.readAsText(file)
  }

  const parseAndPreview = (text) => {
    setError('')
    try {
      const data = JSON.parse(text)
      if (!Array.isArray(data)) {
        setError('O JSON deve ser um array de objetos.')
        setParsed([])
        return
      }
      const valid = data.filter((item) => item.name && item.username && item.password)
      if (valid.length === 0) {
        setError('Nenhum item válido encontrado. Cada item precisa ter name, username e password.')
        setParsed([])
        return
      }
      if (valid.length < data.length) {
        setError(`${data.length - valid.length} item(ns) ignorado(s) por falta de campos obrigatórios.`)
      }
      setParsed(valid)
    } catch {
      setError('Formato JSON inválido. Verifique o conteúdo.')
      setParsed([])
    }
  }

  const handleImport = async () => {
    if (parsed.length === 0) return
    setImporting(true)
    setError('')
    let success = 0
    let fail = 0
    for (const item of parsed) {
      try {
        await addPassword({
          name: item.name,
          username: item.username,
          password: item.password,
          url: item.url || null,
          notes: item.notes || null,
          folderId: item.folderId || null,
          createdBy: currentUser?.id,
        })
        success++
      } catch {
        fail++
      }
    }
    setResult({ success, fail })
    setParsed([])
    setRawJson('')
    setImporting(false)
  }

  const handleExportTemplate = () => {
    const template = [
      {
        name: 'Exemplo AWS',
        username: 'admin@exemplo.com',
        password: 'minha-senha-aqui',
        url: 'https://aws.amazon.com',
        folderId: null,
        notes: 'Observações opcionais',
      },
    ]
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'modelo-importacao.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text-primary">Importar senhas</h3>
        <p className="text-sm text-text-muted">
          Importe múltiplas senhas de uma vez usando um arquivo JSON.
        </p>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" icon={Download} onClick={handleExportTemplate}>
            Baixar modelo
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button variant="outline" icon={FileText} onClick={() => fileInputRef.current?.click()}>
            Selecionar arquivo
          </Button>
        </div>

        <div>
          <label className="text-sm font-medium text-text-primary block mb-2">
            Ou cole o JSON diretamente
          </label>
          <textarea
            value={rawJson}
            onChange={(e) => {
              setRawJson(e.target.value)
              if (e.target.value.trim()) {
                parseAndPreview(e.target.value)
              } else {
                setParsed([])
                setError('')
              }
            }}
            placeholder='[{ "name": "AWS", "username": "admin", "password": "123" }]'
            rows={6}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand font-mono resize-none"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 text-sm text-danger bg-danger/10 rounded-lg p-3">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {parsed.length > 0 && (
          <div>
            <p className="text-sm font-medium text-text-primary mb-2">
              Preview — {parsed.length} senha(s) para importar
            </p>
            <div className="max-h-60 overflow-y-auto border border-border rounded-lg divide-y divide-border">
              {parsed.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                  <div className="w-6 h-6 rounded bg-brand-light flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-brand">{idx + 1}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-text-primary truncate">{item.name}</p>
                    <p className="text-xs text-text-muted truncate">{item.username}</p>
                  </div>
                  {item.folderId && (
                    <span className="text-xs text-text-muted shrink-0">
                      pasta: {folders.find((f) => f.id === item.folderId)?.name || item.folderId}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {result && (
          <div className={`flex items-center gap-2 text-sm rounded-lg p-3 ${
            result.fail === 0
              ? 'bg-success/10 text-success'
              : 'bg-warning/10 text-warning'
          }`}>
            <Check size={16} />
            <span>{result.success} importada(s) com sucesso{result.fail > 0 ? `, ${result.fail} falha(s)` : ''}.</span>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleImport} disabled={parsed.length === 0} loading={importing}>
            Importar {parsed.length > 0 ? `${parsed.length} senha(s)` : ''}
          </Button>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
        <h4 className="text-sm font-semibold text-text-primary mb-2">Formato esperado</h4>
        <p className="text-xs text-text-muted mb-3">
          O JSON deve ser um array de objetos com os campos abaixo:
        </p>
        <div className="bg-surface-tertiary rounded-lg p-4 text-xs font-mono text-text-secondary">
          <pre>{`[
  {
    "name": "Nome do recurso",       // obrigatório
    "username": "usuario",            // obrigatório
    "password": "senha",              // obrigatório
    "url": "https://...",             // opcional
    "folderId": "id-da-pasta",        // opcional
    "notes": "observações"            // opcional
  }
]`}</pre>
        </div>
      </div>
    </div>
  )
}