import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text
  return `${text.slice(0, length)}...`
}

export function generateAvatarFallback(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export const splitName = (name?: string) => {
  return {
    firstName: name?.split(' ')[0],
    lastName: name?.split(' ')[1] || ' ',
  }
}
