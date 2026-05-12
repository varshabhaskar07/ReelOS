import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Radio,
  Sparkles,
  Library,
  BarChart3,
  Zap,
} from 'lucide-react'
import useAppStore from '@/store/useAppStore'
import clsx from 'clsx'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/channels', label: 'Channels', icon: Radio },
  { to: '/generate', label: 'Generate', icon: Sparkles, accent: true },
  { to: '/library', label: 'Library', icon: Library },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function Sidebar() {
  const channels = useAppStore((s) => s.channels)

  return (
    <aside className="w-56 shrink-0 flex flex-col h-screen bg-zinc-950 border-r border-zinc-800 sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-zinc-800">
        <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
          <Zap size={14} className="text-white" />
        </div>
        <div>
          <span className="font-semibold text-zinc-100 text-sm tracking-tight">ReelOS</span>
          <p className="text-zinc-600 text-[10px] leading-none mt-0.5">AI Content OS</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="section-title px-2 mb-3">Workspace</p>
        {NAV.map(({ to, label, icon: Icon, accent }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group',
                isActive
                  ? accent
                    ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                    : 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={16}
                  className={clsx(
                    isActive && accent ? 'text-violet-400' : isActive ? 'text-zinc-100' : 'text-zinc-600 group-hover:text-zinc-400'
                  )}
                />
                {label}
                {accent && (
                  <span className="ml-auto text-[9px] font-semibold px-1.5 py-0.5 rounded bg-violet-600/30 text-violet-400 uppercase tracking-wider">
                    AI
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Channels quick list */}
        {channels.length > 0 && (
          <>
            <p className="section-title px-2 pt-5 pb-2">Active Channels</p>
            {channels.slice(0, 6).map((ch) => (
              <div
                key={ch.id}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 cursor-default transition-colors"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: ch.avatar_color || '#6b7280' }}
                />
                <span className="truncate">{ch.name}</span>
              </div>
            ))}
            {channels.length > 6 && (
              <p className="text-[10px] text-zinc-700 px-3 pt-1">
                +{channels.length - 6} more channels
              </p>
            )}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-violet-900 flex items-center justify-center">
            <span className="text-[9px] font-bold text-violet-300">OP</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-zinc-300 truncate">Operator</p>
            <p className="text-[10px] text-zinc-600 truncate">{channels.length} channels active</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
