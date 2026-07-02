// ============================================================
// ErrorState — estado de erro com retry
// ============================================================
// Exibido quando uma requisição falha. Mostra mensagem e
// botão "Tentar novamente" se onRetry for fornecido.
// ============================================================

import { AlertTriangle } from 'lucide-react'
import Button from './Button'

export default function ErrorState({
  message = 'Algo deu errado.',
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950 flex items-center justify-center mb-4">
        <AlertTriangle size={28} className="text-danger" />
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-1">Erro</h3>
      <p className="text-sm text-text-muted text-center max-w-xs mb-4">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  )
}
