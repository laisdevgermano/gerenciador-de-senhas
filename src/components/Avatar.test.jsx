import { render, screen } from '@testing-library/react'
import Avatar from './Avatar'
import { describe, it, expect } from 'vitest'

describe('Avatar', () => {
  it('renderiza iniciais do nome', () => {
    render(<Avatar name="João Silva" />)
    expect(screen.getByText('JS')).toBeInTheDocument()
  })

  it('renderiza iniciais do email quando não tem nome', () => {
    render(<Avatar email="joao@germano.com" />)
    expect(screen.getByText('JO')).toBeInTheDocument()
  })

  it('renderiza ?? quando não tem nome nem email', () => {
    render(<Avatar />)
    expect(screen.getByText('??')).toBeInTheDocument()
  })

  it('usa tamanhos diferentes', () => {
    const { rerender } = render(<Avatar name="João Silva" size="sm" />)
    expect(screen.getByText('JS')).toBeInTheDocument()

    rerender(<Avatar name="João Silva" size="lg" />)
    expect(screen.getByText('JS')).toBeInTheDocument()

    rerender(<Avatar name="João Silva" size="xl" />)
    expect(screen.getByText('JS')).toBeInTheDocument()
  })

  it('tem title com nome', () => {
    render(<Avatar name="João Silva" />)
    expect(screen.getByTitle('João Silva')).toBeInTheDocument()
  })

  it('tem title com email quando não tem nome', () => {
    render(<Avatar email="joao@germano.com" />)
    expect(screen.getByTitle('joao@germano.com')).toBeInTheDocument()
  })

  it('renderiza com className personalizada', () => {
    render(<Avatar name="João Silva" className="custom-class" />)
    expect(screen.getByText('JS').className).toContain('custom-class')
  })
})
