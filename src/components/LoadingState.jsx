export default function LoadingState({ message = 'Carregando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-10 h-10 border-4 border-brand/30 border-t-brand rounded-full animate-spin mb-4" />
      <p className="text-sm text-text-muted">{message}</p>
    </div>
  )
}
