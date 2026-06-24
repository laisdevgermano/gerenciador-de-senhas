'use client'

import { useState } from 'react'
import { ThemeProvider } from '@/context/ThemeContext'
import { StoreProvider } from '@/context/StoreContext'
import LoginScreen from '@/screens/LoginScreen'
import OnboardingScreen from '@/screens/OnboardingScreen'
import DashboardScreen from '@/screens/DashboardScreen'

export default function AppShell() {
  const [appState, setAppState] = useState('login')
  const [user, setUser] = useState(null)

  const handleLogin = (userData) => {
    if (userData?.isOnboarding) {
      setAppState('onboarding')
      return
    }
    setUser(userData)
    setAppState('dashboard')
  }

  return (
    <ThemeProvider>
      <StoreProvider currentUser={user}>
        {appState === 'login' && <LoginScreen onLogin={handleLogin} />}
        {appState === 'onboarding' && (
          <OnboardingScreen onComplete={() => setAppState('login')} />
        )}
        {appState === 'dashboard' && (
          <DashboardScreen
            user={user}
            onLogout={() => {
              setUser(null)
              setAppState('login')
            }}
          />
        )}
      </StoreProvider>
    </ThemeProvider>
  )
}
