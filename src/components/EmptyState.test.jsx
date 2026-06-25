import { render, screen } from '@testing-library/react'
import EmptyState from './EmptyState'
import { describe, it, expect } from 'vitest'

describe('EmptyState', () => {
  it('renderiza com título e descrição padrão', () => {
    render(<EmptyState />)
    expect(screen.getByText('Nada aqui ainda')).toBeInTheDocument()
  })

  it('renderiza com título e descrição personalizados', () => {
    render(<EmptyState title="Sem resultados" description="Nenhum item encontrado." />)
    expect(screen.getByText('Sem resultados')).toBeInTheDocument()
    expect(screen.getByText('Nenhum item encontrado.')).toBeInTheDocument()
  })

  it('não renderiza descrição se não for fornecida', () => {
    render(<EmptyState title="Vazio" />)
    expect(screen.queryByText('Nenhum item encontrado.')).not.toBeInTheDocument()
  })

  it('renderiza action quando fornecida', () => {
    render(<EmptyState action={<button>Criar</button>} />)
    expect(screen.getByRole('button', { name: 'Criar' })).toBeInTheDocument()
  })
})
