import { Ticket } from '@/types/interfaces/interface';

export function mapTickets(tickets: Record<string, unknown>[]): Ticket[] {
    return tickets.map((ticket: Record<string, unknown>): Ticket => ({
        ...ticket,
        id: ticket.id as string,
        title: ticket.title as string,
        description: ticket.description as string | undefined,
        status: ticket.status as string,
        priority: ticket.priority as string,
        ticketCode: ticket.ticketCode as string | undefined,
        client: ticket.client && typeof ticket.client === 'object'
            ? {
                id: (ticket.client as Record<string, unknown>).id as string,
                companyName: (ticket.client as Record<string, unknown>).companyName as string,
                clientCode: (ticket.client as Record<string, unknown>).clientCode as string, 
                status: (ticket.client as Record<string, unknown>).status as string,
                clientProducts: (ticket.client as Record<string, unknown>).clientProducts as Array<{
                    product: {
                        id: string;
                        name: string;
                    }
                }> | undefined,
            }
            : ticket.client as string | undefined,
        product: ticket.product && typeof ticket.product === 'object'
            ? {
                id: (ticket.product as Record<string, unknown>).id as string,
                name: (ticket.product as Record<string, unknown>).name as string,
                productCode: (ticket.product as Record<string, unknown>).productCode as string | undefined,
            }
            : ticket.product as string,
        contactName: ticket.contactName as string | undefined,
        contactEmail: ticket.contactEmail as string | undefined,
        contactPhone: ticket.contactPhone as string | undefined,
        created: String(ticket.createdAt),
        createdAt: String(ticket.createdAt),
        lastUpdated: String(ticket.updatedAt),
        tags: Array.isArray(ticket.tags) ? ticket.tags.map(String) : undefined,
        assignee: ticket.assignee as string | undefined,
        dueDate: ticket.dueDate as string | undefined,
        estimatedTime: ticket.estimatedTime as string | undefined,
        internalNotes: ticket.internalNotes as string | undefined,
        imageUrl: ticket.imageUrl as string | undefined,
        priorityScore:   ticket.priorityScore   as number | undefined,
        emotionScore:    ticket.emotionScore     as number | undefined,
        complexityScore: ticket.complexityScore  as number | undefined,
        agingScore:      ticket.agingScore       as number | undefined,
        llmReasoning:    ticket.llmReasoning     as string | undefined,
        confidence:      ticket.confidence       as number | undefined,
        lastScoredAt:    ticket.lastScoredAt     as string | undefined,
    }));
}
