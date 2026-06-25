import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Dropdown from './Dropdown'
import { describe, it, expect, vi } from 'vitest'

const items = [
  { label: 'Editar', onClick: vi.fn() },
  { label: 'Excluir', onClick: vi.fn(), danger: true },
  { separator: true },
  { label: 'Duplicar', onClick: vi.fn() },
]

describe('Dropdown', () => {
  it('renderiza trigger', () => {
    render(<Dropdown trigger={<span>Menu</span>} items={items} />)
    expect(screen.getByText('Menu')).toBeInTheDocument()
  })

  it('abre e fecha ao clicar no trigger', async () => {
    const user = userEvent.setup()
    render(<Dropdown trigger={<span>Menu</span>} items={items} />)
    const trigger = screen.getByText('Menu')
    await user.click(trigger)
    expect(screen.getByText('Editar')).toBeInTheDocument()
    await user.click(trigger)
    expect(screen.queryByText('Editar')).not.toBeInTheDocument()
  })

  it('mostra itens do menu quando aberto', async () => {
    const user = userEvent.setup()
    render(<Dropdown trigger={<span>Menu</span>} items={items} />)
    await user.click(screen.getByText('Menu'))
    expect(screen.getByText('Editar')).toBeInTheDocument()
    expect(screen.getByText('Excluir')).toBeInTheDocument()
    expect(screen.getByText('Duplicar')).toBeInTheDocument()
  })

  it('fecha ao clicar em um item', async () => {
    const user = userEvent.setup()
    render(<Dropdown trigger={<span>Menu</span>} items={items} />)
    await user.click(screen.getByText('Menu'))
    await user.click(screen.getByText('Editar'))
    expect(screen.queryByText('Editar')).not.toBeInTheDocument()
  })

  it('chama onClick do item ao clicar', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(<Dropdown trigger={<span>Menu</span>} items={[{ label: 'Teste', onClick }]} />)
    await user.click(screen.getByText('Menu'))
    await user.click(screen.getByText('Teste'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('fecha ao clicar fora', async () => {
    const user = userEvent.setup()
    render(<Dropdown trigger={<span>Menu</span>} items={items} />)
    await user.click(screen.getByText('Menu'))
    expect(screen.getByText('Editar')).toBeInTheDocument()
    await user.click(document.body)
    expect(screen.queryByText('Editar')).not.toBeInTheDocument()
  })
})
