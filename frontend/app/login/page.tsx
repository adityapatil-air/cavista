'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { Input } from '@/components/Form'
import { Button } from '@/components/Button'
import { Loader } from '@/components/Loader'
import { LogIn, Stethoscope } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, loginWithGoogle } = useAuth()
  const { addToast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      addToast('Login successful!', 'success')
      router.push('/dashboard')
    } catch (error: any) {
      addToast(error.response?.data?.error || 'Login failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle()
    } catch (error) {
      addToast('Google login failed', 'error')
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-white to-green-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6 animate-slide-down">
              <div className="w-10 h-10 clinivo-gradient rounded-xl flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold clinivo-text-gradient">Clinivo</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3 animate-slide-up">Welcome back</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg animate-slide-up" style={{animationDelay: '0.1s'}}>Sign in to your Smart EMR & Diagnostic Assistant</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="animate-slide-up" style={{animationDelay: '0.2s'}}>
              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@clinic.com"
                required
              />
            </div>
            <div className="animate-slide-up" style={{animationDelay: '0.3s'}}>
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            
            <div className="animate-slide-up" style={{animationDelay: '0.4s'}}>
              <Button type="submit" className="w-full mt-6 transform hover:scale-[1.02] transition-all duration-200" disabled={loading}>
                {loading ? <Loader size="sm" /> : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </div>

            <div className="relative my-6 animate-slide-up" style={{animationDelay: '0.45s'}}>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-green-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="animate-slide-up" style={{animationDelay: '0.5s'}}>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-green-200 dark:border-gray-700 rounded-lg hover:bg-green-50 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                <FcGoogle className="w-5 h-5" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">Sign in with Google</span>
              </button>
            </div>
          </form>
          
          <div className="mt-8 text-center animate-fade-in" style={{animationDelay: '0.55s'}}>
            <p className="text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-green-600 font-semibold hover:text-green-700 transition-colors duration-200">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 clinivo-gradient p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        <div className="max-w-md text-white relative z-10 animate-fade-in">
          <h2 className="text-4xl font-bold mb-6 animate-slide-right">Transform Healthcare Documentation</h2>
          <p className="text-green-100 text-lg leading-relaxed animate-slide-right" style={{animationDelay: '0.1s'}}>
            Join healthcare professionals using AI-powered voice-first EMR system to streamline patient care and improve documentation quality.
          </p>
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3 animate-slide-right" style={{animationDelay: '0.2s'}}>
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm transform hover:scale-110 transition-transform duration-300">✓</div>
              <span className="text-green-50">Voice-to-text transcription</span>
            </div>
            <div className="flex items-center gap-3 animate-slide-right" style={{animationDelay: '0.3s'}}>
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm transform hover:scale-110 transition-transform duration-300">✓</div>
              <span className="text-green-50">AI-powered diagnosis assistance</span>
            </div>
            <div className="flex items-center gap-3 animate-slide-right" style={{animationDelay: '0.4s'}}>
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm transform hover:scale-110 transition-transform duration-300">✓</div>
              <span className="text-green-50">Automated ICD code mapping</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
