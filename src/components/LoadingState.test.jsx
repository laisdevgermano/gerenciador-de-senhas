import { render, screen } from '@testing-library/react'
import LoadingState from './LoadingState'
import { describe, it, expect } from 'vitest'

describe('LoadingState', () => {
  it('renderiza mensagem padrão', () => {
    render(<LoadingState />)
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('renderiza mensagem personalizada', () => {
    render(<LoadingState message="Buscando dados..." />)
    expect(screen.getByText('Buscando dados...')).toBeInTheDocument()
  })
})
