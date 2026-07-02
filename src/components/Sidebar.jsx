// ============================================================
// Sidebar — navegação principal com drag-and-drop
// ============================================================
// Exibe:
//   - Itens fixos: "Todas as senhas", "Funcionários" (admin)
//   - Pastas (árvore expansível com drag-and-drop)
//   - Tags (reordenáveis via drag-and-drop)
//   - Funcionários (reordenáveis via drag-and-drop, admin)
//   - Configurações, Sair, avatar do usuário, toggle recolher
//
// Props de reordenação:
//   onReorderFolders(orderedIds) / onReorderTags / onReorderEmployees
//
// Drag isolado por seção (não arrasta pasta pra seção de tags).
// GripVertical só aparece no hover (opacity-0 group-hover:opacity-100).
// ============================================================

import { useState, useRef } from 'react'
import {
  Lock,
  FolderClosed,
  Tags,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  User,
  GripVertical,
} from 'lucide-react'
import Badge from './Badge'
import Avatar from './Avatar'

export default function Sidebar({
  folders = [],
  tags = [],
  employees = [],
  selectedFilter,
  onSelectFilter,
  onNewPassword,
  onLogout,
  collapsed = false,
  onToggle,
  currentUser,
  onReorderFolders,
  onReorderTags,
  onReorderEmployees,
}) {
  const [dragIndex, setDragIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)
  const [dragSection, setDragSection] = useState(null)
  const dragNode = useRef(null)

  const dragItemRef = useRef(null)

  const handleDragStart = (e, section, index) => {
    dragNode.current = index
    setDragIndex(index)
    setDragSection(section)
    dragItemRef.current = e.currentTarget.closest('.group')
    e.currentTarget.closest('.group')?.classList.add('opacity-50')
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', '')
  }

  const handleDragOver = (e, section, index) => {
    if (dragSection !== section) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragNode.current !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e, section, dropIndex) => {
    e.preventDefault()
    dragItemRef.current?.classList.remove('opacity-50')
    if (dragNode.current === null || dragNode.current === dropIndex || dragSection !== section) {
      setDragIndex(null)
      setDragOverIndex(null)
      dragNode.current = null
      setDragSection(null)
      return
    }

    let items
    switch (section) {
      case 'folders':
        items = [...rootFolders]
        break
      case 'tags':
        items = [...tags]
        break
      case 'employees':
        items = [...employees]
        break
      default:
        return
    }

    const dragged = items[dragNode.current]
    items.splice(dragNode.current, 1)
    items.splice(dropIndex, 0, dragged)

    setDragIndex(null)
    setDragOverIndex(null)
    dragNode.current = null
    setDragSection(null)

    const orderedIds = items.map((item) => item.id)
    switch (section) {
      case 'folders':
        onReorderFolders?.(orderedIds)
        break
      case 'tags':
        onReorderTags?.(orderedIds)
        break
      case 'employees':
        onReorderEmployees?.(orderedIds)
        break
    }
  }

  const handleDragEnd = (e) => {
    dragItemRef.current?.classList.remove('opacity-50')
    setDragIndex(null)
    setDragOverIndex(null)
    dragNode.current = null
    setDragSection(null)
  }
  const [expandedFolders, setExpandedFolders] = useState(new Set())
  const [tagsExpanded, setTagsExpanded] = useState(true)
  const [foldersExpanded, setFoldersExpanded] = useState(true)
  const [employeesExpanded, setEmployeesExpanded] = useState(true)

  const isAdmin = currentUser?.role === 'admin'

  const mainItems = [
    { key: 'all', label: 'Todas as senhas', icon: Lock },
    ...(isAdmin
      ? [{ key: 'employees', label: 'Funcionários', icon: Users }]
      : []),
  ]

  const rootFolders = folders.filter((f) => !f.parentId)

  const getChildren = (parentId) => folders.filter((f) => f.parentId === parentId)

  const toggleExpand = (id) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const renderFolder = (folder, depth = 0) => {
    const children = getChildren(folder.id)
    const isExpanded = expandedFolders.has(folder.id)
    const isActive = selectedFilter === `folder:${folder.id}`
    return (
      <div key={folder.id}>
        <div className="flex items-center gap-0">
          {depth > 0 && (
            <div className="w-[18px] shrink-0" />
          )}
          {children.length > 0 && !collapsed && (
            <button
              onClick={() => toggleExpand(folder.id)}
              className="p-0.5 text-text-muted hover:text-text-primary cursor-pointer shrink-0"
            >
              {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>
          )}
          {children.length === 0 && !collapsed && <div className="w-4 shrink-0" />}
          <button
            onClick={() => onSelectFilter?.(`folder:${folder.id}`)}
            className={`flex items-center gap-3 h-9 px-3 rounded-lg text-sm transition-colors cursor-pointer w-full ${
              isActive
                ? 'bg-surface-active font-medium'
                : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary'
            }`}
            title={collapsed ? folder.name : undefined}
            style={{ paddingLeft: collapsed ? undefined : `${12 + depth * 16}px` }}
          >
            <FolderClosed size={18} className="shrink-0" style={{ color: folder.color || undefined }} />
            {!collapsed && <span className="truncate">{folder.name}</span>}
          </button>
        </div>
        {isExpanded && children.length > 0 && (
          <div>
            {children.map((child) => renderFolder(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside
      className={`h-full bg-surface border-r border-border flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-between px-4 h-14 border-b border-border shrink-0">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
                <Lock size={14} className="text-white" />
              </div>
              <span className="font-bold text-text-primary text-sm">G-Pass</span>
            </div>
          )}
          {collapsed && (
            <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center mx-auto">
              <Lock size={14} className="text-white" />
            </div>
          )}
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        <p className="px-3 text-xs font-semibold text-text-muted uppercase tracking-wider mb-1 mt-2">
          {collapsed ? '' : 'Principal'}
        </p>
        {mainItems.map((item) => {
          const isActive = selectedFilter === item.key
          return (
            <button
              key={item.key}
              onClick={() => onSelectFilter?.(item.key)}
              className={`w-full flex items-center gap-3 h-9 px-3 rounded-lg text-sm transition-colors cursor-pointer ${
                isActive
                  ? 'bg-surface-active font-medium'
                  : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} className={`shrink-0 ${isActive ? 'text-brand' : ''}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          )
        })}

        {isAdmin && employees.length > 0 && !collapsed && (
          <>
            <div className="flex items-center gap-0 mt-4">
              <button
                onClick={() => setEmployeesExpanded((prev) => !prev)}
                className="p-1 text-text-muted hover:text-text-primary cursor-pointer shrink-0"
              >
                {employeesExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
              <button
                onClick={() => onSelectFilter?.('employees')}
                className={`flex items-center gap-3 h-9 px-3 rounded-lg text-sm transition-colors cursor-pointer w-full ${
                  selectedFilter === 'employees'
                    ? 'bg-surface-active font-medium'
                    : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary'
                }`}
              >
                <Users size={18} className={`shrink-0 ${selectedFilter === 'employees' ? 'text-brand' : ''}`} />
                <span className="truncate font-semibold text-xs uppercase tracking-wider text-text-muted">
                  Funcionários ({employees.length})
                </span>
              </button>
            </div>
            {employeesExpanded && employees.map((emp, idx) => {
              const isActive = selectedFilter === `employee:${emp.id}`
              const isDragOver = dragOverIndex === idx && dragIndex !== idx && dragSection === 'employees'
              return (
                <div
                  key={emp.id}
                  onDragOver={(e) => handleDragOver(e, 'employees', idx)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'employees', idx)}
                  onDragEnd={handleDragEnd}
                  className={`group ${isDragOver ? 'border-t-2 border-t-brand' : ''}`}
                >
                  <div className="flex items-center gap-0">
                    <span
                      draggable
                      onDragStart={(e) => handleDragStart(e, 'employees', idx)}
                      onDragEnd={handleDragEnd}
                      className="px-1 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing shrink-0"
                    >
                      <GripVertical size={12} />
                    </span>
                    <button
                      onClick={() => onSelectFilter?.(`employee:${emp.id}`)}
                      className={`flex items-center gap-3 h-8 px-3 rounded-lg text-sm transition-colors cursor-pointer w-full ${
                        isActive
                          ? 'bg-surface-active font-medium'
                          : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary'
                      }`}
                      title={emp.name}
                      style={{ paddingLeft: '36px' }}
                    >
                      <User size={14} className={`shrink-0 ${isActive ? 'text-brand' : ''}`} />
                      <span className="truncate">{emp.name}</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </>
        )}

        {folders.length > 0 && (
          <>
            {collapsed ? (
              isAdmin && (
                <button
                  onClick={() => onSelectFilter?.('manage-folders')}
                  className={`w-full flex items-center justify-center h-9 rounded-lg transition-colors cursor-pointer ${
                    selectedFilter === 'manage-folders'
                      ? 'bg-surface-active'
                      : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary'
                  }`}
                  title="Pastas"
                >
                  <FolderClosed size={18} className="shrink-0" />
                </button>
              )
            ) : (
              <>
                {isAdmin ? (
                  <div className="flex items-center gap-0 mt-4">
                    <button
                      onClick={() => setFoldersExpanded((prev) => !prev)}
                      className="p-1 text-text-muted hover:text-text-primary cursor-pointer shrink-0"
                    >
                      {foldersExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </button>
                    <button
                      onClick={() => onSelectFilter?.('manage-folders')}
                      className={`flex items-center gap-3 h-9 px-3 rounded-lg text-sm transition-colors cursor-pointer w-full ${
                        selectedFilter === 'manage-folders'
                          ? 'bg-surface-active font-medium'
                          : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary'
                      }`}
                    >
                      <FolderClosed size={18} className={`shrink-0 ${selectedFilter === 'manage-folders' ? 'text-brand' : ''}`} />
                      {!collapsed && <span className="truncate font-semibold text-xs uppercase tracking-wider text-text-muted">Pastas</span>}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-0 mt-4">
                    <button
                      onClick={() => setFoldersExpanded((prev) => !prev)}
                      className="p-1 text-text-muted hover:text-text-primary cursor-pointer shrink-0"
                    >
                      {foldersExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </button>
                    <p className="px-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Pastas
                    </p>
                  </div>
                )}
                {foldersExpanded && rootFolders.map((folder, idx) => {
                  const isDragOver = dragOverIndex === idx && dragIndex !== idx && dragSection === 'folders'
                  return (
                    <div
                      key={folder.id}
                      onDragOver={(e) => handleDragOver(e, 'folders', idx)}
                      onDragEnd={handleDragEnd}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, 'folders', idx)}
                      className={`group ${isDragOver ? 'border-t-2 border-t-brand' : ''}`}
                    >
                      <div className="flex items-center gap-0">
                        <span
                          draggable
                          onDragStart={(e) => handleDragStart(e, 'folders', idx)}
                          onDragEnd={handleDragEnd}
                          className="px-1 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing shrink-0"
                        >
                          <GripVertical size={12} />
                        </span>
                        {renderFolder(folder)}
                      </div>
                    </div>
                  )
                })}
              </>
            )}
          </>
        )}

        {tags.length > 0 && (
          <>
            {collapsed ? (
              isAdmin && (
                <button
                  onClick={() => onSelectFilter?.('manage-tags')}
                  className={`w-full flex items-center justify-center h-9 rounded-lg transition-colors cursor-pointer ${
                    selectedFilter === 'manage-tags'
                      ? 'bg-surface-active'
                      : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary'
                  }`}
                  title="Tags"
                >
                  <Tags size={18} className="shrink-0" />
                </button>
              )
            ) : (
              <>
                {isAdmin ? (
                  <div className="flex items-center gap-0 mt-4">
                    <button
                      onClick={() => setTagsExpanded((prev) => !prev)}
                      className="p-1 text-text-muted hover:text-text-primary cursor-pointer shrink-0"
                    >
                      {tagsExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </button>
                    <button
                      onClick={() => onSelectFilter?.('manage-tags')}
                      className={`flex items-center gap-3 h-9 px-3 rounded-lg text-sm transition-colors cursor-pointer w-full ${
                        selectedFilter === 'manage-tags'
                          ? 'bg-surface-active font-medium'
                          : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary'
                      }`}
                    >
                      <Tags size={18} className={`shrink-0 ${selectedFilter === 'manage-tags' ? 'text-brand' : ''}`} />
                      {!collapsed && <span className="truncate font-semibold text-xs uppercase tracking-wider text-text-muted">Tags</span>}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-0 mt-4">
                    <button
                      onClick={() => setTagsExpanded((prev) => !prev)}
                      className="p-1 text-text-muted hover:text-text-primary cursor-pointer shrink-0"
                    >
                      {tagsExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </button>
                    <p className="px-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Tags
                    </p>
                  </div>
                )}
                {tagsExpanded && tags.map((tag, idx) => {
                  const isActive = selectedFilter === `tag:${tag.id}`
                  const isDragOver = dragOverIndex === idx && dragIndex !== idx && dragSection === 'tags'
                  return (
                    <div
                      key={tag.id}
                      onDragOver={(e) => handleDragOver(e, 'tags', idx)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, 'tags', idx)}
                      onDragEnd={handleDragEnd}
                      className={`group ${isDragOver ? 'border-t-2 border-t-brand' : ''}`}
                    >
                      <div className="flex items-center gap-0">
                        <span
                          draggable
                          onDragStart={(e) => handleDragStart(e, 'tags', idx)}
                          onDragEnd={handleDragEnd}
                          className="px-1 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing shrink-0"
                        >
                          <GripVertical size={12} />
                        </span>
                        <button
                          onClick={() => onSelectFilter?.(`tag:${tag.id}`)}
                          className={`flex items-center gap-3 h-9 px-3 rounded-lg text-sm transition-colors cursor-pointer w-full ${
                            isActive
                              ? 'bg-surface-active font-medium'
                              : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary'
                          }`}
                          title={collapsed ? tag.name : undefined}
                        >
                          <Tags size={18} className="shrink-0" style={{ color: tag.color || undefined }} />
                          {!collapsed && <span className="truncate">{tag.name}</span>}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </>
            )}
          </>
        )}
      </nav>

      <div className="border-t border-border p-2 space-y-1 shrink-0">
        <button
          onClick={() => onSelectFilter?.('settings')}
          className={`w-full flex items-center gap-3 h-9 px-3 rounded-lg text-sm transition-colors cursor-pointer ${
            selectedFilter === 'settings'
              ? 'bg-surface-active font-medium'
              : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary'
          }`}
          title={collapsed ? 'Configurações' : undefined}
        >
          <Settings size={18} className={`shrink-0 ${selectedFilter === 'settings' ? 'text-brand' : ''}`} />
          {!collapsed && <span>Configurações</span>}
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 h-9 px-3 rounded-lg text-sm text-text-secondary hover:bg-surface-tertiary hover:text-danger transition-colors cursor-pointer"
          title={collapsed ? 'Sair' : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>

        {currentUser && (
          <div className={`flex items-center gap-3 px-3 py-2.5 border-t border-border mt-1 pt-3 ${collapsed ? 'justify-center' : ''}`}>
            <Avatar name={currentUser.name} email={currentUser.email} size="sm" />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary truncate">{currentUser.name}</p>
                <p className="text-xs text-text-muted truncate">{currentUser.email}</p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center h-9 px-3 rounded-lg text-text-muted hover:bg-surface-tertiary transition-colors cursor-pointer"
          title={collapsed ? 'Expandir' : 'Recolher'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} className="rotate-90" />}
        </button>
      </div>
    </aside>
  )
}