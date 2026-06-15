'use client'

import { useState, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Head from 'next/head'
import Image from 'next/image'
import axios, { AxiosError } from 'axios'
import axiosInstance from '@/services/axios-instance.service'

const baseURLRaw = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
const baseURL = baseURLRaw.endsWith('/api') ? baseURLRaw : baseURLRaw + '/api'

function SetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const token = searchParams.get('token')

  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Authenticated user redirected by middleware (no invite token)
  const isForceChangeMode =
    !token &&
    status !== 'loading' &&
    !!session &&
    session.user?.hasChangedPassword === false

  // Invite-link flow: set password via emailed token
  const handleInviteSubmit = async (e: FormEvent<HTMLFormElement>) => {
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

  // Force-change flow: logged-in user must change their default password
  const handleForceChangeSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setIsLoading(true)
    try {
      await axiosInstance.post('/auth/change-password', {
        currentPassword,
        newPassword: password,
      })
      await signOut({
        callbackUrl: '/?message=' + encodeURIComponent('Password changed. Please log in with your new password.'),
      })
    } catch (err) {
      if (err instanceof AxiosError) {
        const message = err.response?.data?.message as string | undefined
        setError(message || 'Failed to change password. Please try again.')
      } else {
        setError('Failed to change password. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Shared layout wrapper
  const subtitle = isForceChangeMode
    ? 'You must set a new password before accessing your account.'
    : 'Choose a password to activate your account.'

  const heading = isForceChangeMode ? 'Change Password' : 'Set Password'

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
        <h1 className="text-3xl font-bold text-center text-black mt-4">Support Hub</h1>
        <h2 className="mt-2 text-center text-lg font-medium text-gray-400">
          {isForceChangeMode ? 'Account setup required' : 'Set up your account password'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <h3 className="text-2xl font-semibold text-black mb-1">{heading}</h3>
          <p className="text-sm text-gray-400 mb-6">{subtitle}</p>

          {/* Force-change mode: authenticated user with hasChangedPassword=false */}
          {isForceChangeMode ? (
            <form className="space-y-6" onSubmit={handleForceChangeSubmit}>
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-black">
                  Current Password
                </label>
                <div className="mt-1">
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm text-black"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-black">
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
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-black">
                  Confirm New Password
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

              {error && <div className="text-red-600 text-sm">{error}</div>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
              >
                {isLoading ? 'Changing Password...' : 'Change Password'}
              </button>
            </form>

          /* Invite-link mode: no session, has token */
          ) : token ? (
            <form className="space-y-6" onSubmit={handleInviteSubmit}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-black">
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
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-black">
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

              {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
              >
                {isLoading ? 'Setting Password...' : 'Set Password'}
              </button>
            </form>

          /* No token, no session (or session still loading) — invalid link */
          ) : status !== 'loading' ? (
            <div className="text-red-600 text-sm">
              This link has expired or is invalid. Please contact your administrator for a new invite.
            </div>
          ) : null}
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
