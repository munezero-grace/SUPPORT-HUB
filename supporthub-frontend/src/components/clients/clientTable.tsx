'use client'

import ClientListItem from './ClientListItem'
import { Client } from '../../types/clients'

interface ClientTableProps {
  clients: Client[]
  searchQuery: string
}

export function ClientTable({ clients, searchQuery }: ClientTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="p-4 text-left text-sm font-medium text-gray-500">
              ID
            </th>
            <th className="p-4 text-left text-sm font-medium text-gray-500">
              Company Name
            </th>
            <th className="p-4 text-left text-sm font-medium text-gray-500">
              Contact
            </th>
            <th className="p-4 text-left text-sm font-medium text-gray-500">
              Products
            </th>
            <th className="p-4 text-left text-sm font-medium text-gray-500">
              Support Tier
            </th>
            <th className="p-4 text-left text-sm font-medium text-gray-500">
              Active Tickets
            </th>
            <th className="p-4 text-left text-sm font-medium text-gray-500">
              Status
            </th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {clients.map((client) => (
            <ClientListItem key={client.id} client={client} />
          ))}
          {clients.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                {searchQuery
                  ? 'No clients found matching your search'
                  : 'No clients found. Add your first client!'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
