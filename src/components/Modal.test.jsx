import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Modal from './Modal'
import { describe, it, expect, vi } from 'vitest'

describe('Modal', () => {
  it('não renderiza quando open é false', () => {
    render(<Modal open={false} title="Teste">Conteúdo</Modal>)
    expect(screen.queryByText('Teste')).not.toBeInTheDocument()
  })

  it('renderiza quando open é true', () => {
    render(<Modal open={true} title="Teste">Conteúdo</Modal>)
    expect(screen.getByText('Teste')).toBeInTheDocument()
    expect(screen.getByText('Conteúdo')).toBeInTheDocument()
  })

  it('renderiza subtitle quando fornecido', () => {
    render(<Modal open={true} title="Teste" subtitle="Descrição">Conteúdo</Modal>)
    expect(screen.getByText('Descrição')).toBeInTheDocument()
  })

  it('chama onClose ao clicar no X', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<Modal open={true} title="Teste" onClose={onClose}>Conteúdo</Modal>)
    await user.click(screen.getByLabelText('Fechar'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('chama onClose ao pressionar Escape', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<Modal open={true} title="Teste" onClose={onClose}>Conteúdo</Modal>)
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('renderiza actions quando fornecido', () => {
    render(<Modal open={true} title="Teste" actions={<button>Confirmar</button>}>Conteúdo</Modal>)
    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument()
  })

  it('renderiza com diferentes tamanhos', () => {
    const { rerender } = render(<Modal open={true} title="Teste" size="sm">C</Modal>)
    expect(screen.getByText('Teste')).toBeInTheDocument()

    rerender(<Modal open={true} title="Teste" size="lg">C</Modal>)
    expect(screen.getByText('Teste')).toBeInTheDocument()

    rerender(<Modal open={true} title="Teste" size="xl">C</Modal>)
    expect(screen.getByText('Teste')).toBeInTheDocument()
  })
})
