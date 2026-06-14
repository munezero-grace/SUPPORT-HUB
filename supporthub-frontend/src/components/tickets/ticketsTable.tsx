import { ReactNode } from 'react';
import { TicketActions } from '@/components/tickets/TicketActions';
import { PriorityScoreBadge } from '@/components/tickets/PriorityScoreBadge';
import type { Ticket } from '@/types/interfaces/interface';

type TicketHandlers = {
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticket: Ticket) => void;
  onAssign?: (ticket: Ticket) => void;
  isAdmin?: boolean;
  currentUserId?: string;
  showPriorityScore?: boolean;
};

export const createTicketTableColumns = ({ onEdit, onDelete, onAssign, showPriorityScore }: TicketHandlers) => [
  {
    header: 'ID ↑↓',
    accessor: (ticket: Ticket): ReactNode => (
      <span className="block truncate">{ticket.ticketCode || ticket.id}</span>
    ),
    className: 'w-24',
  },
  {
    header: 'Title',
    accessor: (ticket: Ticket): ReactNode => (
      <span className="truncate block max-w-[280px]" title={ticket.title}>{ticket.title}</span>
    ),
    className: 'min-w-[140px] max-w-[280px]',
  },
  {
    header: 'Client',
    accessor: (ticket: Ticket): ReactNode => {
      if (typeof ticket.client === 'string') {
        return <span className="text-sm text-gray-600 truncate block" title={ticket.client}>{ticket.client}</span>;
      }

      if (typeof ticket.client === 'object' && ticket.client?.companyName) {
        return <span className="text-sm text-gray-600 truncate block" title={ticket.client.companyName}>{ticket.client.companyName}</span>;
      }

      return <span className="text-sm text-gray-400">N/A</span>;
    },
    className: 'w-36',
  },
  {
    header: 'Product',
    accessor: (ticket: Ticket): ReactNode => {
      if (ticket.product && typeof ticket.product === 'string') {
        return <span className="text-sm text-gray-600">{ticket.product}</span>;
      }

      if (ticket.product && typeof ticket.product === 'object' && ticket.product.name) {
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-gray-700">
              {ticket.product.name}
            </span>
          </div>
        );
      }

      return <span className="text-sm text-gray-400">No product assigned</span>;
    },
    className: 'w-32',
  },
  ...(showPriorityScore ? [{
    header: 'Priority Score',
    accessor: (ticket: Ticket): ReactNode => (
      <PriorityScoreBadge score={ticket.priorityScore} confidence={ticket.confidence} llmReasoning={ticket.llmReasoning} priority={ticket.priority} variant="detailed" />
    ),
    className: 'w-40',
  }] : []),
  {
    header: 'Due Date',
    accessor: (ticket: Ticket): ReactNode => (
      <span className="text-sm text-gray-600">
        {ticket.dueDate ? new Date(ticket.dueDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }) : '-'}
      </span>
    ),
    className: 'w-24',
  },
  {
    header: 'Actions',
    accessor: (ticket: Ticket): ReactNode => (
      <div className="flex justify-end px-2">
        <TicketActions
          ticket={ticket}
          onEdit={onEdit}
          onDelete={onDelete}
          onAssign={onAssign}
        />
      </div>
    ),
    className: 'w-[80px]',
  },
];