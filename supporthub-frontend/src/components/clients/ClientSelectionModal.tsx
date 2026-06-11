'use client'

import { useState, useEffect } from 'react'
import { Client } from '@/types/clients'
import { clientService } from '@/services/clients.service'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { ClientSelectionModalProps } from '@/types/interfaces/Props'

export default function ClientSelectionModal({
  isOpen,
  onClose,
  onSelectClient,
  onRemoveClient,
  selectedClientIds,
}: ClientSelectionModalProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      clientService
        .getAll()
        .then((data) => {
          setClients(data)
        })
        .finally(() => setLoading(false))
    }
  }, [isOpen])

  const toggleClientSelection = (client: Client) => {
    const clientId = client.id.toString()
    if (!selectedClientIds.includes(clientId)) {
      onSelectClient(client)
    } else {
      if (onRemoveClient) {
        onRemoveClient(client)
      }
    }
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Select Clients">
      {loading ? (
        <div>Loading clients...</div>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr>
              <th>Client Code</th>
              <th>Company Name</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Select</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => {
              const isSelected = selectedClientIds.includes(
                client.id.toString()
              )
              return (
                <tr
                  key={client.id}
                  className={
                    isSelected
                      ? 'bg-blue-100 cursor-pointer'
                      : 'hover:bg-gray-100 cursor-pointer'
                  }
                  onClick={() => toggleClientSelection(client)}
                >
                  <td className="p-2">{client.clientCode}</td>
                  <td className="p-2">{client.companyName}</td>
                  <td className="p-2">{client.user.firstName}</td>
                  <td className="p-2">{client.status}</td>
                  <td className="p-2">
                    {isSelected && (
                      <span className="text-blue-600 font-bold">✓ Linked</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </Dialog>
  )
}
