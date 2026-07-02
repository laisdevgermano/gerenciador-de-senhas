// ============================================================
// Button — botão reutilizável com variantes e loading
// ============================================================
// Props principais:
//   variant  → primary (padrão) | secondary | ghost | danger | outline
//   size     → sm | md (padrão) | lg
//   loading  → true exibe spinner e desabilita o clique
//   icon     → componente lucide-react (ex: icon={Plus})
//   children → texto do botão
// ============================================================

import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

const variants = {
  primary:
    'bg-brand text-white hover:bg-brand-hover focus:ring-2 focus:ring-brand/40',
  secondary:
    'bg-white text-text-primary border border-border hover:bg-surface-tertiary hover:border-border-hover focus:ring-2 focus:ring-border',
  ghost:
    'bg-transparent text-text-secondary hover:bg-surface-tertiary hover:text-text-primary',
  danger:
    'bg-danger text-white hover:bg-danger-hover focus:ring-2 focus:ring-danger/40',
  outline:
    'bg-transparent text-brand border border-brand hover:bg-brand-light focus:ring-2 focus:ring-brand/40',
}

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
}

/* FUTURE: em produção, este componente pode usar um design system
 * como Radix UI ou Headless UI para garantir acessibilidade total. */
const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon: Icon,
    children,
    className = '',
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : Icon && <Icon size={16} />}
      {children}
    </button>
  )
})

export default Button
