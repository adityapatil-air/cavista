import { ReactNode } from 'react'

interface CardProps {
  title?: string
  children: ReactNode
  className?: string
  icon?: ReactNode
}

export const Card = ({ title, children, className = '', icon }: CardProps) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in ${className}`}>
      {(title || icon) && (
        <div className="flex items-center gap-3 mb-4">
          {icon && <div className="text-primary-600 dark:text-primary-400">{icon}</div>}
          {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>}
        </div>
      )}
      <div className="text-gray-600 dark:text-gray-300">{children}</div>
    </div>
  )
}
