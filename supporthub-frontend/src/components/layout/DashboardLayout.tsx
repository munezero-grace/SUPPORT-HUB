'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { navigation } from '@/constants/sidebarNavigation'
import { usePathname, useRouter } from 'next/navigation'
import { getNavItemStyles } from '@/lib/styles'
import { AvatarIcon } from '@/components/icons'
import { signOut, useSession } from 'next-auth/react'
import { DashboardLayoutProps } from '@/types/interfaces/Props'
import { useMobileMenu } from '@/context/MobileMenuContext'
import { XMarkIcon, Bars3Icon } from '@heroicons/react/24/outline'
import { useNotifications } from '@/context/NotificationContext'
import { NotificationDropdown } from '@/components/ui/NotificationDropdown'

const ROUTE_GUARDS: { pattern: string; roles: string[] }[] = [
  { pattern: '/dashboard/priority-queue', roles: ['super_admin', 'ticket_manager'] },
  { pattern: '/dashboard/team',           roles: ['super_admin', 'ticket_manager'] },
  { pattern: '/dashboard/clients',        roles: ['super_admin'] },
  { pattern: '/dashboard/products',       roles: ['super_admin'] },
  { pattern: '/dashboard/reports',        roles: ['super_admin', 'ticket_manager'] },
  { pattern: '/dashboard/my-tasks',       roles: ['developer'] },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const { unreadCount } = useNotifications()
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu()
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {},
  })

  const isAdmin = session?.user?.role === 'super_admin'
  const userRole = session?.user?.role || ''

  const filteredNavigation = navigation.filter((item) => {
    if (item.visibleTo) return item.visibleTo.includes(userRole)
    if (item.adminOnly) return isAdmin
    return true
  })

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setIsMobileMenuOpen])

  useEffect(() => {
    if (status !== 'authenticated' || !userRole) return
    const blocked = ROUTE_GUARDS.find(({ pattern }) => pathname.startsWith(pattern))
    if (blocked && !blocked.roles.includes(userRole)) {
      router.replace('/dashboard')
    }
  }, [pathname, userRole, status, router])

  useEffect(() => {
    if (status === ('unauthenticated' as string)) {
      window.history.pushState(null, '', '/')
      window.addEventListener('popstate', () => {
        window.history.forward()
      })
    }
    return () => {
      window.removeEventListener('popstate', () => {
        window.history.forward()
      })
    }
  }, [status])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen md:flex bg-[#F9FAFB]">
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 transform bg-white transition-transform duration-300 ease-in-out border-r border-[#E5E7EB]
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:relative md:flex md:flex-col
        `}
      >
        <div className="h-16 flex items-center px-4 border-b border-[#E5E7EB]">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Image
              src="/Support Hub.png"
              alt="Support Hub"
              width={40}
              height={40}
              priority
            />
            <span className="text-[#111827] text-lg font-bold">
              Support Hub
            </span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={getNavItemStyles(isActive).container}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon
                      className={getNavItemStyles(isActive).icon}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>
      <div className="fixed top-0 left-0 z-50 md:hidden">
        <button
          type="button"
          className="px-4 h-16 text-gray-500 hover:text-gray-600 focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="sr-only">Open sidebar</span>
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>
      <div className="flex-1 min-h-screen w-full md:w-[calc(100%-16rem)]">
        <header className="h-16 flex items-center justify-between px-5 bg-white border-b border-[#E5E7EB]">
          <div className="flex items-center md:hidden">
            <span className="text-[#111827] text-xl font-bold p-2.5 ml-8">
              Support Hub
            </span>
          </div>
          <div className="hidden md:flex md:items-center">
            <span className="text-[#111827] text-xl font-bold p-2.5">
              Support Hub
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications((v) => !v)}
                className="relative p-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
                aria-label="Notifications"
              >
                <svg
                  className="w-6 h-6 text-[#4B5563]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0h-6"
                  />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[1rem] h-4 px-0.5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              <NotificationDropdown
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
              />
            </div>

            <div className="relative profile-menu-container" ref={profileRef}>
              <button
                type="button"
                className="flex items-center space-x-3 text-sm focus:outline-none cursor-pointer"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="h-8 w-8 rounded-full bg-[#111827] text-white flex items-center justify-center overflow-hidden cursor-pointer">
                  {session?.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user?.name || ''}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <AvatarIcon className="h-5 w-5" />
                  )}
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 py-1 bg-white rounded-lg shadow-lg border border-[#E5E7EB] z-50">
                  <div className="px-4 py-2 border-b border-[#E5E7EB] overflow-hidden">
                    <span className="text-sm text-[#111827] font-extrabold capitalize block truncate">
                      {session?.user?.name}
                    </span>
                    <div className="text-sm text-gray-500 truncate max-w-[11rem]">
                      {session?.user?.email}
                    </div>
                    <div className="text-xs text-gray-400 capitalize mt-1 truncate">
                      {session?.user?.role}
                    </div>
                  </div>
                  <Link
                    href="/dashboard/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}
