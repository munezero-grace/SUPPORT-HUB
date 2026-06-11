import { Status, SupportTier } from '@/types/clients'

export type ClientResponse = {
  id: string
  clientCode: string
  companyName: string
  name: string
  contactName: string
  products: string[]
  supportTier: SupportTier
  activeTickets: number
  status: Status
  createdAt: string
  updatedAt: string
  user: {
    email: string
    firstName: string
    lastName: string
  }
  userId?: string
  clientProducts?: { id: string }[]
}
