import type { Client } from '@/types/clients'
import type { Ticket } from '@/types/interfaces/interface'

export type CreateTicketModalProps = {
  isOpen: boolean
  onClose: () => void
  initialData?: FormData
  isEditing?: boolean
  ticketId?: string
  onTicketCreated?: () => void | Promise<void>
}

export interface SessionUser {
  id: string
  name?: string | null
  email?: string | null
  firstName?: string
  lastName?: string
  role?: string
  provider?: string
  client?: {
    id: string;
    clientCode: string;
    companyName: string | null;
  }
}

export interface ApiError {
  response?: {
    status?: number
    data?: {
      message?: string
    }
  }
}

export interface Product {
  id: string
  name: string
}

export interface UploadedFile {
  file: File
  name: string
}

export interface FormData {
  title: string
  description: string
  product: string
  priority: string
  contactName: string
  contactEmail: string
  contactPhone: string
  client: string
  clientId: string
  clientCode: string
  assignee: string
  dueDate: string
  estimatedTime: string
  tags: string
  internalNotes: string
  category?: string
}

export interface SelectOption {
  label: string
  value: string
}

// Roles allowed to see ML scoring information (priority score, confidence,
// AI reasoning, aging score). Clients must never see these fields.
export const STAFF_ROLES = ['ticket_manager', 'developer', 'super_admin']

export const CATEGORY_OPTIONS: SelectOption[] = [
  { label: 'Select category', value: '' },
  { label: 'Technical Issue', value: 'Technical Issue' },
  { label: 'Billing & Payments', value: 'Billing & Payments' },
  { label: 'Account Access', value: 'Account Access' },
  { label: 'Feature Request', value: 'Feature Request' },
  { label: 'Bug Report', value: 'Bug Report' },
  { label: 'General Inquiry', value: 'General Inquiry' },
  { label: 'Other', value: 'Other' },
]

export interface AdvancedProps {
  formData: FormData
  handleInputChange: (field: keyof FormData, value: string) => void
  isAdmin: boolean
}

export interface ClientInfoProps {
  formData: FormData
  isAdmin: boolean
  availableClients: Client[]
  handleInputChange: (field: keyof FormData, value: string) => void
  setFormData: React.Dispatch<React.SetStateAction<FormData>>

}

export interface SelectOption {
  label: string
  value: string
}

export interface UploadedFile {
  file: File
  name: string
}

export interface TicketDetailsProps {
  formData: FormData
  handleInputChange: (field: keyof FormData, value: string) => void
  productOptions: SelectOption[]
  priorityOptions: SelectOption[]
  uploadedFiles: UploadedFile[]
  isAdmin: boolean
  availableClients: Client[]
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  removeFile: (index: number) => void
}

export interface StepDefinition {
  number: number
  label: string
}

export interface StepIndicatorProps {
  steps: StepDefinition[]
  currentStep: number
  completedSteps: number[]
  onStepClick: (step: number) => void
}

export interface RequestDetailsStepProps {
  formData: FormData
  handleInputChange: (field: keyof FormData, value: string) => void
  productOptions: SelectOption[]
  priorityOptions: SelectOption[]
  isAdmin: boolean
  availableClients: Client[]
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
}

export interface TicketFormStepProps {
  formData: FormData
  handleInputChange: (field: keyof FormData, value: string) => void
  isAdmin: boolean
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
}

export interface UploadDocumentsStepProps {
  uploadedFiles: UploadedFile[]
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  removeFile: (index: number) => void
}

export interface CreatedTicketSummary {
  status?: string
  title?: string
  description?: string
  assignee?: string
  priorityScore?: number
  confidence?: number
  llmReasoning?: string
  agingScore?: number
}

export interface ReviewSubmitStepProps {
  formData: FormData
  uploadedFiles: UploadedFile[]
  productOptions: SelectOption[]
  isAdmin: boolean
  isStaff: boolean
  loading: boolean
  submitted: boolean
  createdTicket: CreatedTicketSummary | null
  onSubmit: () => void
}

export interface TicketUpdateData {
  ticketCode?: string
  title?: string
  status?: string
  priority?: string
  imageUrl?: string
  clientId?: string
  productId?: string
  description?: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  tags?: string
  dueDate?: string
  internalNotes?: string
}

export interface PageProps {
    params: Promise<{
        ticketCode: string
    }>
}

export interface Tag {
    id: string;
    name: string;
}

export interface TicketActionsProps {
    ticket: Ticket
    onEdit: (ticket: Ticket) => void
    onDelete: (ticket: Ticket) => void
    onAssign?: (ticket: Ticket) => void
}