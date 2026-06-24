import { useState, useCallback } from 'react'
import {
  Key,
  RefreshCw,
  Copy,
  Check,
  Sliders,
  Eye,
  EyeOff,
} from 'lucide-react'
import Button from '../components/Button'
import Badge from '../components/Badge'

export default function StandaloneGeneratorScreen() {
  const [length, setLength] = useState(24)
  const [includeUpper, setIncludeUpper] = useState(true)
  const [includeLower, setIncludeLower] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSymbols, setIncludeSymbols] = useState(true)
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false)
  const [password, setPassword] = useState('')
  const [copied, setCopied] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const generate = useCallback(() => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lower = 'abcdefghijklmnopqrstuvwxyz'
    const numbers = '0123456789'
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    const ambiguous = '0O1lI!|'

    let chars = ''
    if (includeUpper) chars += upper
    if (includeLower) chars += lower
    if (includeNumbers) chars += numbers
    if (includeSymbols) chars += symbols

    if (excludeAmbiguous) {
      for (const ch of ambiguous) {
        chars = chars.replaceAll(ch, '')
      }
    }

    if (!chars) {
      setPassword('')
      return
    }

    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)]
    }
    setPassword(result)
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols, excludeAmbiguous])

  const copyPassword = () => {
    if (!password) return
    navigator.clipboard?.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const calculateEntropy = () => {
    if (!password) return 0
    let pool = 0
    if (includeUpper) pool += 26
    if (includeLower) pool += 26
    if (includeNumbers) pool += 10
    if (includeSymbols) pool += 21
    if (excludeAmbiguous) pool -= 7
    return Math.round(Math.log2(pool) * password.length)
  }

  const entropy = calculateEntropy()
  const entropyLabel =
    entropy >= 100 ? 'Muito forte' : entropy >= 60 ? 'Forte' : entropy >= 36 ? 'Média' : 'Fraca'
  const entropyColor =
    entropy >= 100 ? 'success' : entropy >= 60 ? 'brand' : entropy >= 36 ? 'warning' : 'danger'

  return (
    <div className="min-h-screen bg-surface-secondary flex items-center justify-center p-4 relative">
      <ThemeToggle className="absolute top-4 right-4" />
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center">
            <Key size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-text-primary">Gerador de Senhas</h1>
        </div>

        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm space-y-5">
          <div className="bg-surface-tertiary rounded-lg p-4 border border-border">
            {password ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className={`font-mono text-base break-all ${showPassword ? 'text-text-primary' : 'text-text-primary select-none'}`}>
                    {showPassword ? password : '•'.repeat(Math.min(password.length, 40))}
                  </p>
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-text-muted hover:text-text-primary cursor-pointer shrink-0"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={entropyColor}>{entropyLabel}</Badge>
                  <span className="text-xs text-text-muted">{password.length} caracteres</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-muted text-center py-4">
                Clique em "Gerar" para criar uma senha
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button className="flex-1" icon={RefreshCw} onClick={generate}>
              Gerar
            </Button>
            <Button
              variant="secondary"
              icon={copied ? Check : Copy}
              onClick={copyPassword}
              disabled={!password}
            >
              {copied ? 'Copiado' : 'Copiar'}
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-text-primary">Tamanho: {length}</label>
                <span className="text-xs text-text-muted">{length} caracteres</span>
              </div>
              <input
                type="range"
                min={8}
                max={64}
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full accent-brand"
              />
              <div className="flex justify-between text-[10px] text-text-muted">
                <span>8</span>
                <span>64</span>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { label: 'Letras maiúsculas (A-Z)', value: includeUpper, set: setIncludeUpper },
                { label: 'Letras minúsculas (a-z)', value: includeLower, set: setIncludeLower },
                { label: 'Números (0-9)', value: includeNumbers, set: setIncludeNumbers },
                { label: 'Símbolos (!@#$%)', value: includeSymbols, set: setIncludeSymbols },
                { label: 'Excluir ambíguos (0O1lI!|)', value: excludeAmbiguous, set: setExcludeAmbiguous },
              ].map((opt) => (
                <label
                  key={opt.label}
                  className="flex items-center gap-2 py-1 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={opt.value}
                    onChange={(e) => opt.set(e.target.checked)}
                    className="accent-brand rounded"
                  />
                  <span className="text-sm text-text-secondary">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
