'use client'
import type {
  CreateTicketModalProps,
  SessionUser,
  ApiError,
  UploadedFile,
  SelectOption,
  StepDefinition,
  CreatedTicketSummary,
} from '@/types/TicketTypes'
import type { FormData as TicketFormData } from '@/types/TicketTypes'
import { STAFF_ROLES } from '@/types/TicketTypes'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast, ToastContainer } from 'react-toastify'
import { ticketService } from '@/services/tickets.service'
import { productService } from '@/services/products.service'
import { clientService } from '@/services/clients.service'
import type { Client } from '@/types/clients'
import StepIndicator from './StepIndicator'
import RequestDetailsStep from './steps/RequestDetailsStep'
import TicketFormStep from './steps/TicketFormStep'
import UploadDocumentsStep from './steps/UploadDocumentsStep'
import ReviewSubmitStep from './steps/ReviewSubmitStep'

type Props = CreateTicketModalProps & { onTicketCreated?: (title: string, ticketCode?: string) => void }

const STEPS: StepDefinition[] = [
  { number: 1, label: 'Request Details' },
  { number: 2, label: 'Ticket Form' },
  { number: 3, label: 'Upload Documents' },
  { number: 4, label: 'Review & Submit' },
]

const EMPTY_FORM_DATA: TicketFormData = {
  title: '',
  description: '',
  product: '',
  priority: 'medium',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  client: '',
  clientId: '',
  clientCode: '',
  assignee: 'auto-assign',
  dueDate: '',
  estimatedTime: '',
  tags: '',
  internalNotes: '',
  category: '',
}

function CreateTicketModal({ isOpen, onClose, onTicketCreated }: Props) {
  const { data: session } = useSession()
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [loading, setLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [availableClients, setAvailableClients] = useState<Client[]>([])

  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [createdTicket, setCreatedTicket] = useState<CreatedTicketSummary | null>(null)

  const [formData, setFormData] = useState<TicketFormData>(EMPTY_FORM_DATA)

  const user = session?.user as SessionUser | undefined
  const isStaff = !!user?.role && STAFF_ROLES.includes(user.role)

  const priorityOptions: SelectOption[] = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
    { label: 'Critical', value: 'critical' },
  ]

  const [productOptions, setProductOptions] = useState<SelectOption[]>([
    { label: 'Select product', value: '' },
  ])

  useEffect(() => {
    const fetchClients = async () => {
      if (isAdmin) {
        try {
          const clients = await clientService.getAll()
          const activeClients = clients.filter(
            (client) => client.status === 'active'
          )
          setAvailableClients(activeClients)
        } catch {
          toast.error('Failed to fetch clients')
        }
      }
    }

    if (isOpen && session?.user) {
      const sessionUser = session.user as SessionUser
      const isUserAdmin = sessionUser.role === 'admin' || sessionUser.role === 'super_admin'
      setIsAdmin(isUserAdmin)

      if (!isUserAdmin && sessionUser) {
        let contactName = ''
        if (sessionUser.provider === 'google') {
          contactName = `${sessionUser.firstName || ''} ${sessionUser.lastName || ''}`.trim()
        }
        const companyName = sessionUser.client?.companyName || contactName

        setFormData((prev) => ({
          ...prev,
          client: companyName,
          clientId: sessionUser.client?.id || '',
          clientCode: sessionUser.client?.clientCode || '',
          contactName: contactName || companyName,
          contactEmail: sessionUser.email || '',
        }))
      } else if (isUserAdmin) {
        fetchClients()
      }
    }
  }, [isOpen, session, isAdmin])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await productService.getProductsByClient(
          formData.clientCode || undefined
        )
        const options = [
          { label: 'Select product', value: '' },
          ...(Array.isArray(products)
            ? products
                .filter((product) => product.status === 'active')
                .map((product) => ({
                  label: product.name || 'Unnamed Product',
                  value: product.id,
                }))
            : []),
        ]
        setProductOptions(options)
        setFormData((prev) => ({ ...prev, product: '' }))
      } catch {
        setProductOptions([{ label: 'Select product', value: '' }])
        setFormData((prev) => ({ ...prev, product: '' }))
      }
    }

    if (!isOpen) return

    if (!isAdmin || formData.clientCode) {
      // Non-admin: fetch using clientCode (or auth-based fallback when clientCode is empty)
      // Admin with client selected: fetch for that client
      fetchProducts()
    } else {
      // Admin with no client selected yet: clear products
      setProductOptions([{ label: 'Select product', value: '' }])
      setFormData((prev) => ({ ...prev, product: '' }))
    }
  }, [formData.clientCode, isAdmin, isOpen])

  const handleInputChange = (
    field: keyof TicketFormData,
    value: string
  ): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!formData.category) {
        toast.error('Please select a category')
        return false
      }
      if (isAdmin && !formData.clientId) {
        toast.error('Client selection is required')
        return false
      }
      if (!formData.product) {
        toast.error('Please select a product')
        return false
      }
      return true
    }

    if (step === 2) {
      if (!formData.title.trim()) {
        toast.error('Title is required')
        return false
      }
      if (!formData.description.trim()) {
        toast.error('Description is required')
        return false
      }
      if (isAdmin) {
        if (!formData.contactEmail) {
          toast.error('Contact email is required')
          return false
        }
        if (!formData.contactName) {
          toast.error('Contact name is required')
          return false
        }
      }
      return true
    }

    return true
  }

  const handleNext = (): void => {
    if (!validateStep(currentStep)) return
    setCompletedSteps((prev) => Array.from(new Set([...prev, currentStep])))
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length))
  }

  const handleBack = (): void => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleStepClick = (step: number): void => {
    if (submitted) return
    if (step === currentStep || completedSteps.includes(step)) {
      setCurrentStep(step)
    }
  }

  const resetAndClose = (): void => {
    setFormData(EMPTY_FORM_DATA)
    setUploadedFiles([])
    setCurrentStep(1)
    setCompletedSteps([])
    setSubmitted(false)
    setCreatedTicket(null)
    onClose()
  }

  const handleSubmit = async (): Promise<void> => {
    if (!validateStep(1) || !validateStep(2)) {
      return
    }

    setLoading(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('ticketCode', `TICKET-${Date.now()}`)
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('status', 'new')
      formDataToSend.append('priority', formData.priority)
      formDataToSend.append('contactName', formData.contactName)
      formDataToSend.append('contactEmail', formData.contactEmail)
      formDataToSend.append('contactPhone', formData.contactPhone)
      formDataToSend.append('clientId', formData.clientId)
      formDataToSend.append('clientCode', formData.clientCode)
      if (formData.product) {
        formDataToSend.append('product', formData.product)
      }
      if (formData.dueDate) formDataToSend.append('dueDate', formData.dueDate)
      if (uploadedFiles.length > 0) {
        uploadedFiles.forEach((fileItem) => {
          formDataToSend.append('files', fileItem.file)
        })
      }
      formDataToSend.append('estimatedTime', formData.estimatedTime)
      formDataToSend.append('internalNotes', formData.internalNotes)

      const extraTags = formData.tags
        ? formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : []
      const allTags = Array.from(new Set([formData.category, ...extraTags].filter(Boolean)))
      formDataToSend.append('tags', allTags.join(', '))

      const result = await ticketService.createTicket(formDataToSend)
      const ticketData = result?.data || result
      const createdCode = ticketData?.ticketCode

      const assignedUser = ticketData?.UserTickets?.[0]?.user
      const assigneeName = assignedUser
        ? `${assignedUser.firstName || ''} ${assignedUser.lastName || ''}`.trim()
        : ticketData?.assignee && ticketData.assignee !== 'auto-assign'
          ? ticketData.assignee
          : 'Unassigned'

      setCreatedTicket({
        status: ticketData?.status || 'new',
        title: ticketData?.title || formData.title,
        description: ticketData?.description || formData.description,
        assignee: assigneeName,
        priorityScore: ticketData?.priorityScore,
        confidence: ticketData?.confidence,
        llmReasoning: ticketData?.llmReasoning,
        agingScore: ticketData?.agingScore,
      })
      setSubmitted(true)
      setCompletedSteps([1, 2, 3, 4])
      toast.success('Ticket created successfully!')

      if (onTicketCreated) onTicketCreated(formData.title, createdCode)
    } catch (error: unknown) {
      const err = error as ApiError
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message)
      } else {
        toast.error('Failed to create ticket. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const files = event.target.files
    if (files) {
      const maxFileSize = 2 * 1024 * 1024 // 2MB
      const validFiles: UploadedFile[] = []
      const invalidFiles: string[] = []

      const allowedTypes = [/^image\//, 'video/mp4', 'application/pdf']

      Array.from(files).forEach((file) => {
        const isValidType = allowedTypes.some((type) => {
          if (type instanceof RegExp) {
            return type.test(file.type)
          }
          return file.type === type
        })

        if (!isValidType) {
          invalidFiles.push(`${file.name} (invalid file type)`)
        } else if (file.size > maxFileSize) {
          invalidFiles.push(`${file.name} (too large)`)
        } else {
          validFiles.push({
            file,
            name: file.name,
          })
        }
      })

      if (invalidFiles.length > 0) {
        toast.error(
          `The selected files are invalid or too large: ${invalidFiles.join(
            ', '
          )}`
        )
      }

      if (validFiles.length > 0) {
        setUploadedFiles((prev) => [...prev, ...validFiles])
      }
    }

    event.target.value = ''
  }

  const removeFile = (index: number): void => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  if (!isOpen) return null

  return (
    <>
      <ToastContainer />
      <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-full sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b border-gray-200 gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Create New Ticket
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Fill in the details to create a new support ticket.
              </p>
            </div>
            <button
              onClick={resetAndClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <StepIndicator
            steps={STEPS}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={handleStepClick}
          />

          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {currentStep === 1 && (
                <RequestDetailsStep
                  formData={formData}
                  handleInputChange={handleInputChange}
                  productOptions={productOptions}
                  priorityOptions={priorityOptions}
                  isAdmin={isAdmin}
                  availableClients={availableClients}
                  setFormData={setFormData}
                />
              )}

              {currentStep === 2 && (
                <TicketFormStep
                  formData={formData}
                  handleInputChange={handleInputChange}
                  isAdmin={isAdmin}
                  setFormData={setFormData}
                />
              )}

              {currentStep === 3 && (
                <UploadDocumentsStep
                  uploadedFiles={uploadedFiles}
                  handleFileUpload={handleFileUpload}
                  removeFile={removeFile}
                />
              )}

              {currentStep === 4 && (
                <ReviewSubmitStep
                  formData={formData}
                  uploadedFiles={uploadedFiles}
                  productOptions={productOptions}
                  isAdmin={isAdmin}
                  isStaff={isStaff}
                  loading={loading}
                  submitted={submitted}
                  createdTicket={createdTicket}
                  onSubmit={handleSubmit}
                />
              )}
            </div>
          </div>

          <div className="flex justify-between gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <div>
              {currentStep > 1 && !submitted && (
                <button
                  onClick={handleBack}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                >
                  Back
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={resetAndClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
              >
                {submitted ? 'Close' : 'Cancel'}
              </button>
              {!submitted && currentStep < STEPS.length && (
                <button
                  onClick={handleNext}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CreateTicketModal
