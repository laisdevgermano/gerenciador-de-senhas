// ============================================================
// AppShell — raiz da aplicação (gerenciamento de estado)
// ============================================================
// Controla o fluxo: Login → Onboarding (opcional) → Dashboard
// Salva/restaura token e user do localStorage.
// Encapsula tudo em ThemeProvider e StoreProvider.
// ============================================================

'use client'

import { useState, useEffect } from 'react'
import { ThemeProvider } from '@/context/ThemeContext'
import { StoreProvider } from '@/context/StoreContext'
import LoginScreen from '@/screens/LoginScreen'
import OnboardingScreen from '@/screens/OnboardingScreen'
import DashboardScreen from '@/screens/DashboardScreen'

function getSavedUser() {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function AppShell() {
  const [appState, setAppState] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (localStorage.getItem('token')) {
      const saved = getSavedUser()
      if (saved) {
        setUser(saved)
        setAppState('dashboard')
        return
      }
    }
    setAppState('login')
  }, [])

  const handleLogin = (userData) => {
    if (userData?.isOnboarding) {
      setAppState('onboarding')
      return
    }
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    setAppState('dashboard')
  }

  const handleLogout = () => {
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    localStorage.removeItem('user')
    setUser(null)
    setAppState('login')
  }

  return (
    <ThemeProvider>
      <StoreProvider currentUser={user}>
        {appState === null && (
          <div className="min-h-screen flex items-center justify-center bg-surface-secondary">
            <div className="w-8 h-8 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
          </div>
        )}
        {appState === 'login' && <LoginScreen onLogin={handleLogin} />}
        {appState === 'onboarding' && (
          <OnboardingScreen onComplete={() => setAppState('login')} />
        )}
        {appState === 'dashboard' && (
          <DashboardScreen user={user} onLogout={handleLogout} />
        )}
      </StoreProvider>
    </ThemeProvider>
  )
}
