import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

/* FUTURE: substituir por <dialog> nativo ou Radix Dialog
 * para melhor acessibilidade (focus trap, aria-modal, etc.) */
export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  actions,
}) {
  const overlayRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === overlayRef.current && onClose?.()}
    >
      <div
        className={`w-full ${sizes[size]} bg-surface rounded-xl shadow-xl border border-border overflow-hidden`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-start justify-between p-6 pb-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-text-primary truncate">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-tertiary transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">{children}</div>

        {actions && (
          <div className="flex items-center justify-end gap-3 px-6 pb-6 border-t border-border mt-2 pt-4">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

export function useModal() {
  const ref = useRef(null)
  const open = () => ref.current?.showModal()
  const close = () => ref.current?.close()
  return { ref, open, close }
}
