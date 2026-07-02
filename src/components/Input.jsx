// ============================================================
// Input — campo de formulário com label, erro, hint e ícone
// ============================================================
// Props:
//   label → texto exibido acima do campo
//   error → mensagem de erro (vermelho)
//   hint  → dica auxiliar (ex: "Mínimo 8 caracteres")
//   icon  → ícone lucide posicionado à esquerda
// ============================================================

import { forwardRef } from 'react'

/* FUTURE: integrar com React Hook Form ou Formik para validação.
 *   <Controller name="email" control={control} render={({ field }) => <Input {...field} />} /> */
const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    icon: Icon,
    type = 'text',
    className = '',
    id,
    ...props
  },
  ref
) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-text-primary"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            <Icon size={16} />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`h-10 w-full rounded-lg border bg-surface px-3 text-sm text-text-primary placeholder:text-text-muted transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand ${
            error ? 'border-danger focus:ring-danger/20 focus:border-danger' : 'border-border'
          } ${Icon ? 'pl-10' : ''}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  )
})

export default Input
