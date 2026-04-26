import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

// ── SVG Icons ──────────────────────────────────────────────────────────────────

function IconBarChart({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}

function IconFlask({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6" />
      <path d="M10 3v6l-4.5 9A1 1 0 0 0 6.5 20h11a1 1 0 0 0 .89-1.45L14 9V3" />
    </svg>
  )
}

function IconBell({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function IconTrendingUp({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )
}

function IconLeaf({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  )
}

function IconSettings({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function IconLogOut({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function IconMenu({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function IconX({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

// ── Nav config ─────────────────────────────────────────────────────────────────

const navItems = [
  { to: '/dashboard',      icon: <IconBarChart   className="w-5 h-5" />, label: 'Painel'           },
  { to: '/tanks',          icon: <IconFlask      className="w-5 h-5" />, label: 'Tanques'          },
  { to: '/alerts',         icon: <IconBell       className="w-5 h-5" />, label: 'Alertas'          },
  { to: '/reports',        icon: <IconTrendingUp className="w-5 h-5" />, label: 'Relatórios'       },
  { to: '/sustainability', icon: <IconLeaf       className="w-5 h-5" />, label: 'Sustentabilidade' },
]

const bottomNavItems = [
  { to: '/settings', icon: <IconSettings className="w-5 h-5" />, label: 'Configurações' },
]

// ── Sidebar content (reutilizado no desktop e no drawer mobile) ────────────────

function SidebarContent({ onNavigate, onLogout, user }: {
  onNavigate?: () => void
  onLogout: () => void
  user: { name?: string; email?: string; organization?: string } | null
}) {
  return (
    <div className="flex flex-col h-full p-4 gap-1">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 py-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/25 flex items-center justify-center flex-shrink-0">
          <img src="/logo-biodash.png" alt="BioDash logo" className="w-5 h-5 object-contain" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-white leading-tight">BioDash</h1>
          <p className="text-[10px] text-gray-600 leading-tight">Monitoramento biológico</p>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex flex-col gap-1">
        <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest px-2 mb-1">Menu</p>
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-3 sm:py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-teal-600/20 text-teal-300 border border-teal-500/20'
                  : 'text-gray-400 hover:bg-gray-800 active:bg-gray-800 hover:text-white'
              }`
            }
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Nav */}
      <nav className="flex flex-col gap-1 mt-4">
        <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest px-2 mb-1">Sistema</p>
        {bottomNavItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-3 sm:py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-teal-600/20 text-teal-300 border border-teal-500/20'
                  : 'text-gray-400 hover:bg-gray-800 active:bg-gray-800 hover:text-white'
              }`
            }
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="mt-auto flex flex-col gap-2">
        {user && (
          <div className="px-3 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-teal-600/30 border border-teal-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-teal-300">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-medium text-gray-200 truncate">{user.name}</p>
                <p className="text-[10px] text-gray-600 truncate">{user.organization || user.email}</p>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-3 sm:py-2.5 rounded-xl text-sm text-gray-500 hover:bg-red-500/10 active:bg-red-500/10 hover:text-red-400 border border-transparent transition-all duration-150"
        >
          <IconLogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </div>
  )
}

// ── Layout ─────────────────────────────────────────────────────────────────────

export default function Layout() {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)

  function handleLogout() {
    clearAuth()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden">

      {/* ── Sidebar desktop (oculta no mobile) ── */}
      <aside className="hidden sm:flex w-60 bg-gray-900 border-r border-gray-800/80 flex-col flex-shrink-0">
        <SidebarContent user={user} onLogout={handleLogout} />
      </aside>

      {/* ── Drawer mobile ── */}
      {drawerOpen && (
        <div className="sm:hidden fixed inset-0 z-40 flex">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Painel */}
          <div className="relative w-72 max-w-[85vw] bg-gray-900 border-r border-gray-800/80 flex flex-col h-full animate-[slideRight_0.22s_ease]">
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-300 active:bg-gray-800 transition-all"
            >
              <IconX />
            </button>
            <SidebarContent
              user={user}
              onLogout={handleLogout}
              onNavigate={() => setDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      {/* ── Área principal ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar mobile */}
        <header className="sm:hidden flex items-center gap-3 px-4 py-3 bg-gray-900 border-b border-gray-800/80 flex-shrink-0">
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-white active:bg-gray-800 transition-all"
          >
            <IconMenu />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-teal-500/15 border border-teal-500/25 flex items-center justify-center">
              <img src="/logo-biodash.png" alt="" className="w-4 h-4 object-contain" />
            </div>
            <span className="text-sm font-semibold text-white">BioDash</span>
          </div>
        </header>

        {/* Conteúdo */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <style>{`
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-100%); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}