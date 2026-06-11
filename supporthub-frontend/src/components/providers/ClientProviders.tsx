'use client'
import React from 'react'
import { SessionProvider } from 'next-auth/react'
import { Provider } from '@/providers/QueryProvider'

const ClientProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <Provider>{children}</Provider>
    </SessionProvider>
  )
}

export { ClientProviders }
