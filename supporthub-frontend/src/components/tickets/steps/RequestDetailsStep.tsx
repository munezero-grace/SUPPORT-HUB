import React from 'react'
import { CATEGORY_OPTIONS, RequestDetailsStepProps } from '@/types/TicketTypes'

function RequestDetailsStep({
  formData,
  handleInputChange,
  productOptions,
  priorityOptions,
  isAdmin,
  availableClients,
  setFormData,
}: RequestDetailsStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category *
        </label>
        <select
          value={formData.category || ''}
          onChange={(e) => handleInputChange('category', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Choose the category that best describes this request
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Client
        </label>
        {isAdmin ? (
          <select
            value={formData.clientId}
            onChange={(e) => {
              const selectedClient = availableClients.find(
                (c) => c.id === e.target.value
              )
              if (selectedClient) {
                setFormData((prev) => ({
                  ...prev,
                  clientId: selectedClient.id,
                  clientCode: selectedClient.clientCode,
                  client: selectedClient.companyName,
                  contactName:
                    selectedClient.user.firstName +
                    ' ' +
                    (selectedClient.user.lastName || ''),
                  contactEmail: selectedClient.user.email,
                  product: '',
                }))
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
          >
            <option value="">Select a client</option>
            {availableClients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.companyName}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={formData.client}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
          />
        )}
        <p className="text-xs text-gray-500 mt-1">
          {isAdmin
            ? 'Select the client for this ticket'
            : 'This field is automatically populated from your account'}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
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
        {isAdmin && (
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  )
}

export default RequestDetailsStep
