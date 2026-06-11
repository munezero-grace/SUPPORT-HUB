import { ReactNode } from 'react'

export type TicketHandlers = {
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticket: Ticket) => void;
};

export const tickets = [
  {
    id: 'T-1234',
    title: 'Unable to access dashboard',
    client: 'TechCorp Inc.',
    product: 'BP Analytics',
    status: 'New',
    priority: 'High',
    assignee: 'Sarah Johnson',
    created: '2024-05-14',
    lastUpdated: '2h ago'
  },
];

export interface TicketTableColumn {
  header: string; 
  accessor: (ticket: Ticket) => ReactNode; 
  className?: string; 
}


export interface TableColumn<T extends Record<string, unknown> = Record<string, unknown>> {
  header: string | ReactNode; 
  accessor: keyof T | ((item: T) => ReactNode); 
  className?: string; 
}

export interface TableProps<T extends { id: string | number }> {
  data: T[]; 
  columns: TableColumn<T>[]; 
  onRowClick?: (item: T) => void; 
  className?: string; 
  emptyState?: ReactNode; 
}

export type Ticket = {
  id: string;
  ticketCode?: string;
  title: string;
  client: { companyName: string } | null;
  product: { name: string; status: string; updatedAt?: string } | null;
  status: string;
  priority: string;
  assignee: string;
  createdAt: string;
  updatedAt: string;
};
