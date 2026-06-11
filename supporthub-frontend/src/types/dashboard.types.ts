export interface DashboardStats {
  totalTickets: number
  openTickets: number
  slaCompliance: number
  avgResponseTime: number
}

export interface TicketStatusDistribution {
  status: string
  count: number
}

export interface MonthlyTrends {
  ticketTrends: Array<{ month: string; tickets: number }>
  slaTrends: Array<{ month: string; sla: number }>
}

export interface OverviewData {
  stats: DashboardStats
  statusDistribution: TicketStatusDistribution[]
  monthlyTrends: MonthlyTrends
}

export interface ClientStats {
  totalClients: number
  activeClients: number
  premiumClients: number
  avgTicketsPerClient: number
}

export interface ProductStats {
  totalProducts: number
  activeProducts: number
  mostActiveProduct: {
    name: string
    ticketCount: number
  } | null
  avgSLACompliance: number
}

export interface TicketsByStatus {
  new: TicketItem[]
  in_progress: TicketItem[]
  awaiting_client: TicketItem[]
  resolved: TicketItem[]
}

export interface TicketItem {
  id: string
  ticketCode: string
  title: string
  status: string
  priority: string
  client?: {
    companyName: string
  }
  product?: {
    name: string
  }
  createdAt: string
}

export interface DashboardData {
  overview: OverviewData
  tickets: TicketsByStatus
  clients: ClientStats
  products: ProductStats
}

export type DashboardTab = 'Overview' | 'Tickets' | 'Clients' | 'Products'

export interface TicketsTabProps {
  data: TicketsByStatus | null
  loading: boolean
}

export interface TicketCardProps {
  ticket: TicketItem
}

export interface KanbanColumnProps {
  title: string
  count: number
  tickets: TicketItem[]
  color: string
}

export interface StatCardProps {
  name: string
  value: string | number
  change?: string
  changeType?: 'increase' | 'decrease' | 'neutral'
  info?: string
  icon?: React.ReactNode
  className?: string
}

export interface ProductsTabProps {
  data: ProductStats | null
  loading: boolean
}

export interface OverviewTabProps {
  data: OverviewData | null
  loading: boolean
}

export interface ClientsTabProps {
  data: ClientStats | null
  loading: boolean
}
