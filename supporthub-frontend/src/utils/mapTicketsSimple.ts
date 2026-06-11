import type { Ticket } from '@/types/interfaces/interface';

export function mapTicketsSimple(data: Ticket[]): Ticket[] {
    return data.map((ticket: Ticket) => ({
        id: ticket.id,
        ticketCode: ticket.ticketCode,
        title: ticket.title,
        client: typeof ticket.client === 'object' && ticket.client
            ? {
                id: ticket.client.id,
                companyName: ticket.client.companyName,
                clientCode: ticket.client.clientCode,
                status: ticket.client.status,
                clientProducts: ticket.client.clientProducts
            }
            : ticket.client,
        product: typeof ticket.product === 'object' && ticket.product
            ? {
                id: ticket.product.id,
                name: ticket.product.name
            }
            : ticket.product,
        status: ticket.status,
        priority: ticket.priority,
        description: ticket.description,
        contactName: ticket.contactName,
        contactEmail: ticket.contactEmail,
        contactPhone: ticket.contactPhone,
        created: ticket.created || ticket.createdAt,
        lastUpdated: ticket.lastUpdated,
        tags: ticket.tags,
        dueDate: ticket.dueDate,
        estimatedTime: ticket.estimatedTime,
        assignee: ticket.assignee,
        internalNotes: ticket.internalNotes,
        imageUrl: ticket.imageUrl,
        priorityScore:   ticket.priorityScore,
        emotionScore:    ticket.emotionScore,
        complexityScore: ticket.complexityScore,
        agingScore:      ticket.agingScore,
        llmReasoning:    ticket.llmReasoning,
        confidence:      ticket.confidence,
        lastScoredAt:    ticket.lastScoredAt
    }));
}
