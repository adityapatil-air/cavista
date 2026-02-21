import { ReactNode, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  className?: string
}

export const Button = ({ children, variant = 'primary', className = '', ...props }: ButtonProps) => {
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 hover:shadow-md',
    danger: 'bg-red-600 hover:bg-red-700 text-white hover:shadow-md',
  }

  return (
    <button 
      className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 active:scale-95 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  )
}
