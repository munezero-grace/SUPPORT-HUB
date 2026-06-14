import { CardProps } from "@/types/interfaces/Props"

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`} onClick={onClick}>
      {children}
    </div>
  )
}
