// ============================================================
// ThemeToggle — botão alternar tema claro/escuro
// ============================================================
// Lê o tema atual de ThemeContext e alterna ao clicar.
// Ícone: Lua (modo claro) → Sol (modo escuro).
// ============================================================

import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle({ className = '' }) {
  const { theme, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      className={`p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-tertiary transition-colors cursor-pointer ${className}`}
      title={theme === 'light' ? 'Modo escuro' : 'Modo claro'}
    >
      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  )
}
