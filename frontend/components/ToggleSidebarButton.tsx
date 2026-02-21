'use client'

import React from 'react'

const ToggleSidebarButton: React.FC<{ 
  onMenuClick?: () => void
  onToggleCollapse?: () => void
  isCollapsed?: boolean
}> = ({ onMenuClick, onToggleCollapse, isCollapsed }) => {
  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      if (onToggleCollapse) {
        onToggleCollapse()
      }
    } else {
      if (onMenuClick) {
        onMenuClick()
      }
    }
  }

  return (
    <button
      onClick={handleToggle}
      className="w-10 h-10 lg:w-11 lg:h-11 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1={isCollapsed ? "3" : "7"} y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </button>
  )
}

export default ToggleSidebarButton
