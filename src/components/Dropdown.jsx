// ============================================================
// Dropdown — menu suspenso customizado
// ============================================================
// Recebe um `trigger` (elemento que abre o menu) e uma lista
// de `items`. Cada item pode ter: label, icon, onClick, danger
// (cor vermelha), separator (linha horizontal).
// ============================================================

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

/* FUTURE: substituir por @radix-ui/react-dropdown-menu
 * para posicionamento, keyboard nav e acessibilidade. */
export default function Dropdown({
  trigger,
  items = [],
  align = 'left',
  className = '',
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 cursor-pointer"
      >
        {trigger}
      </button>
      {open && (
        <div
          className={`absolute z-50 mt-1 min-w-[180px] bg-surface rounded-lg border border-border shadow-lg py-1 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {items.map((item, idx) =>
            item.separator ? (
              <div key={idx} className="h-px bg-border my-1" />
            ) : (
              <button
                key={item.key || idx}
                onClick={() => {
                  item.onClick?.()
                  setOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors cursor-pointer ${
                  item.danger
                    ? 'text-danger hover:bg-rose-50 dark:hover:bg-rose-950'
                    : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary'
                }`}
              >
                {item.icon && <item.icon size={16} />}
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}
