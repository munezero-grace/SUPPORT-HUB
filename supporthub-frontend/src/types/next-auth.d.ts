import type { DefaultSession, DefaultUser } from 'next-auth'
import type { JWT as NextAuthJWT } from 'next-auth/jwt'
import { Client } from '@/types/auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      image: string | null
      role: string
      token: string
      accessToken: string
      provider: string
      providerId: string
      emailVerified?: Date | null
      client?: Client
      firstName?: string
      lastName?: string
      hasChangedPassword?: boolean
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    id: string
    role: string
    provider: string
    providerId: string
    token?: string
    accessToken?: string
    firstName?: string
    lastName?: string
    emailVerified?: Date | null
    hasChangedPassword?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends NextAuthJWT {
    id: string
    name: string
    email: string
    role: string
    token: string
    accessToken: string
    provider: string
    providerId: string
    picture?: string | null
    firstName?: string
    lastName?: string
    hasChangedPassword?: boolean
    client?: Client
  }
}

export interface ExtendedUser extends DefaultUser {
  id: string
  role: string
  provider: string
  providerId: string
  token?: string
  accessToken?: string
  firstName?: string
  lastName?: string
  hasChangedPassword?: boolean
}
