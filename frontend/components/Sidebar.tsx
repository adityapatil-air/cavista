'use client'

import { Home, Mic, Brain, FileText, Stethoscope, X, Settings, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  isCollapsed: boolean
  onHoverChange?: (hovered: boolean) => void
}

export const Sidebar = ({ isOpen, onClose, isCollapsed, onHoverChange }: SidebarProps) => {
  const pathname = usePathname()
  const [isHovered, setIsHovered] = useState(false)
  
  const isExpanded = !isCollapsed || isHovered

  const menuItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/voice-transcription', icon: Mic, label: 'Voice Transcription' },
    { path: '/ai-diagnosis', icon: Brain, label: 'AI Diagnosis' },
    { path: '/patient-records', icon: FileText, label: 'Patient Records' },
    { path: '/icd-lookup', icon: Stethoscope, label: 'ICD Lookup' },
  ]

  const bottomItems = [
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]

  const handleMouseEnter = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024 && isCollapsed) {
      setIsHovered(true)
      onHoverChange?.(true)
    }
  }

  const handleMouseLeave = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024 && isCollapsed) {
      setIsHovered(false)
      onHoverChange?.(false)
    }
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm animate-fade-in" onClick={onClose} />
      )}
      
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 border-r border-green-200 dark:border-gray-700 transform transition-all duration-300 shadow-2xl lg:shadow-none flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          isCollapsed && !isHovered ? 'lg:w-20' : 'w-72'
        } group`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex items-center justify-between p-6 border-b border-green-200 dark:border-gray-700">
          <div className={`flex items-center gap-3 group transition-all duration-300 ${!isExpanded ? 'justify-center' : ''}`}>
            <div className="relative">
              <div className="absolute inset-0 clinivo-gradient rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative w-10 h-10 clinivo-gradient rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
            </div>
            {isExpanded && (
              <div className="transition-all duration-300">
                <span className="text-xl font-bold clinivo-text-gradient">Clinivo</span>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span>Online</span>
                </div>
              </div>
            )}
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg transition-all">
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
          {isExpanded && <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-3">EMR Tools</p>}
          {menuItems.map((item, idx) => {
            const Icon = item.icon
            const isActive = pathname === item.path

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                  !isExpanded ? 'justify-center' : ''
                } ${
                  isActive
                    ? 'clinivo-gradient text-white font-semibold shadow-lg shadow-green-500/30'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-700/50'
                }`}
                title={!isExpanded ? item.label : ''}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-hover:opacity-20 transition-opacity" />
                )}
                <Icon size={22} className={`${isActive ? '' : 'group-hover:scale-110 transition-transform'} relative z-10 flex-shrink-0`} />
                {isExpanded && <span className="relative z-10">{item.label}</span>}
                {isActive && isExpanded && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
              </Link>
            )
          })}

          <div className="pt-6 mt-6 border-t border-green-200 dark:border-gray-700">
            {bottomItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-700/50 transition-all duration-200 group ${
                    !isExpanded ? 'justify-center' : ''
                  }`}
                  title={!isExpanded ? item.label : ''}
                >
                  <Icon size={20} className="group-hover:scale-110 transition-transform flex-shrink-0" />
                  {isExpanded && <span className="text-sm">{item.label}</span>}
                </Link>
              )
            })}
          </div>
        </nav>

        {isExpanded && (
          <div className="p-4 border-t border-green-200 dark:border-gray-700">
            <div className="relative p-4 clinivo-gradient rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3">
                  <HelpCircle className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-white mb-1">Need Help?</p>
                <p className="text-xs text-white/80 mb-3">Check our medical documentation</p>
                <button className="w-full px-4 py-2 bg-white text-green-600 rounded-lg text-sm font-semibold hover:bg-white/90 transition-all hover:scale-105 shadow-lg">
                  View Docs
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
