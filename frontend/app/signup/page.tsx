'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { Input } from '@/components/Form'
import { Button } from '@/components/Button'
import { Loader } from '@/components/Loader'
import { UserPlus, Sparkles } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'

export default function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { register, loginWithGoogle } = useAuth()
  const { addToast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(email, password, name)
      addToast('Account created successfully!', 'success')
      router.push('/dashboard')
    } catch (error: any) {
      addToast(error.response?.data?.error || 'Registration failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      await loginWithGoogle()
    } catch (error) {
      addToast('Google sign up failed', 'error')
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        <div className="max-w-md text-white relative z-10 animate-fade-in">
          <h2 className="text-4xl font-bold mb-6 animate-slide-left">Join our community</h2>
          <p className="text-primary-100 text-lg leading-relaxed mb-12 animate-slide-left" style={{animationDelay: '0.1s'}}>
            Create your account and start building amazing projects in minutes. No credit card required.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3 animate-slide-left" style={{animationDelay: '0.2s'}}>
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm transform hover:scale-110 transition-transform duration-300">✓</div>
              <span className="text-primary-50">Free forever plan available</span>
            </div>
            <div className="flex items-center gap-3 animate-slide-left" style={{animationDelay: '0.3s'}}>
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm transform hover:scale-110 transition-transform duration-300">✓</div>
              <span className="text-primary-50">No credit card required</span>
            </div>
            <div className="flex items-center gap-3 animate-slide-left" style={{animationDelay: '0.4s'}}>
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm transform hover:scale-110 transition-transform duration-300">✓</div>
              <span className="text-primary-50">Setup in under 5 minutes</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6 animate-slide-down">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">YourApp</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3 animate-slide-up">Create account</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg animate-slide-up" style={{animationDelay: '0.1s'}}>Start your journey with us today</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="animate-slide-up" style={{animationDelay: '0.2s'}}>
              <Input
                label="Full name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="animate-slide-up" style={{animationDelay: '0.3s'}}>
              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="animate-slide-up" style={{animationDelay: '0.4s'}}>
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                required
              />
            </div>
            
            <div className="animate-slide-up" style={{animationDelay: '0.5s'}}>
              <Button type="submit" className="w-full mt-6 transform hover:scale-[1.02] transition-all duration-200" disabled={loading}>
                {loading ? <Loader size="sm" /> : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
            </div>

            <div className="relative my-6 animate-slide-up" style={{animationDelay: '0.55s'}}>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="animate-slide-up" style={{animationDelay: '0.6s'}}>
              <button
                type="button"
                onClick={handleGoogleSignUp}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                <FcGoogle className="w-5 h-5" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">Sign up with Google</span>
              </button>
            </div>
          </form>
          
          <div className="mt-8 text-center animate-fade-in" style={{animationDelay: '0.65s'}}>
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors duration-200">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
