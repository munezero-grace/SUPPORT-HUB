import React from 'react'
import { TicketFormStepProps } from '@/types/TicketTypes'
import ClientInfo from '../ClientInfo'
import Advanced from '../Advanced'

function TicketFormStep({ formData, handleInputChange, isAdmin, setFormData }: TicketFormStepProps) {
  return (
    <div className="space-y-6">
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

      <div className="pt-2 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 mt-4">Contact Information</h3>
        <ClientInfo formData={formData} handleInputChange={handleInputChange} isAdmin={isAdmin} availableClients={[]} setFormData={setFormData} />
      </div>

      {isAdmin && (
        <div className="pt-2 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 mt-4">Advanced Options</h3>
          <Advanced formData={formData} handleInputChange={handleInputChange} isAdmin={isAdmin} />
        </div>
      )}
    </div>
  )
}

export default TicketFormStep
