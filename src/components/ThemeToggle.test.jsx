import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ThemeToggle from './ThemeToggle'
import { ThemeProvider } from '../context/ThemeContext'
import { describe, it, expect, vi } from 'vitest'

const renderWithTheme = (ui) => render(<ThemeProvider>{ui}</ThemeProvider>)

describe('ThemeToggle', () => {
  it('renderiza botão de alternância', () => {
    renderWithTheme(<ThemeToggle />)
    expect(screen.getByTitle('Modo escuro')).toBeInTheDocument()
  })

  it('alterna tema ao clicar', async () => {
    const user = userEvent.setup()
    renderWithTheme(<ThemeToggle />)
    const btn = screen.getByTitle('Modo escuro')
    await user.click(btn)
    expect(screen.getByTitle('Modo claro')).toBeInTheDocument()
  })
})
