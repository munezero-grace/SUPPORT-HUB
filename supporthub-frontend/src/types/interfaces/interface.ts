import { JWT } from "next-auth/jwt"

export interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  adminOnly?: boolean
  visibleTo?: string[]
}

export interface Settings {
  fullName: string
  email: string
  emailNotifications: boolean
  slackNotifications: boolean
}

export interface PingResponse {
  message: string
}

export interface Stats {
  name: string
  value: string
  change: string
  changeType: 'increase' | 'decrease'
  info: string
}

export interface TicketComment {
  id: string
  ticketId: string
  userId: string
  text: string
  createdAt: string
  user: { id: string; firstName: string; lastName: string }
}

export interface TicketNote {
  id: string
  ticketId: string
  userId: string
  text: string
  createdAt: string
  user: { id: string; firstName: string; lastName: string }
}

export interface Ticket {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  ticketCode?: string;
  client?: string | {
    id: string;
    companyName: string;
    clientCode: string;
    status: string;
    clientProducts?: Array<{
      product: {
        id: string;
        name: string;
      }
    }>;
  };
  product?: string | {
    id: string;
    name: string;
  };
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  imageUrl?: string;
  tags?: string[];
  dueDate?: string;
  estimatedTime?: string;
  assignee?: string;
  internalNotes?: string;
  createdAt?: string;
  created?: string;
  lastUpdated?: string;
  priorityScore?: number;
  emotionScore?: number;
  complexityScore?: number;
  agingScore?: number;
  llmReasoning?: string;
  confidence?: number;
  lastScoredAt?: string;
  UserTickets?: Array<{ user: { id: string; firstName: string; lastName: string } }>;
  TicketNotes?: TicketNote[];
  TicketComments?: TicketComment[];
}

export interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role: string
  firstName?: string | null
  lastName?: string | null
  provider: string
  providerId: string
  token?: string
  accessToken?: string
}

export interface ExtendedToken extends JWT {
  id: string
  role: string
  name: string
  email: string
  picture?: string | null
  token: string
  accessToken: string
  provider: string
  providerId: string
}

export interface FilterField {
  label: string
  name: string
  type?: string
  options?: Array<{ label: string; value: string }>
}

export interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  fields: FilterField[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: Record<string, any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (name: string, value: any) => void
  onApply: () => void
  title?: string
}
