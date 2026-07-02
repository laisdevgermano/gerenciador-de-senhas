// ============================================================
// Table — tabela genérica com suporte a drag-and-drop
// ============================================================
// Props:
//   columns    → [{ key, label, render?, sortable?, width? }]
//   data       → array de objetos
//   onRowClick → callback ao clicar numa linha
//   selectedId → linha destacada
//   onReorder  → se fornecido, ativa GripVertical + drag-and-drop
//                callback recebe orderedIds
//
// O GripVertical só aparece no hover da linha
// (opacity-0 group-hover:opacity-100).
// ============================================================

import { useState, useRef } from 'react'
import { ChevronsUpDown, GripVertical } from 'lucide-react'

export default function Table({
  columns,
  data,
  onRowClick,
  selectedId,
  loading = false,
  emptyMessage = 'Nenhum registro encontrado.',
  className = '',
  onReorder,
}) {
  const [dragIndex, setDragIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)
  const dragNode = useRef(null)

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

  const handleDragStart = (e, index) => {
    dragNode.current = index
    setDragIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', data[index].id)
    setTimeout(() => {
      e.target.closest('tr')?.classList.add('opacity-50')
    }, 0)
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragNode.current !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    e.target.closest('tr')?.classList.remove('opacity-50')
    if (dragNode.current === null || dragNode.current === dropIndex) {
      setDragIndex(null)
      setDragOverIndex(null)
      dragNode.current = null
      return
    }

    const newData = [...data]
    const draggedItem = newData[dragNode.current]
    newData.splice(dragNode.current, 1)
    newData.splice(dropIndex, 0, draggedItem)

    setDragIndex(null)
    setDragOverIndex(null)
    dragNode.current = null

    onReorder?.(newData.map((item) => item.id))
  }

  const handleDragEnd = (e) => {
    e.target.closest('tr')?.classList.remove('opacity-50')
    setDragIndex(null)
    setDragOverIndex(null)
    dragNode.current = null
  }

  return (
    <div className={`overflow-auto ${className}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            {onReorder && <th className="w-8 px-2 py-3" />}
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
          {data.map((row, idx) => {
            const isDragOver = dragOverIndex === idx && dragIndex !== idx
            return (
              <tr
                key={row.id || idx}
                onClick={() => onRowClick?.(row)}
                draggable={!!onReorder}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
                className={`border-b border-border/50 transition-colors cursor-pointer group ${
                  selectedId === row.id
                    ? 'bg-brand-light'
                    : 'hover:bg-surface-tertiary'
                } ${isDragOver ? 'border-t-2 border-t-brand' : ''}`}
              >
                {onReorder && (
                  <td className="px-2 py-3 text-text-muted cursor-grab active:cursor-grabbing">
                    <GripVertical size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm text-text-primary">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}