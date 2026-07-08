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

import { useState, useRef, useEffect } from 'react'
import { Filter, GripVertical } from 'lucide-react'

export default function Table({
  columns,
  data,
  onRowClick,
  selectedId,
  loading = false,
  emptyMessage = 'Nenhum registro encontrado.',
  className = '',
  onReorder,
  activeColumnFilter = null,
  columnSort = { key: null, order: 'asc' },
  onColumnFilterToggle,
  onColumnSort,
}) {
  const filterRef = useRef(null)
  const toggleRef = useRef(onColumnFilterToggle)
  toggleRef.current = onColumnFilterToggle
  const activeRef = useRef(activeColumnFilter)
  activeRef.current = activeColumnFilter

  useEffect(() => {
    if (!activeColumnFilter) return
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        toggleRef.current?.(activeRef.current)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [activeColumnFilter])

  const handleSortClick = (key, order) => {
    onColumnSort?.(key, order)
    onColumnFilterToggle?.(key)
  }
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
            {columns.map((col) => {
              const isActive = activeColumnFilter === col.key
              const isSorted = columnSort.key === col.key
              return (
                <th
                  key={col.key}
                  className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-4 py-3 relative"
                  style={col.width ? { width: col.width } : undefined}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="truncate">{col.label}</span>
                    {col.filterable && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onColumnFilterToggle?.(col.key) }}
                        className={`p-0.5 rounded transition-colors cursor-pointer shrink-0 ${
                          isActive || isSorted
                            ? 'text-brand'
                            : 'text-text-muted hover:text-text-primary'
                        }`}
                      >
                        <Filter size={12} />
                      </button>
                    )}
                  </div>
                  {isActive && col.filterable && (
                    <div
                      ref={filterRef}
                      className="absolute top-full left-0 mt-1 w-48 z-50 bg-surface rounded-lg border border-border shadow-xl p-2 space-y-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleSortClick(col.key, 'asc')}
                          className={`flex-1 h-6 rounded text-xs font-medium transition-colors cursor-pointer ${
                            isSorted && columnSort.order === 'asc'
                              ? 'bg-brand text-white'
                              : 'bg-surface-tertiary text-text-secondary hover:bg-surface-active'
                          }`}
                        >
                          A-Z
                        </button>
                        <button
                          onClick={() => handleSortClick(col.key, 'desc')}
                          className={`flex-1 h-6 rounded text-xs font-medium transition-colors cursor-pointer ${
                            isSorted && columnSort.order === 'desc'
                              ? 'bg-brand text-white'
                              : 'bg-surface-tertiary text-text-secondary hover:bg-surface-active'
                          }`}
                        >
                          Z-A
                        </button>
                      </div>
                    </div>
                  )}
                </th>
              )
            })}
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