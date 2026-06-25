import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Input from './Input'
import { describe, it, expect, vi } from 'vitest'

describe('Input', () => {
  it('renderiza com label', () => {
    render(<Input label="Email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('renderiza erro', () => {
    render(<Input label="Email" error="Campo obrigatório" />)
    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument()
  })

  it('renderiza hint quando não há erro', () => {
    render(<Input label="Email" hint="Digite seu email" />)
    expect(screen.getByText('Digite seu email')).toBeInTheDocument()
  })

  it('não renderiza hint quando há erro', () => {
    render(<Input label="Email" hint="Digite seu email" error="Campo obrigatório" />)
    expect(screen.queryByText('Digite seu email')).not.toBeInTheDocument()
    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument()
  })

  it('renderiza sem label', () => {
    render(<Input placeholder="Digite algo" />)
    expect(screen.getByPlaceholderText('Digite algo')).toBeInTheDocument()
  })

  it('renderiza com id personalizado', () => {
    render(<Input label="Email" id="meu-email" />)
    expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'meu-email')
  })

  it('forward ref funciona', () => {
    const ref = { current: null }
    render(<Input ref={ref} label="Nome" />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('aceita digitação do usuário', async () => {
    const user = userEvent.setup()
    render(<Input label="Nome" />)
    const input = screen.getByLabelText('Nome')
    await user.type(input, 'João')
    expect(input).toHaveValue('João')
  })

  it('renderiza onChange', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<Input label="Nome" onChange={onChange} />)
    await user.type(screen.getByLabelText('Nome'), 'a')
    expect(onChange).toHaveBeenCalled()
  })
})
