import { useState } from 'react'
import {
  Lock,
  FolderClosed,
  Tags,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import Badge from './Badge'
import Avatar from './Avatar'

/* FUTURE: integrar com react-router-dom para navegação real.
 *   <NavLink to="/dashboard"> ... </NavLink> */
export default function Sidebar({
  folders = [],
  tags = [],
  selectedFilter,
  onSelectFilter,
  onNewPassword,
  onLogout,
  collapsed = false,
  onToggle,
  currentUser,
}) {
  const [expandedFolders, setExpandedFolders] = useState(new Set())
  const [tagsExpanded, setTagsExpanded] = useState(true)
  const [foldersExpanded, setFoldersExpanded] = useState(true)
  const mainItems = [
    { key: 'all', label: 'Todas as senhas', icon: Lock },
    ...(currentUser?.role === 'admin'
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

        {folders.length > 0 && (
          <>
            {collapsed ? (
              currentUser?.role === 'admin' && (
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
                {currentUser?.role === 'admin' ? (
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
                {foldersExpanded && rootFolders.map((folder) => renderFolder(folder))}
              </>
            )}
          </>
        )}

        {tags.length > 0 && (
          <>
            {collapsed ? (
              currentUser?.role === 'admin' && (
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
                {currentUser?.role === 'admin' ? (
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
                {tagsExpanded && tags.map((tag) => {
                  const isActive = selectedFilter === `tag:${tag.id}`
                  return (
                    <button
                      key={tag.id}
                      onClick={() => onSelectFilter?.(`tag:${tag.id}`)}
                      className={`w-full flex items-center gap-3 h-9 px-3 rounded-lg text-sm transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-surface-active font-medium'
                          : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary'
                      }`}
                      title={collapsed ? tag.name : undefined}
                    >
                      <Tags size={18} className="shrink-0" style={{ color: tag.color || undefined }} />
                      {!collapsed && <span className="truncate">{tag.name}</span>}
                    </button>
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
