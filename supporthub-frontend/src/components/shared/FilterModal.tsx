import React, { useEffect, useRef } from 'react'

import { FilterModalProps } from '@/types/interfaces/interface'

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  fields,
  values,
  onChange,
  onApply,
  title = 'Filter',
}) => {
  const hasActiveFilters = Object.values(values).some(value => value !== '')

  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={modalRef}
      className="absolute right-4 top-14 bg-white rounded-lg shadow-lg p-5 border border-gray-200 z-50 w-[250px] transition-all duration-200"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          onClick={onClose}
          className="text-red-500 hover:text-red-900 text-2xl"
        >
          &times;
        </button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onApply()
        }}
      >
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium mb-1">
                {field.label}
              </label>
              {field.type === 'select' && field.options ? (
                <select
                  className="w-full border rounded px-2 py-1"
                  value={values[field.name] || ''}
                  onChange={(e) => onChange(field.name, e.target.value)}
                >
                  <option value="">All</option>
                  {field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="w-full border rounded px-2 py-1"
                  type={field.type || 'text'}
                  value={values[field.name] || ''}
                  onChange={(e) => onChange(field.name, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        {hasActiveFilters && (
          <div className="flex justify-end gap-2 mt-6 min-h-[42px] items-center transition-all duration-200 w-full">
            <button
              type="button"
              onClick={() => {
                fields.forEach((field) => onChange(field.name, ''))
              }}
              className="flex-1 rounded border bg-gray-200 hover:bg-gray-300 font-medium shadow-sm border-gray-300 px-4 py-1 transition-all duration-200"
            >
              Clear Filter
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
