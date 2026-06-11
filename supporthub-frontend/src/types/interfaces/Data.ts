import { Ticket } from "./interface"

export interface CreateTicketData {
  title: string
  client: string
  product: string
  priority: 'High' | 'Medium' | 'Low'
}

export interface UpdateTicketData {
  id: string
  changes: Partial<Ticket>
}
