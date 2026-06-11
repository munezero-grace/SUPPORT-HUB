import { useState, useRef, useEffect } from 'react'
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline'
import { ActionMenuProps } from '@/types'

export default function ActionMenu({ items }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-700 hover:text-black"
      >
        <EllipsisHorizontalIcon className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md border border-gray-200 z-50">
          <div className="px-4 py-2 font-bold text-sm text-black">Actions</div>

          {/* Actions */}
          {items.map((item, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation()
                item.onClick(e)
                setIsOpen(false)
              }}
              className="w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-300"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
