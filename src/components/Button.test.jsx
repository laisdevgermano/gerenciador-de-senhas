import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from './Button'
import { describe, it, expect, vi } from 'vitest'

describe('Button', () => {
  it('renderiza com texto', () => {
    render(<Button>Salvar</Button>)
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument()
  })

  it('renderiza variantes', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()

    rerender(<Button variant="danger">Danger</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()

    rerender(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('renderiza loading e desabilita botão', () => {
    render(<Button loading>Salvar</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
  })

  it('renderiza disabled', () => {
    const onClick = vi.fn()
    render(<Button disabled onClick={onClick}>Salvar</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
  })

  it('chama onClick ao clicar', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(<Button onClick={onClick}>Salvar</Button>)
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('não chama onClick quando desabilitado', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(<Button disabled onClick={onClick}>Salvar</Button>)
    await user.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renderiza com className personalizada', () => {
    render(<Button className="custom-class">Salvar</Button>)
    expect(screen.getByRole('button').className).toContain('custom-class')
  })

  it('forward ref funciona', () => {
    const ref = { current: null }
    render(<Button ref={ref}>Salvar</Button>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })
})
