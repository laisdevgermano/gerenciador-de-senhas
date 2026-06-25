import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ErrorState from './ErrorState'
import { describe, it, expect, vi } from 'vitest'

describe('ErrorState', () => {
  it('renderiza mensagem padrão', () => {
    render(<ErrorState />)
    expect(screen.getByText('Algo deu errado.')).toBeInTheDocument()
  })

  it('renderiza mensagem personalizada', () => {
    render(<ErrorState message="Erro de conexão." />)
    expect(screen.getByText('Erro de conexão.')).toBeInTheDocument()
  })

  it('renderiza botão de retry quando onRetry é fornecido', () => {
    render(<ErrorState onRetry={() => {}} />)
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument()
  })

  it('não renderiza botão de retry quando onRetry não é fornecido', () => {
    render(<ErrorState />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('chama onRetry ao clicar no botão', async () => {
    const onRetry = vi.fn()
    const user = userEvent.setup()
    render(<ErrorState onRetry={onRetry} />)
    await user.click(screen.getByRole('button'))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
