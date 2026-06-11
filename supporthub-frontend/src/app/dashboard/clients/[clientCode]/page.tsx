'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline'
import { SupportTier, Status } from '@/types/clients'
import { clientService } from '@/services/clients.service'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { UsersIcon } from '@heroicons/react/24/outline'
import { ClientFormModal } from '@/components/clients/ClientFormModal'
import { toast } from 'react-toastify'
import type { ClientFormData } from '@/validations/clientSchema'
import type { UpdateClientDto } from '@/types/clients'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export default function ClientDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const clientCode = Array.isArray(params?.clientCode)
    ? params.clientCode[0]
    : params?.clientCode || ''
  const queryClient = useQueryClient()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const {
    data: client,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['client', clientCode],
    queryFn: () => clientService.getById(clientCode),
    enabled: !!clientCode,
  })

  const updateClientMutation = useMutation({
    mutationFn: async (formData: ClientFormData) => {
      const updateData: UpdateClientDto = {
        companyName: formData.companyName,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        supportTier: formData.supportTier as SupportTier,
        status: formData.status as Status,
      }
      await clientService.update(client?.clientCode || '', updateData)
      return clientService.getById(client?.clientCode || '')
    },
    onSuccess: (updatedClient) => {
      queryClient.setQueryData(['client', params.clientCode], updatedClient)
      toast.success('Client updated successfully')
      setIsEditModalOpen(false)
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err?.response?.data?.message || 'Error updating client')
    },
  })

  const handleEditSubmit = (formData: ClientFormData) => {
    updateClientMutation.mutate(formData)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">Loading...</div>
    )
  }

  if (isError || !client) {
    return (
      <div className="flex justify-center items-center h-96">
        Client not found
      </div>
    )
  }

  return (
    <div className="px-1 py-2 space-y-6">
      <div className="flex items-center mb-6 gap-2">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/clients')}
          className="flex items-center text-black hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex text-gray-900 items-center gap-4">
            {' '}
            {client.clientCode}
          </h1>
        </div>
        <Button
          variant="outline"
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center gap-2 text-gray-900"
        >
          <PencilIcon className="h-4 w-4 text-gray-900" />
          Edit Client
        </Button>
      </div>

      <ClientFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
        }}
        onSubmit={handleEditSubmit}
        initialData={{
          companyName: client.companyName,
          contactName: client.user.firstName,
          contactEmail: client.user.email,
          supportTier: client.supportTier,
          status: client.status,
        }}
        title="Edit Client"
      />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Contact Information
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Primary Contact
              </p>
              <p className="font-sm text-gray-600">
                {client.user.firstName} {client.user.lastName}
              </p>
              <p className="text-gray-600">{client.user.email}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Company Details
              </p>
              <p className="font-sm text-gray-600">{client.companyName}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Client Since
              </p>
              <p className="text-gray-600">
                {new Date(client.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex  justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Assigned Products
            </h3>
          </div>
          <div className="space-y-4">
            {client.clientProducts && client.clientProducts.length > 0 ? (
              client.clientProducts.map((cp) => (
                <div
                  key={cp.id}
                  className="flex items-center justify-between p-3 bg-gray-100  rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {cp.product?.name || 'Unknown Product'}{' '}
                      {cp.product?.productCode}
                    </p>
                  </div>
                  <Badge
                    variant={
                      cp.product?.status === 'active' ? 'success' : 'error'
                    }
                  >
                    {cp.product?.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                No products assigned
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <h3 className="text-sm font-medium text-gray-500">Active Products</h3>
          <div className="flex items-center mt-2">
            <UsersIcon className="w-5 h-5 text-gray-900 mr-2" />{' '}
            <span className="text-xl font-bold text-gray-900">
              {client.clientProducts?.filter(
                (cp) => cp.product?.status === 'active'
              ).length || 0}
            </span>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-medium text-gray-500">Support Tier</h3>
          <div className="flex items-center mt-2">
            <Badge
              variant={client.supportTier === 'premium' ? 'warning' : 'default'}
              className="text-sm"
            >
              {client.supportTier}
            </Badge>
          </div>
        </Card>
      </div>
    </div>
  )
}
