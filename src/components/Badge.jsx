/* FUTURE: pode ser estendido com variantes de tamanho, ícone, etc. */
export default function Badge({
  children,
  color,
  variant = 'default',
  className = '',
}) {
  const variants = {
    default: 'bg-surface-tertiary text-text-secondary border-transparent',
    brand: 'bg-brand-light text-brand border-brand/20',
    success: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    danger: 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  }

  const style = color ? { backgroundColor: `${color}18`, color, borderColor: `${color}40` } : undefined

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${variants[variant]} ${className}`}
      style={style}
    >
      {children}
    </span>
  )
}
