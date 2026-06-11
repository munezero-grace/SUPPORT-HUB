import { CardProps } from "@/types/interfaces/Props"

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
      {children}
    </div>
  )
}
