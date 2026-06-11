import NextAuth, { type NextAuthOptions } from 'next-auth'
import axios, { AxiosError } from 'axios'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { encode, decode } from 'next-auth/jwt'
import { socialSignup } from '@/services/auth.service'

import { splitName } from '@/lib/utils'
import { CustomUser } from '@/types/auth'

const REMEMBER_ME_MAX_AGE = 30 * 24 * 60 * 60  // 30 days
const DEFAULT_MAX_AGE = 8 * 60 * 60              // 8 hours

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      httpOptions: {
        timeout: 10000,
      },
      authorization: {
        params: {
          prompt: 'select_account',
          access_type: 'offline',
          response_type: 'code',
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: profile.role,
          provider: 'google',
          providerId: profile.sub,
        }
      },
    }),

    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'email@example.com',
        },
        password: { label: 'Password', type: 'password' },
        rememberMe: { label: 'Remember Me', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const backendUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000'

        try {
          const response = await axios.post(`${backendUrl}/api/auth/login`, {
            email: credentials.email,
            password: credentials.password,
          })

          const { token, hasChangedPassword } = response.data

          if (token) {
            const base64Payload = token.split('.')[1]
            const userData = JSON.parse(
              Buffer.from(base64Payload, 'base64').toString()
            )

            return {
              ...userData,
              token,
              accessToken: token,
              provider: 'credentials',
              firstName: userData.firstName,
              lastName: userData.lastName,
              hasChangedPassword: hasChangedPassword || false,
              rememberMe: credentials.rememberMe === 'true',
              name:
                userData.firstName && userData.lastName
                  ? `${userData.firstName} ${userData.lastName}`
                  : undefined,
            }
          }

          return null
        } catch (error) {
          if (error instanceof AxiosError) {
            console.error('[authorize] login failed:', {
              status: error.response?.status,
              data: error.response?.data,
              message: error.message,
              code: error.code,
            })
            throw new Error(
              JSON.stringify(
                error.response?.data ?? { message: error.message }
              )
            )
          }
          throw error
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      return !!user
    },

    async jwt({ token, user, account, profile }) {
      if (user) {
        const customUser = user as CustomUser

        token.id = customUser.id
        token.role = customUser.role || 'user'
        token.accessToken = customUser.token || token.accessToken || ''
        token.provider = customUser.provider || account?.provider || ''
        token.providerId = customUser.providerId || ''
        token.email = customUser.email || token.email
        token.client = customUser.client || undefined
        token.hasChangedPassword = customUser.hasChangedPassword ?? false
        token.rememberMe = (customUser as Record<string, unknown>).rememberMe ?? false

        if (customUser.contactName) {
          token.name = customUser.contactName
        } else if (customUser.firstName || customUser.lastName) {
          token.name = `${customUser.firstName ?? ''}${
            customUser.lastName ? ' ' + customUser.lastName : ''
          }`.trim()
        } else if (customUser.name) {
          token.name = customUser.name
        }
      }

      // Google login handling
      if (account?.provider === 'google') {
        const payload = {
          sub: profile?.sub ?? '',
          name: profile?.name ?? '',
          email: profile?.email ?? '',
          firstName: profile?.name ? splitName(profile.name).firstName : '',
          lastName: profile?.name ? splitName(profile.name).lastName : '',
          providerId: account.providerAccountId,
          provider: account.provider,
        }

        try {
          const data = await socialSignup(payload)

          if (data.token) {
            const base64Payload = data.token.split('.')[1]
            const decodedUser = JSON.parse(
              Buffer.from(base64Payload, 'base64').toString()
            )

            return {
              ...token,
              ...decodedUser,
              accessToken: data.token,
            }
          }
        } catch (error) {
          console.error('Error in social signup:', error)
          return token
        }
      }

      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.accessToken = token.accessToken as string
        session.user.provider = token.provider as string
        session.user.providerId = token.providerId as string
        session.user.email = token.email as string
        session.user.name = (token.name as string) || ''
        session.user.client = token.client as undefined
        session.user.hasChangedPassword = token.hasChangedPassword as boolean
      }
      return session
    },
  },

  pages: {
    signIn: '/',
    error: '/',
    signOut: '/',
  },

  session: {
    strategy: 'jwt',
    maxAge: REMEMBER_ME_MAX_AGE,
  },

  jwt: {
    maxAge: REMEMBER_ME_MAX_AGE,
    encode: async (params) => {
      const maxAge = params.token?.rememberMe ? REMEMBER_ME_MAX_AGE : DEFAULT_MAX_AGE
      return encode({ ...params, maxAge })
    },
    decode: async (params) => decode(params),
  },

  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
