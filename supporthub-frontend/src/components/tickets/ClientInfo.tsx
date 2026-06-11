import React from 'react'
import { ClientInfoProps } from '@/types/TicketTypes'

function ClientInfo({
    formData,
    handleInputChange,
    isAdmin
}: ClientInfoProps) {
    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name
                </label>
                <input
                    type="text"
                    placeholder={isAdmin ? "Enter contact name" : ""}
                    value={formData.contactName}
                    readOnly={!isAdmin}
                    onChange={(e) => isAdmin && handleInputChange('contactName', e.target.value)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md ${isAdmin
                            ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            : 'bg-gray-100 cursor-not-allowed'
                        } transition-colors`}
                />
                <p className="text-xs text-gray-500 mt-1">
                    {isAdmin ? "Primary contact person for this ticket" : "Your name from your account"}
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email
                </label>
                <input
                    type="email"
                    placeholder={isAdmin ? "Enter contact email" : ""}
                    value={formData.contactEmail}
                    readOnly={!isAdmin}
                    onChange={(e) => isAdmin && handleInputChange('contactEmail', e.target.value)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md ${isAdmin
                            ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            : 'bg-gray-100 cursor-not-allowed'
                        } transition-colors`}
                />
                <p className="text-xs text-gray-500 mt-1">
                    {isAdmin ? "Contact email for this ticket" : "Your email address from your account"}
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone (Optional)
                </label>
                <input
                    type="tel"
                    placeholder="+250 788 123 456"
                    value={formData.contactPhone}
                    onChange={(e) =>
                        handleInputChange('contactPhone', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
            </div>
        </div>
    )
}

export default ClientInfo