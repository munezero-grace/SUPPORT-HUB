'use client'

import { signIn, useSession } from 'next-auth/react'
import { useState, FormEvent } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import ChangePasswordModal from '@/components/auth/ChangePasswordModal'

const BPTicketLogin: React.FC = () => {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const { data: session } = useSession()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        rememberMe: String(rememberMe),
        redirect: false,
      })

      if (result?.error) {
        const errorData = JSON.parse(result.error)
        setError(errorData.message || 'Login failed')
      } else if (result?.ok) {
        // Check if user needs to change password
        const hasChangedPassword = (session?.user as Record<string, unknown>)
          ?.hasChangedPassword
        if (!hasChangedPassword) {
          setShowPasswordModal(true)
          setTimeout(() => {
            window.location.href = '/dashboard'
          }, 2000)
        } else {
          window.location.href = '/dashboard'
        }
      }
    } catch (err) {
      setError('An error occurred during login')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Support Hub - Client Login</title>
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Image
            src="/Support Hub.png"
            alt="Support Hub Logo"
            width={80}
            height={80}
            className="object-contain mx-auto"
          />
          <h1 className="text-3xl font-bold text-center text-black mt-4">
            Support Hub
          </h1>
          <h2 className="mt-2 text-center text-lg font-medium text-gray-400">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <h3 className="text-2xl font-semibold text-black mb-1">
              Sign In
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Enter your credentials to continue
            </p>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-black"
                >
                  Email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    autoComplete="new-email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm text-black"
                  />
                </div>
              </div>

              <div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-black"
                  >
                    Password
                  </label>
                </div>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm text-black"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black cursor-pointer"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                  Remember Me
                </label>
              </div>

              {error && (
                <div className="text-red-600 text-sm mb-4">{error}</div>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

          </div>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </>
  )
}

export default BPTicketLogin
