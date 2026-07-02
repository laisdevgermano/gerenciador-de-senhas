// ============================================================
// AuditScreen — trilha de auditoria (admin)
// ============================================================
// Carrega eventos de GET /api/audit e exibe lista ordenada
// por data. Tipos: senha_criada, senha_editada, usuario_criado.
// ============================================================

import { useState, useEffect } from 'react'
import { Shield, Clock, User, KeyRound } from 'lucide-react'
import EmptyState from '../components/EmptyState'

export default function AuditScreen() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/audit', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (!res.ok) { setEvents([]); return }
        const data = await res.json()
        setEvents(data)
      } catch {
        setEvents([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const typeIcon = {
    senha_criada: KeyRound,
    senha_editada: KeyRound,
    usuario_criado: User,
  }

  const typeColor = {
    senha_criada: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950',
    senha_editada: 'text-amber-500 bg-amber-50 dark:bg-amber-950',
    usuario_criado: 'text-brand bg-brand-light',
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-2 mb-6">
        <Shield size={20} className="text-brand" />
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Auditoria</h2>
          <p className="text-sm text-text-muted">Histórico de ações no sistema</p>
        </div>
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="Nenhum evento"
          description="O histórico aparecerá aqui conforme o sistema for usado."
        />
      ) : (
        <div className="space-y-2">
          {events.map((event, i) => {
            const Icon = typeIcon[event.type] || Clock
            const color = typeColor[event.type] || 'text-text-muted bg-surface-tertiary'
            return (
              <div
                key={i}
                className="flex items-start gap-3 p-3 bg-surface rounded-xl border border-border"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                  <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary">{event.desc}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {new Date(event.date).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
