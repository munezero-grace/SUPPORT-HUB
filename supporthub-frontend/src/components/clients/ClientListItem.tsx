'use client'

import { Client } from '@/types/clients'
import ActionMenu from './ActionMenu'
import { UserCircleIcon } from '@heroicons/react/24/solid'
import { Badge } from '@/components/ui/Badge'
import { FC, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import axiosInstance from '@/services/axios-instance.service'

interface ClientListItemProps {
  client: Client
  onStatusChange?: () => void
  onManageProducts?: () => void
}

const ClientListItem: FC<ClientListItemProps> = ({
  client,
  onStatusChange,
  onManageProducts,
}) => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const toggleClientStatus = async () => {
    setIsLoading(true)

    try {
      await axiosInstance.patch(`/clients/${client.id}/status`)

      const updatedStatus = client.status === 'active' ? 'inactive' : 'active'

      toast.success(
        updatedStatus === 'active' ? 'Client activated' : 'Client deactivated'
      )

      if (onStatusChange) onStatusChange()

      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error('Failed to update status')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <tr className="text-sm font-medium text-black hover:bg-gray-50">
      <td className="p-4">{client.clientCode}</td>
      <td className="p-4">
        <div className="flex items-center">
          <UserCircleIcon className="h-6 w-6 text-gray-500 mr-2" />
          {client.companyName}
        </div>
      </td>
      <td className="p-4">
        <div>{client.user.firstName}</div>
        <div className="text-gray-500">{client.user.email}</div>
      </td>
      <td className="p-4">
        <div className="flex flex-col gap-1">
          {client.clientProducts &&
            client.clientProducts.map((cp) => (
              <Badge
                key={cp.id}
                variant="default"
                className="capitalize font-bold bg-white/90"
              >
                {cp.product?.name || 'Unknown Product'}
              </Badge>
            ))}
          {!client.clientProducts?.length && (
            <Badge variant="default" className="font-bold  bg-white/90">
              No products
            </Badge>
          )}
        </div>
      </td>
      <td className="p-4">
        <span title="Used for future SLA and enterprise feature segmentation. Not a billing indicator.">
          <Badge
            variant={client.supportTier === 'premium' ? 'warning' : 'default'}
          >
            {client.supportTier === 'premium' ? 'Enterprise' : 'Standard'}
          </Badge>
        </span>
      </td>
      <td className="p-4">{client.activeTickets ?? 0}</td>
      <td className="p-4">
        <button
          onClick={toggleClientStatus}
          disabled={isLoading}
          className="cursor-pointer"
        >
          <Badge
            variant={client.status === 'active' ? 'success' : 'default'}
            className={isLoading ? 'opacity-50' : ''}
          >
            {isLoading ? 'Updating...' : client.status}
          </Badge>
        </button>
      </td>

      <td className="p-4">
        <ActionMenu
          items={[
            {
              label: 'View Details',
              onClick: () => router.push(`/clients/${client.id}`),
            },
            {
              label: 'Edit Client',
              onClick: () => router.push(`/clients/${client.id}/edit`),
            },
            {
              label: 'Manage Products',
              onClick: () => {
                if (onManageProducts) onManageProducts()
              },
            },
            {
              label: 'View Tickets',
              onClick: () => router.push(`/dashboard/tickets?client=${client.clientCode}`),
            },
            {
              label:
                client.status === 'active'
                  ? 'Deactivate Client'
                  : 'Activate Client',
              onClick: toggleClientStatus,
            },
          ]}
        />
      </td>
    </tr>
  )
}

export default ClientListItem
