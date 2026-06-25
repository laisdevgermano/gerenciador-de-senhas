import { render, screen } from '@testing-library/react'
import Badge from './Badge'
import { describe, it, expect } from 'vitest'

describe('Badge', () => {
  it('renderiza com texto', () => {
    render(<Badge>Admin</Badge>)
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('renderiza variantes', () => {
    const { rerender } = render(<Badge variant="brand">Brand</Badge>)
    expect(screen.getByText('Brand')).toBeInTheDocument()

    rerender(<Badge variant="success">Success</Badge>)
    expect(screen.getByText('Success')).toBeInTheDocument()

    rerender(<Badge variant="warning">Warning</Badge>)
    expect(screen.getByText('Warning')).toBeInTheDocument()

    rerender(<Badge variant="danger">Danger</Badge>)
    expect(screen.getByText('Danger')).toBeInTheDocument()

    rerender(<Badge variant="info">Info</Badge>)
    expect(screen.getByText('Info')).toBeInTheDocument()

    rerender(<Badge variant="default">Default</Badge>)
    expect(screen.getByText('Default')).toBeInTheDocument()
  })

  it('renderiza com cor personalizada', () => {
    render(<Badge color="#ff0000">Custom</Badge>)
    const badge = screen.getByText('Custom')
    expect(badge.style.backgroundColor).toBeTruthy()
  })

  it('renderiza com className personalizada', () => {
    render(<Badge className="custom-class">Tag</Badge>)
    expect(screen.getByText('Tag').className).toContain('custom-class')
  })
})
