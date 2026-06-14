'use client'

import { useState, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Head from 'next/head'
import Image from 'next/image'
import axios, { AxiosError } from 'axios'

const baseURLRaw = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
const baseURL = baseURLRaw.endsWith('/api') ? baseURLRaw : baseURLRaw + '/api'

function SetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!token) {
      setError('This link has expired or is invalid. Please contact your administrator for a new invite.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsLoading(true)

    try {
      await axios.post(`${baseURL}/auth/set-password`, {
        token,
        newPassword: password,
      })

      router.push('/?message=' + encodeURIComponent('Password set successfully. Please log in.'))
    } catch (err) {
      if (err instanceof AxiosError) {
        const message = err.response?.data?.message as string | undefined

        if (err.response?.status === 400 && message?.toLowerCase().includes('already')) {
          setError('This link has already been used. Please log in or contact your administrator.')
        } else if (message) {
          setError(message)
        } else {
          setError('This link has expired or is invalid. Please contact your administrator for a new invite.')
        }
      } else {
        setError('This link has expired or is invalid. Please contact your administrator for a new invite.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
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
          Set up your account password
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <h3 className="text-2xl font-semibold text-black mb-1">
            Set Password
          </h3>
          <p className="text-sm text-gray-400 mb-6">
            Choose a password to activate your account.
          </p>

          {!token ? (
            <div className="text-red-600 text-sm">
              This link has expired or is invalid. Please contact your administrator for a new invite.
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-black"
                >
                  New Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm text-black"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-black"
                >
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm text-black"
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm mb-4">{error}</div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
              >
                {isLoading ? 'Setting Password...' : 'Set Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SetPasswordPage() {
  return (
    <>
      <Head>
        <title>Support Hub - Set Password</title>
      </Head>
      <Suspense fallback={null}>
        <SetPasswordForm />
      </Suspense>
    </>
  )
}
