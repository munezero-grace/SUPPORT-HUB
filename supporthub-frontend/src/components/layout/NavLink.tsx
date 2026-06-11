import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { NavLinkProps } from '@/types/interfaces/Props'


export function NavLink({ href, icon: Icon, name }: NavLinkProps) {
  const pathname = usePathname()
  const isActive =
    href === '/dashboard'
      ? pathname === href
      : pathname?.startsWith(`${href}/`) || pathname === href

  return (
    <Link
      href={href}
      className={cn(
        'group flex gap-x-3 rounded-md p-2 text-sm leading-6',
        isActive
          ? 'bg-gray-500 text-black'
          : 'text-gray-700 hover:bg-gray-100 hover:text-black'
      )}
    >
      <Icon
        className={cn(
          'h-6 w-6 shrink-0',
          isActive ? 'text-white' : 'text-black group-hover:text-green-500'
        )}
        aria-hidden="true"
      />
      {name}
    </Link>
  )
}
