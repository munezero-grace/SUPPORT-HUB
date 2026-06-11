'use client'
import type {
  CreateTicketModalProps,
  SessionUser,
  ApiError,
  UploadedFile,
  SelectOption,
} from '@/types/TicketTypes'
import type { FormData as TicketFormData } from '@/types/TicketTypes'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast, ToastContainer } from 'react-toastify'
import { ticketService } from '@/services/tickets.service'
import { productService } from '@/services/products.service'
import { clientService } from '@/services/clients.service'
import type { Client } from '@/types/clients'
import TicketDetails from './TicketDetails'
import ClientInfo from './ClientInfo'
import Advanced from './Advanced'

type Props = CreateTicketModalProps & { onTicketCreated?: (title: string, ticketCode?: string) => void }

function CreateTicketModal({ isOpen, onClose, onTicketCreated }: Props) {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<
    'ticketDetails' | 'clientInfo' | 'advanced'
  >('ticketDetails')
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [loading, setLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [availableClients, setAvailableClients] = useState<Client[]>([])

  const [formData, setFormData] = useState<TicketFormData>({
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
  })

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
    if (isOpen && session?.user) {
      const user = session.user as SessionUser
      const isUserAdmin = user.role === 'admin' || user.role === 'super_admin'
      setIsAdmin(isUserAdmin)

      if (!isUserAdmin && user) {
        let contactName = ''
        if (user.provider === 'google') {
          contactName = `${user.firstName || ''} ${user.lastName || ''}`.trim()
        }
        const companyName = user.client?.companyName || contactName

        setFormData((prev) => ({
          ...prev,
          client: companyName,
          clientId: user.client?.id || '',
          clientCode: user.client?.clientCode || '',
          contactName: contactName || companyName,
          contactEmail: user.email || '',
        }))
      } else if (isUserAdmin) {
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

        fetchClients()
      }
    }
  }, [isOpen, session, isAdmin])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (!isAdmin && formData.clientCode) {
          const products = await productService.getProductsByClient(
            formData.clientCode
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
          return
        }

        if (isAdmin && formData.clientCode) {
          const products = await productService.getProductsByClient(
            formData.clientCode
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
          return
        }
        setProductOptions([{ label: 'Select product', value: '' }])
        setFormData((prev) => ({ ...prev, product: '' }))
      } catch {
        setProductOptions([{ label: 'Select product', value: '' }])
        setFormData((prev) => ({ ...prev, product: '' }))
      }
    }

    if (isOpen) {
      fetchProducts()
    }
  }, [formData.clientCode, isAdmin, isOpen])

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
      const user = session.user as SessionUser
      const isUserAdmin = user.role === 'admin' || user.role === 'super_admin'
      setIsAdmin(isUserAdmin)

      if (!isUserAdmin && user) {
        let contactName = ''
        if (user.provider === 'google') {
          contactName = `${user.firstName || ''} ${user.lastName || ''}`.trim()
        }
        const companyName = user.client?.companyName || contactName

        setFormData((prev) => ({
          ...prev,
          client: companyName,
          clientId: user.client?.id || '',
          clientCode: user.client?.clientCode || '',
          contactName: contactName || companyName,
          contactEmail: user.email || '',
        }))
      } else if (isUserAdmin) {
        fetchClients()
      }
    }
  }, [isOpen, session, isAdmin])

  const handleInputChange = (
    field: keyof TicketFormData,
    value: string
  ): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast.error('Title is required')
      return false
    }
    if (!formData.description.trim()) {
      toast.error('Description is required')
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

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
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
      formDataToSend.append('tags', formData.tags || '')

      const result = await ticketService.createTicket(formDataToSend)
      const createdTitle = formData.title
      const createdCode = result?.ticketCode || result?.data?.ticketCode
      toast.success('Ticket created successfully!')

      setFormData({
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
      })
      setUploadedFiles([])

      if (onTicketCreated) onTicketCreated(createdTitle, createdCode)
      setTimeout(() => {
        onClose()
      }, 1500)
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
              onClick={onClose}
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

          {!isAdmin ? (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  placeholder="Brief description of the issue"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  placeholder="Detailed description of the issue"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
                  rows={5}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product *
                </label>
                <select
                  value={formData.product}
                  onChange={(e) => handleInputChange('product', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                >
                  {productOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments (optional)
                </label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('file-upload-client')?.click()}
                >
                  <div className="text-sm text-gray-600">Click to upload files</div>
                  <div className="text-xs text-gray-500 mt-1">Max 2MB · Images, PDFs, MP4</div>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf"
                  className="hidden"
                  id="file-upload-client"
                  onChange={handleFileUpload}
                />
                {uploadedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {uploadedFiles.map((fileItem, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                        <span className="text-sm text-gray-600 truncate">{fileItem.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 ml-2 text-lg leading-none"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="flex border-b border-gray-200 flex-col sm:flex-row">
                <button
                  className={`flex-1 py-3 px-4 text-sm font-medium relative transition-colors ${
                    activeTab === 'ticketDetails'
                      ? 'text-gray-900 bg-white'
                      : 'text-gray-500 bg-gray-50 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('ticketDetails')}
                >
                  Ticket Details
                  {activeTab === 'ticketDetails' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-500"></div>
                  )}
                </button>
                <button
                  className={`flex-1 py-3 px-4 text-sm font-medium relative transition-colors ${
                    activeTab === 'clientInfo'
                      ? 'text-gray-900 bg-white'
                      : 'text-gray-500 bg-gray-50 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('clientInfo')}
                >
                  Client Info
                  {activeTab === 'clientInfo' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-500"></div>
                  )}
                </button>
                <button
                  className={`flex-1 py-3 px-4 text-sm font-medium relative transition-colors ${
                    activeTab === 'advanced'
                      ? 'text-gray-900 bg-white'
                      : 'text-gray-500 bg-gray-50 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('advanced')}
                >
                  Advanced
                  {activeTab === 'advanced' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-500"></div>
                  )}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  {activeTab === 'ticketDetails' && (
                    <TicketDetails
                      formData={formData}
                      handleInputChange={handleInputChange}
                      productOptions={productOptions}
                      priorityOptions={priorityOptions}
                      uploadedFiles={uploadedFiles}
                      handleFileUpload={handleFileUpload}
                      removeFile={removeFile}
                      isAdmin={isAdmin}
                      availableClients={availableClients}
                      setFormData={setFormData}
                    />
                  )}

                  {activeTab === 'clientInfo' && (
                    <ClientInfo
                      formData={formData}
                      handleInputChange={handleInputChange}
                      isAdmin={isAdmin}
                      availableClients={availableClients}
                      setFormData={setFormData}
                    />
                  )}

                  {activeTab === 'advanced' && (
                    <Advanced
                      formData={formData}
                      handleInputChange={handleInputChange}
                      isAdmin={isAdmin}
                    />
                  )}
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                loading ||
                !formData.title ||
                !formData.description ||
                !formData.product
              }
              className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default CreateTicketModal
