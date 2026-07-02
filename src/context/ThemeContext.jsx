// ============================================================
// CONTEXTO DE TEMA — alternância entre claro/escuro
// ============================================================
// Gerencia o tema global da aplicação (light/dark).
// Persiste a escolha no localStorage e aplica a classe CSS
// "dark" no elemento <html> para ativar as variáveis do tema.
// ============================================================

import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  // Estado inicial: 'dark' (pode ser alterado pelo usuário)
  const [theme, setTheme] = useState('dark')
  const [mounted, setMounted] = useState(false)

  // Ao montar, carrega preferência salva no localStorage
  useEffect(() => {
    const saved = localStorage.getItem('gpass-theme')
    if (saved) setTheme(saved)
    setMounted(true)
  }, [])

  // Sincroniza a classe .dark no <html> e salva no localStorage
  useEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('gpass-theme', theme)
  }, [theme, mounted])

  // Alterna entre light e dark
  const toggle = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook para consumir o tema em qualquer componente
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme deve ser usado dentro de ThemeProvider')
  return ctx
}
