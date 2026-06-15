'use client'

import React, { Suspense, useEffect } from 'react'
import BPTicketLogin from './ClientLogin'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const LoginClientWrapper = () => {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.user?.accessToken) {
        router.push('/dashboard')
      } else {
        // Stale session with no valid token — clear it so the form is accessible
        signOut({ redirect: false })
      }
    }
  }, [status, session, router])

  if (status === 'loading') return null

  return (
    <>
      <Suspense fallback={null}>
        <BPTicketLogin />
      </Suspense>
      <ToastContainer />
    </>
  )
}

export default LoginClientWrapper
