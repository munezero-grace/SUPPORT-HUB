import { SelectOption } from "@/types"
import { format } from 'date-fns'

export const TICKET_STATUS_OPTIONS: SelectOption[] = [
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'awaiting_client', label: 'Awaiting Client' },
  { value: 'resolved', label: 'Resolved' },
]

export const TICKET_PRIORITY_OPTIONS: SelectOption[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

export const formatDate = (dateString?: string) => {
        if (!dateString) return ''
        return format(new Date(dateString), 'MMM d, yyyy \'at\' h:mm a')
    }

export const getStatusColor = (status: string) => {
        const statusColors: Record<string, string> = {
            new: 'bg-blue-100 text-blue-800',
            active: 'bg-green-100 text-green-800',
            'in progress': 'bg-blue-500 text-white',
            pending: 'bg-yellow-100 text-yellow-800',
            resolved: 'bg-gray-100 text-gray-800',
            closed: 'bg-red-100 text-red-800',
        }
        return statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800'
    }

export const getPriorityColor = (priority: string) => {
        const priorityColors: Record<string, string> = {
            critical: 'bg-red-100 text-red-700',
            high: 'bg-orange-100 text-orange-700',
            medium: 'bg-yellow-100 text-yellow-700',
            low: 'bg-green-100 text-green-700'
        }
        return priorityColors[priority?.toLowerCase()] || 'bg-green-500 text-white'
    }
