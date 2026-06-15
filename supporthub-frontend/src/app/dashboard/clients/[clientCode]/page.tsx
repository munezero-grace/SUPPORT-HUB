'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { ArrowLeftIcon, PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline'
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
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { productsService } from '@/services/products.service'
import { ticketService } from '@/services/tickets.service'

const OPEN_STATUSES = ['new', 'in_progress', 'assigned', 'awaiting_client']

export default function ClientDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const clientCode = Array.isArray(params?.clientCode)
    ? params.clientCode[0]
    : params?.clientCode || ''
  const queryClient = useQueryClient()
  const { user } = useCurrentUser()
  const canManageProducts =
    user?.role === 'super_admin' || user?.role === 'ticket_manager'

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState<{
    productId: string
    name: string
    code: string
    openTickets: number
  } | null>(null)
  const [selectedProductToAdd, setSelectedProductToAdd] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [checkingTickets, setCheckingTickets] = useState(false)

  const {
    data: client,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['client', clientCode],
    queryFn: () => clientService.getById(clientCode),
    enabled: !!clientCode,
  })

  const { data: allProducts = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsService.getAll(),
    enabled: canManageProducts,
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

  const handleRemoveClick = async (
    productId: string,
    name: string,
    code: string
  ) => {
    setCheckingTickets(true)
    try {
      const tickets = await ticketService.getUserTickets()
      const openTickets = Array.isArray(tickets)
        ? tickets.filter((t) => {
            const tProduct =
              t.product && typeof t.product === 'object' ? t.product : null
            const tClient =
              t.client && typeof t.client === 'object' ? t.client : null
            return (
              tProduct?.id === productId &&
              tClient?.id === client?.id &&
              OPEN_STATUSES.includes(t.status)
            )
          }).length
        : 0
      setConfirmRemove({ productId, name, code, openTickets })
    } catch {
      // If ticket fetch fails, still allow removal with no count shown
      setConfirmRemove({ productId, name, code, openTickets: 0 })
    } finally {
      setCheckingTickets(false)
    }
  }

  const handleConfirmRemove = async () => {
    if (!confirmRemove || !client) return
    setIsRemoving(true)
    try {
      await clientService.removeProductFromClient(client.id, confirmRemove.productId)
      queryClient.invalidateQueries({ queryKey: ['client', clientCode] })
      toast.success(`${confirmRemove.name} removed`)
      setConfirmRemove(null)
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err?.response?.data?.message || 'Failed to remove product')
    } finally {
      setIsRemoving(false)
    }
  }

  const handleAddProduct = async () => {
    if (!selectedProductToAdd || !client) return
    setIsAdding(true)
    try {
      await clientService.addProductToClient(client.id, selectedProductToAdd)
      queryClient.invalidateQueries({ queryKey: ['client', clientCode] })
      toast.success('Product added successfully')
      setSelectedProductToAdd('')
    } catch {
      toast.error('Failed to add product')
    } finally {
      setIsAdding(false)
    }
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

  const assignedProductIds = new Set(
    client.clientProducts?.map((cp) => cp.product?.id).filter(Boolean) ?? []
  )
  const availableToAdd = allProducts.filter(
    (p) => !assignedProductIds.has(p.id) && p.status === 'active'
  )

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
        {/* Contact Information */}
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

        {/* Assigned Products — interactive for admins */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Assigned Products
            </h3>
          </div>

          <div className="space-y-3">
            {client.clientProducts && client.clientProducts.length > 0 ? (
              client.clientProducts.map((cp) => (
                <div
                  key={cp.id}
                  className="flex items-center justify-between p-3 bg-gray-100 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {cp.product?.name || 'Unknown Product'}{' '}
                      <span className="text-gray-500 font-normal text-sm">
                        {cp.product?.productCode}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        cp.product?.status === 'active' ? 'success' : 'error'
                      }
                    >
                      {cp.product?.status}
                    </Badge>
                    {canManageProducts && cp.product && (
                      <button
                        onClick={() =>
                          handleRemoveClick(
                            cp.product!.id,
                            cp.product!.name,
                            cp.product!.productCode
                          )
                        }
                        disabled={checkingTickets}
                        title="Remove product"
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-40"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                No products assigned
              </p>
            )}
          </div>

          {canManageProducts && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Add Product
              </p>
              <div className="flex gap-2">
                <select
                  value={selectedProductToAdd}
                  onChange={(e) => setSelectedProductToAdd(e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  <option value="">Select a product…</option>
                  {availableToAdd.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.productCode})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddProduct}
                  disabled={!selectedProductToAdd || isAdding}
                  className="flex items-center gap-1 px-3 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  <PlusIcon className="h-4 w-4" />
                  {isAdding ? 'Adding…' : 'Add'}
                </button>
              </div>
              {availableToAdd.length === 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  All active products are already assigned
                </p>
              )}
            </div>
          )}
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
          <h3 className="text-sm font-medium text-gray-500">Client Type</h3>
          <div className="flex items-center mt-2">
            <span title="Used for future SLA and enterprise feature segmentation. Not a billing indicator.">
              <Badge
                variant={client.supportTier === 'premium' ? 'warning' : 'default'}
                className="text-sm"
              >
                {client.supportTier === 'premium' ? 'Enterprise' : 'Standard'}
              </Badge>
            </span>
          </div>
        </Card>
      </div>

      {/* Remove confirmation dialog */}
      {confirmRemove && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-3">
              Remove {confirmRemove.name}?
            </h2>
            {confirmRemove.openTickets > 0 ? (
              <p className="text-sm text-red-700 mb-5">
                This product has{' '}
                <strong>{confirmRemove.openTickets}</strong> open ticket
                {confirmRemove.openTickets !== 1 ? 's' : ''}. Are you sure
                you want to remove it?
              </p>
            ) : (
              <p className="text-sm text-gray-600 mb-5">
                Are you sure you want to remove{' '}
                <strong>{confirmRemove.name}</strong> ({confirmRemove.code})
                from this client?
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmRemove(null)}
                disabled={isRemoving}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRemove}
                disabled={isRemoving}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-40"
              >
                {isRemoving ? 'Removing…' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
