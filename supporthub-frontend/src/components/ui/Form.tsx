import { FormEvent } from 'react'
import { cn } from '@/lib/utils'
import { FormProps, FormFieldProps, FormActionsProps } from '@/types/interfaces/Props'

export function Form({
  onSubmit,
  children,
  className,
  disabled = false,
}: FormProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!disabled) {
      onSubmit(e)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('space-y-6', className, {
        'opacity-50 pointer-events-none': disabled
      })}
    >
      {children}
    </form>
  )
}

export function FormField({
  label,
  error,
  children,
  className,
  required,
  helpText,
}: FormFieldProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}

export function FormActions({ children, className }: FormActionsProps) {
  return (
    <div className={cn('flex items-center justify-end gap-3', className)}>
      {children}
    </div>
  )
}
