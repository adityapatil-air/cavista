'use client'

import { Menu, User, LogOut, Sparkles, Bell, Search, Command } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { ThemeToggle } from './ThemeToggle'
import ToggleSidebarButton from './ToggleSidebarButton'
import { useState } from 'react'

interface NavbarProps {
  onMenuClick: () => void
  onToggleCollapse: () => void
  isCollapsed: boolean
}

export const Navbar = ({ onMenuClick, onToggleCollapse, isCollapsed }: NavbarProps) => {
  const { user, logout } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <nav className="relative bg-white/80 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-40 backdrop-blur-xl shadow-lg">
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500" />
      <div className="flex items-center gap-3 md:gap-4">
        <ToggleSidebarButton onMenuClick={onMenuClick} onToggleCollapse={onToggleCollapse} isCollapsed={isCollapsed} />
      </div>

      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search... (Ctrl+K)"
            className="w-full pl-10 pr-12 py-2.5 bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all hover:bg-gray-50 dark:hover:bg-gray-700"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded-md text-xs text-gray-500 dark:text-gray-400">
            <Command size={12} />
            <span>K</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-3">
        <button className="md:hidden p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all hover:scale-110">
          <Search size={20} />
        </button>

        <button className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all hover:scale-110 group">
          <Bell size={20} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping" />
        </button>
        
        <ThemeToggle />
        
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full blur-sm opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative w-9 h-9 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
            </div>
            <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate text-gray-700 dark:text-gray-200">{user?.email}</span>
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border dark:border-gray-700 py-2 animate-scale-in overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-br from-primary-500 to-purple-600 opacity-10" />
              <div className="relative px-4 py-4 border-b dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Account</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{user?.email}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  logout()
                  setShowDropdown(false)
                }}
                className="w-full px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 text-red-600 dark:text-red-400 transition-all group"
              >
                <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
