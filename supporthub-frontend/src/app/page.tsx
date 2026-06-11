'use client'
import Image from 'next/image'
import { signIn, useSession } from 'next-auth/react'
import { GoogleIcon } from '../components/icons'
import { Button } from '../components/ui/Button'
import Link from 'next/link'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { status } = useSession()
  const router = useRouter()
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
      <ToastContainer />
      <div className="flex flex-col items-center mb-12">
        <div className="mb-3">
          <Image
            src="/Support Hub.png"
            alt="Support Hub Logo"
            width={64}
            height={64}
            className="object-contain"
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Support Hub</h1>
        <p className="text-base text-gray-500 font-normal">
          Support Ticket Management
        </p>
      </div>
      <div className="w-full max-w-md bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h2>
          <p className="text-base text-gray-600 leading-relaxed">
            Sign in with your Google account to continue.
          </p>
        </div>

        <Button
          onClick={() =>
            signIn('google', {
              prompt: 'select_account',
              callbackUrl: '/dashboard',
            })
          }
          variant="outline"
          className="w-full h-12 flex items-center justify-center gap-3 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-gray-900 font-medium text-sm"
        >
          <GoogleIcon />
          Sign in with Google
        </Button>

        <div className="mt-6 text-center">
          <p className="text-base text-gray-500 mb-4">
            Only Google accounts are authorized.
          </p>
          <Link href="/login">
            <span className="text-base text-blue-600 hover:text-blue-600 cursor-pointer font-medium">
              Login with Password
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
