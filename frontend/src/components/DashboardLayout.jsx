import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Search, BarChart3, Clock, Settings,
  Shield, Key, LogOut, Moon, Sun, Menu, X, ChevronRight,
  Zap, Users, Bell
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/analyze', icon: Search, label: 'Analyzer' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/history', icon: Clock, label: 'History' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

const adminItems = [
  { path: '/admin', icon: Shield, label: 'Admin Panel' },
]

export default function DashboardLayout({ children }) {
  const { user, logout, isAdmin } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
               style={{ background: 'linear-gradient(135deg, #7c3aed, #00b4d8)' }}>
            <svg width="20" height="20" viewBox="0 0 36 36" fill="none">
              <path d="M18 3L3 12V24L18 33L33 24V12L18 3Z" stroke="white" strokeWidth="2.5" fill="none"/>
              <circle cx="18" cy="18" r="5" fill="white"/>
            </svg>
          </div>
          <div>
            <p className="font-bold text-white text-sm">TruthLens AI</p>
            <p className="text-xs" style={{ color: '#00f5ff' }}>v1.0.0</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 px-4 mb-3">Menu</p>
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} />
            <span>{label}</span>
            {path === '/analyze' && (
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-medium">New</span>
            )}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 px-4 mt-6 mb-3">Admin</p>
            {adminItems.map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-white/5">
        {/* Plan Badge */}
        <div className="mb-3 px-3 py-2 rounded-xl flex items-center gap-2"
             style={{ background: 'rgba(0, 245, 255, 0.05)', border: '1px solid rgba(0, 245, 255, 0.1)' }}>
          <Zap size={14} className="text-neon-cyan" />
          <span className="text-xs text-slate-400">Plan: </span>
          <span className="text-xs font-semibold capitalize text-neon-cyan">{user?.plan}</span>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
             onClick={() => navigate('/settings')}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
               style={{ background: 'linear-gradient(135deg, #7c3aed, #00b4d8)' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
          <ChevronRight size={14} className="text-slate-600" />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={toggleTheme}
            className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all text-xs"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-xs"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-[#080812] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 border-r border-white/5"
             style={{ background: 'rgba(10, 10, 20, 0.8)', backdropFilter: 'blur(20px)' }}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 bottom-0 w-72 z-50 lg:hidden flex flex-col"
              style={{ background: 'rgba(10, 10, 20, 0.98)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,0.05)' }}
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X size={20} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0"
                style={{ background: 'rgba(8, 8, 18, 0.9)', backdropFilter: 'blur(10px)' }}>
          <button
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          {/* Search hint on desktop */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-slate-500"
               style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Search size={14} />
            <span>Analyze news content...</span>
            <kbd className="ml-4 text-xs px-2 py-0.5 rounded bg-white/5 text-slate-600">⌘K</kbd>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-neon-cyan" />
            </button>

            {/* Docs link */}
            <NavLink to="/docs"
              className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 hover:text-neon-cyan transition-colors px-3 py-2 rounded-lg hover:bg-white/5">
              <Key size={14} />
              <span>API Docs</span>
            </NavLink>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white cursor-pointer"
                 style={{ background: 'linear-gradient(135deg, #7c3aed, #00b4d8)' }}
                 onClick={() => navigate('/settings')}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
