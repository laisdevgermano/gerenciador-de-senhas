// ============================================================
// OnboardingScreen — tutorial inicial (primeiro acesso)
// ============================================================
// Guia o novo usuário por 3 etapas:
// 1. Explicação da conta criptografada
// 2. Download da chave privada (placeholder futura)
// 3. Proteção com frase secreta (seguirá no fluxo de login)
// ============================================================

import { useState } from 'react'
import { Lock, Download, KeyRound, Shield, ArrowRight, Check } from 'lucide-react'
import Button from '../components/Button'
import ThemeToggle from '../components/ThemeToggle'

/* FUTURE: gerar par de chaves GPG no dispositivo
 *   const { publicKey, privateKey } = await openpgp.generateKey({ ... }) */
export default function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(0)
  const [downloadDone, setDownloadDone] = useState(false)

  const steps = [
    {
      icon: KeyRound,
      title: 'Crie sua conta',
      description:
        'Você está prestes a configurar o G-Pass neste dispositivo. Primeiro, vamos gerar um par de chaves criptográficas exclusivo para você.',
    },
    {
      icon: Download,
      title: 'Baixe sua chave privada',
      description:
        'Sua chave privada é a única forma de acessar suas senhas. Baixe-a e guarde em um local seguro. Sem ela, você não conseguirá acessar sua conta.',
      action: (
        <Button
          variant={downloadDone ? 'secondary' : 'primary'}
          icon={downloadDone ? Check : Download}
          onClick={() => {
            /* FUTURE: download real do blob da chave
             *   const blob = new Blob([privateKey], { type: 'application/pgp-keys' })
             *   const url = URL.createObjectURL(blob)
             *   const a = document.createElement('a'); a.href = url; a.download = 'vault-key.asc'
             *   a.click() */
            setDownloadDone(true)
          }}
        >
          {downloadDone ? 'Baixado' : 'Baixar chave privada'}
        </Button>
      ),
    },
    {
      icon: Shield,
      title: 'Proteja sua chave',
      description:
        'Defina uma frase secreta forte para proteger sua chave privada. Essa frase será solicitada toda vez que você entrar no G-Pass.',
    },
  ]

  const current = steps[step]

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      onComplete?.()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-secondary p-4 relative">
      <ThemeToggle className="absolute top-4 right-4" />
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === step
                  ? 'w-8 bg-brand'
                  : idx < step
                  ? 'w-6 bg-brand/40'
                  : 'w-6 bg-border'
              }`}
            />
          ))}
        </div>

        <div className="bg-surface rounded-xl border border-border p-8 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-brand-light flex items-center justify-center mb-6 mx-auto">
            <current.icon size={28} className="text-brand" />
          </div>

          <h2 className="text-xl font-bold text-text-primary text-center mb-3">
            {current.title}
          </h2>

          <p className="text-sm text-text-secondary text-center leading-relaxed mb-8">
            {current.description}
          </p>

          {current.action && (
            <div className="flex justify-center mb-6">{current.action}</div>
          )}

          <Button
            className="w-full"
            size="lg"
            icon={ArrowRight}
            onClick={handleNext}
            disabled={step === 1 && !downloadDone}
          >
            {step === steps.length - 1 ? 'Concluir' : 'Próximo'}
          </Button>
        </div>
      </div>
    </div>
  )
}
