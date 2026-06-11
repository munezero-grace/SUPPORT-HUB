'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import CreateTicketModal from './CreateTicketModal'
import type { Ticket } from '@/types/interfaces/interface'
import type { FormData as TicketFormData } from '@/types/TicketTypes'

interface EditTicketModalProps {
    isOpen: boolean
    onClose: () => void
    ticket: Ticket
}

interface Tag {
    id?: string
    name: string
}

type TagInput = Array<Tag | string> | string | undefined

export default function EditTicketModal({ isOpen, onClose, ticket }: EditTicketModalProps) {
    const { data: session } = useSession()
    const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'super_admin'
    const transformTicketToFormData = (ticket: Ticket): TicketFormData => {
        const getProductId = (product: typeof ticket.product): string => {
            if (typeof product === 'object' && product !== null) {
                return product.id || ''
            }
            return typeof product === 'string' ? product : ''
        }
        const getClientInfo = (client: typeof ticket.client) => {
            if (typeof client === 'object' && client !== null) {
                return {
                    id: client.id || '',
                    companyName: client.companyName || '',
                    clientCode: client.clientCode || ''
                }
            }
            return {
                id: '',
                companyName: typeof client === 'string' ? client : '',
                clientCode: ''
            }
        }
        const transformTags = (tags: TagInput): string => {
            if (Array.isArray(tags)) {
                return tags
                    .map(tag => {
                        if (typeof tag === 'object' && tag !== null && 'name' in tag) {
                            return tag.name
                        }
                        return typeof tag === 'string' ? tag : ''
                    })
                    .filter(Boolean)
                    .join(', ')
            }
            return typeof tags === 'string' ? tags : ''
        }

        const clientInfo = getClientInfo(ticket.client)
        const productId = getProductId(ticket.product)
        const tagString = transformTags(ticket.tags)
        const formData: TicketFormData = {
            title: ticket.title || '',
            description: ticket.description || '',
            product: productId,
            priority: (ticket.priority || 'medium').toLowerCase(),
            client: clientInfo.companyName,
            clientId: clientInfo.id,
            clientCode: clientInfo.clientCode,
            contactName: ticket.contactName || '',
            contactEmail: ticket.contactEmail || '',
            contactPhone: ticket.contactPhone || '',
            assignee: ticket.assignee || 'auto-assign',
            dueDate: ticket.dueDate || '',
            estimatedTime: ticket.estimatedTime || '',
            tags: tagString,
            internalNotes: ticket.internalNotes || ''
        }
        if (!isAdmin) {
            formData.client = clientInfo.companyName
            formData.clientId = clientInfo.id
            formData.clientCode = clientInfo.clientCode
            formData.assignee = 'auto-assign'
        }

        return formData
    }

    const initialData = transformTicketToFormData(ticket)

    return (
        <CreateTicketModal
            isOpen={isOpen}
            onClose={onClose}
            initialData={initialData}
            isEditing={true}
            ticketId={ticket.id}
        />
    )
}
