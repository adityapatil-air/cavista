'use client'

import { useState, ReactNode } from 'react'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { Footer } from './Footer'

interface DashboardLayoutProps {
  children: ReactNode
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarHovered, setSidebarHovered] = useState(false)

  const sidebarWidth = sidebarCollapsed && !sidebarHovered ? 'lg:ml-20' : 'lg:ml-72'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        isCollapsed={sidebarCollapsed}
        onHoverChange={setSidebarHovered}
      />
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${sidebarWidth}`}>
        <Navbar 
          onMenuClick={() => setSidebarOpen(true)} 
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
          isCollapsed={sidebarCollapsed} 
        />
        <main className="flex-1 p-4 md:p-6 text-gray-900 dark:text-gray-100">{children}</main>
        <Footer />
      </div>
    </div>
  )
}
