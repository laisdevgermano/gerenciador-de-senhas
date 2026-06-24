import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'

/* FUTURE: substituir por @tanstack/react-table
 * para ordenação multi-coluna, filtros, paginação server-side. */
export default function Table({
  columns,
  data,
  onRowClick,
  selectedId,
  loading = false,
  emptyMessage = 'Nenhum registro encontrado.',
  className = '',
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-text-muted">
        <p className="text-sm">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={`overflow-auto ${className}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-4 py-3"
                style={col.width ? { width: col.width } : undefined}
              >
                <div className="flex items-center gap-1.5">
                  {col.label}
                  {col.sortable && <ChevronsUpDown size={14} className="text-text-muted" />}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={row.id || idx}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-border/50 transition-colors cursor-pointer ${
                selectedId === row.id
                  ? 'bg-brand-light'
                  : 'hover:bg-surface-tertiary'
              }`}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm text-text-primary">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
