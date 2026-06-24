/* FUTURE: em produção, carregar imagem real do usuário
 *   <img src={user.avatar} alt={user.name} className="..." /> */
export default function Avatar({ name, email, size = 'md', className = '' }) {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : email?.slice(0, 2).toUpperCase() || '??'

  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  }

  /* FUTURE: hash consistente para gerar cores por usuário */
  const colors = [
    'bg-teal-500',
    'bg-purple-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-emerald-500',
    'bg-cyan-500',
    'bg-fuchsia-500',
    'bg-orange-500',
  ]
  const colorIndex = name
    ? name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) %
      colors.length
    : 0

  return (
    <div
      className={`${sizes[size]} ${colors[colorIndex]} rounded-full flex items-center justify-center text-white font-semibold shrink-0 ${className}`}
      title={name || email}
    >
      {initials}
    </div>
  )
}
