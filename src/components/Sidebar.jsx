import {
  Lock,
  FolderClosed,
  Tags,
  Users,
  Star,
  Share2,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Plus,
} from 'lucide-react'
import Badge from './Badge'

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
}) {
  const mainItems = [
    { key: 'all', label: 'Todas as senhas', icon: Lock },
    { key: 'favorites', label: 'Favoritos', icon: Star },
    { key: 'shared', label: 'Compartilhadas comigo', icon: Share2 },
  ]

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
        {!collapsed && (
          <button
            onClick={onNewPassword}
            className="w-full flex items-center gap-2 h-9 px-3 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand-hover transition-colors cursor-pointer mb-3"
          >
            <Plus size={16} />
            Nova senha
          </button>
        )}

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
            <p className="px-3 text-xs font-semibold text-text-muted uppercase tracking-wider mb-1 mt-4">
              {collapsed ? '' : 'Pastas'}
            </p>
            {folders.map((folder) => {
              const isActive = selectedFilter === `folder:${folder.id}`
              return (
                <button
                  key={folder.id}
                  onClick={() => onSelectFilter?.(`folder:${folder.id}`)}
                  className={`w-full flex items-center gap-3 h-9 px-3 rounded-lg text-sm transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-surface-active font-medium'
                      : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary'
                  }`}
                  title={collapsed ? folder.name : undefined}
                >
                  <FolderClosed size={18} className="shrink-0" style={{ color: folder.color || undefined }} />
                  {!collapsed && <span className="truncate">{folder.name}</span>}
                </button>
              )
            })}
          </>
        )}

        {tags.length > 0 && (
          <>
            <p className="px-3 text-xs font-semibold text-text-muted uppercase tracking-wider mb-1 mt-4">
              {collapsed ? '' : 'Tags'}
            </p>
            {tags.map((tag) => {
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
