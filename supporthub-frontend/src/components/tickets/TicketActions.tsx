'use client'

import { useRouter } from 'next/navigation'
import { ActionMenu } from '@/components/ui/ActionMenu'
import { TicketActionsProps } from '@/types/TicketTypes'

export function TicketActions({ ticket, onEdit, onDelete, onAssign }: TicketActionsProps) {
    const router = useRouter()

    const items = [
        {
            label: 'View Details',
            onClick: () => router.push(`/dashboard/tickets/${ticket.ticketCode || ticket.id}`),
        },
        {
            label: 'Edit Ticket',
            onClick: () => onEdit(ticket),
        },
        ...(onAssign ? [{
            label: 'Assign to Developer',
            onClick: () => onAssign(ticket),
        }] : []),
        {
            label: 'Delete',
            variant: 'danger' as const,
            onClick: () => onDelete(ticket),
        },
    ]

    return <ActionMenu items={items} />
}