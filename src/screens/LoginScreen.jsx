import { useState } from 'react'
import { Lock, Eye, EyeOff, KeyRound } from 'lucide-react'
import Button from '../components/Button'
import Input from '../components/Input'
import ThemeToggle from '../components/ThemeToggle'

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [showPassphrase, setShowPassphrase] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState('email')

  const handleEmailSubmit = (e) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Informe seu email.')
      return
    }
    setError('')
    setStep('passphrase')
  }

  const handlePassphraseSubmit = async (e) => {
    e.preventDefault()
    if (!passphrase.trim()) {
      setError('Informe sua frase secreta.')
      return
    }
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, passphrase }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Frase secreta inválida.')
        return
      }

      localStorage.setItem('token', data.token)
      onLogin(data.user)
    } catch {
      setError('Erro ao conectar ao servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-secondary p-4 relative">
      <ThemeToggle className="absolute top-4 right-4" />
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand flex items-center justify-center mb-4 shadow-lg shadow-brand/20">
            <Lock size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">G-Pass</h1>
          <p className="text-sm text-text-muted mt-1">
            Gerencie suas senhas com segurança
          </p>
        </div>

        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Lock}
                error={error}
              />

              <Button type="submit" className="w-full" size="lg">
                Continuar
              </Button>

              <p className="text-xs text-text-muted text-center mt-4">
                Primeira vez?{' '}
                <button
                  type="button"
                  onClick={() => onLogin?.({ isOnboarding: true })}
                  className="text-brand font-medium hover:underline cursor-pointer"
                >
                  Configure seu dispositivo
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handlePassphraseSubmit} className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                <KeyRound size={14} />
                <span>
                  Frase secreta para{' '}
                  <span className="font-medium text-text-primary">{email}</span>
                </span>
              </div>

              <div className="relative">
                <Input
                  label="Frase secreta"
                  type={showPassphrase ? 'text' : 'password'}
                  placeholder="Digite sua frase secreta"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  error={error}
                />
                <button
                  type="button"
                  onClick={() => setShowPassphrase(!showPassphrase)}
                  className="absolute right-3 top-[38px] text-text-muted hover:text-text-primary cursor-pointer"
                >
                  {showPassphrase ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <Button type="submit" className="w-full" size="lg" loading={loading}>
                Entrar
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep('email')
                  setError('')
                  setPassphrase('')
                }}
                className="w-full text-sm text-brand hover:underline cursor-pointer text-center"
              >
                Voltar
              </button>
            </form>
          )}
        </div>

        <p className="text-xs text-text-muted text-center mt-6">
          Protegido por criptografia de ponta a ponta
        </p>
      </div>
    </div>
  )
}
