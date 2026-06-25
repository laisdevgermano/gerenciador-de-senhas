import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Tooltip from './Tooltip'
import { describe, it, expect } from 'vitest'

describe('Tooltip', () => {
  it('renderiza children', () => {
    render(<Tooltip content="Dica"><button>OK</button></Tooltip>)
    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument()
  })

  it('mostra tooltip no hover', async () => {
    const user = userEvent.setup()
    render(<Tooltip content="Dica útil"><button>OK</button></Tooltip>)
    const btn = screen.getByRole('button')
    await user.hover(btn)
    expect(screen.getByText('Dica útil')).toBeInTheDocument()
    await user.unhover(btn)
    expect(screen.queryByText('Dica útil')).not.toBeInTheDocument()
  })

  it('não renderiza tooltip quando content é vazio', () => {
    render(<Tooltip><button>OK</button></Tooltip>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('não renderiza tooltip quando content é null/undefined', () => {
    render(<Tooltip content={null}><button>OK</button></Tooltip>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('renderiza tooltip nas posições corretas', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<Tooltip content="Topo" position="top"><button>OK</button></Tooltip>)
    await user.hover(screen.getByRole('button'))
    expect(screen.getByText('Topo')).toBeInTheDocument()

    rerender(<Tooltip content="Baixo" position="bottom"><button>OK</button></Tooltip>)
    expect(screen.getByText('Baixo')).toBeInTheDocument()

    rerender(<Tooltip content="Esquerda" position="left"><button>OK</button></Tooltip>)
    expect(screen.getByText('Esquerda')).toBeInTheDocument()

    rerender(<Tooltip content="Direita" position="right"><button>OK</button></Tooltip>)
    expect(screen.getByText('Direita')).toBeInTheDocument()
  })
})
