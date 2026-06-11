'use client'

import { useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import SearchAndFilters from '@/components/shared/SearchAndFilters'
import { AddClientButton } from '@/components/clients/AddClientButton'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import ProductSelectionModal from '@/components/products/ProductSelectionModal'
import type { ClientFormData } from '@/validations/clientSchema'
import type { UpdateClientDto } from '@/types/clients'
import { FilterModal } from '@/components/shared/FilterModal'
import { filterFields } from '@/constants/filterConfig'
import { toast } from 'react-toastify'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { ActionMenu } from '@/components/ui/ActionMenu'
import { useRouter } from 'next/navigation'
import { UserCircleIcon } from '@heroicons/react/24/solid'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { clientService } from '@/services/clients.service'
import { ClientFormModal } from '@/components/clients/ClientFormModal'
import { productService } from '@/services/products.service'
import { Client, SupportTier, Status } from '@/types/clients'
import { Product } from '@/types/interfaces/product'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/hooks/useQueries'
import { Pagination } from '@/components/ui/Pagination'

const PAGE_SIZE = 10

export default function ClientsPage() {
  const { data: session } = useSession()
  const isSuperAdmin = session?.user?.role === 'super_admin'
  const router = useRouter()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [filterValues, setFilterValues] = useState({
    status: '',
    supportTier: '',
  })
  const [currentPage, setCurrentPage] = useState(1)

  const {
    data: clients,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.clients,
    queryFn: clientService.getAll,
  })

  const handleFilterChange = (name: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleApplyFilters = () => {
    setIsFilterModalOpen(false)
  }

  const filteredClients = useMemo(
    () =>
      (Array.isArray(clients) ? clients : []).filter(
        (client) =>
          (client.companyName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
            client.clientCode
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) &&
          (filterValues.status
            ? client.status === filterValues.status
            : true) &&
          (filterValues.supportTier
            ? client.supportTier === filterValues.supportTier
            : true)
      ),
    [clients, searchQuery, filterValues]
  )

  const sortedClients = useMemo(
    () =>
      filteredClients.slice().sort((a, b) => {
        const aNum = parseInt(a.clientCode.replace(/\D/g, ''))
        const bNum = parseInt(b.clientCode.replace(/\D/g, ''))
        return aNum - bNum
      }),
    [filteredClients]
  )

  const totalPages = Math.max(1, Math.ceil(sortedClients.length / PAGE_SIZE))
  const paginatedClients = sortedClients.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const handleManageProducts = (client: Client) => {
    setSelectedClient(client)
    setIsProductModalOpen(true)
  }

  const handleEditClient = (client: Client) => {
    setSelectedClient(client)
    setIsEditModalOpen(true)
  }

  const handleEditSubmit = async (formData: ClientFormData) => {
    if (!selectedClient) return

    const updateData: UpdateClientDto = {
      companyName: formData.companyName,
      contactName: formData.contactName,
      contactEmail: formData.contactEmail,
      supportTier: formData.supportTier as SupportTier,
      status: formData.status as Status,
    }

    // Immediately update the cache so the table reflects the change at once
    const previousClients = queryClient.getQueryData<Client[]>(queryKeys.clients)
    queryClient.setQueryData<Client[]>(queryKeys.clients, (old) =>
      (old ?? []).map((c) =>
        c.id === selectedClient.id ? { ...c, ...updateData } : c
      )
    )

    setIsEditModalOpen(false)
    setSelectedClient(null)

    try {
      await clientService.update(selectedClient.id, updateData)
      toast.success('Client updated successfully')
      refetch()
    } catch (error) {
      // Roll back the optimistic update on failure
      queryClient.setQueryData(queryKeys.clients, previousClients)
      console.error('Error updating client:', error)
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err?.response?.data?.message || 'Error updating client')
    }
  }

  const handleRemoveProduct = async (product: Product) => {
    if (!selectedClient) return

    try {
      await productService.removeClientFromProduct(
        String(product.id),
        selectedClient.id
      )
      refetch()
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } }
        message?: string
      }
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Error removing product'
      toast.error(errorMessage)
    }
  }

  const handleDeleteClient = async () => {
    if (!selectedClient) return

    try {
      await clientService.softDelete(selectedClient.id)
      toast.success('Client deleted successfully')
      setIsDeleteModalOpen(false)
      setSelectedClient(null)
      refetch()
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } }
        message?: string
      }
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Error deleting client'
      toast.error(errorMessage)
    }
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Error loading clients: {error.message}
      </div>
    )
  }

  const columns = [
    {
      header: 'ID',
      accessor: (client: Client) => client.clientCode,
    },
    {
      header: 'Company Name',
      accessor: (client: Client) => (
        <div className="flex items-center">
          <UserCircleIcon className="h-6 w-6 text-gray-500 mr-2" />
          {client.companyName}
        </div>
      ),
    },
    {
      header: 'Contact',
      accessor: (client: Client) => (
        <div>
          <div className="text-gray-500">{client.user.email}</div>
        </div>
      ),
    },
    {
      header: 'Products',
      wrap: true,
      accessor: (client: Client) => (
        <div className="flex flex-wrap gap-1 max-w-[220px]">
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
            <Badge variant="default" className="font-bold bg-white/90">
              No products
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: 'Support Tier',
      accessor: (client: Client) => (
        <Badge
          variant={client.supportTier === 'premium' ? 'warning' : 'default'}
          className={
            client.supportTier === 'premium' ? 'bg-black text-white' : ''
          }
        >
          {client.supportTier.charAt(0).toUpperCase() +
            client.supportTier.slice(1)}
        </Badge>
      ),
    },
    {
      header: 'Active Tickets',
      accessor: (client: Client) => client.activeTickets ?? 0,
    },
    {
      header: 'Status',
      accessor: (client: Client) => (
        <Badge
          variant={client.status === 'active' ? 'success' : 'error'}
          className={
            client.status === 'active' ? 'bg-green-500 text-white' : ''
          }
        >
          {client.status}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: (client: Client) => (
        <ActionMenu
          items={[
            {
              label: 'View Details',
              onClick: () => router.push(`/dashboard/clients/${client.id}`),
            },
            ...(isSuperAdmin ? [
              {
                label: 'Edit Client',
                onClick: () => handleEditClient(client),
              },
              {
                label: 'Manage Products',
                onClick: () => handleManageProducts(client),
              },
            ] : []),
            {
              label: 'View Tickets',
              onClick: () =>
                router.push(`/dashboard/clients/${client.id}/tickets`),
            },
            ...(isSuperAdmin ? [
              {
                label: 'Delete',
                onClick: () => {
                  setSelectedClient(client)
                  setIsDeleteModalOpen(true)
                },
                variant: 'danger' as const,
              },
            ] : []),
          ]}
        />
      ),
    },
  ]

  return (
    <div className="px-1 py-2 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-gray-500">
            Manage client organizations and their product access
          </p>
        </div>
        {isSuperAdmin && (
          <div>
            <AddClientButton />
          </div>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg mb-4 border border-gray-200 shadow-sm">
        <div className="relative">
          <SearchAndFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            placeholder="Search clients..."
            onFilterClick={() => setIsFilterModalOpen(true)}
          />
          {isFilterModalOpen && (
            <FilterModal
              isOpen={isFilterModalOpen}
              onClose={() => setIsFilterModalOpen(false)}
              fields={filterFields}
              values={filterValues}
              onChange={handleFilterChange}
              onApply={handleApplyFilters}
              title="Filter Clients"
            />
          )}
        </div>

        <div className="mx-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-x-auto">
              <Table
                data={paginatedClients}
                columns={columns}
                className="w-full [&_th]:!text-gray-500 [&_td]:!text-gray-900 [&_th]:!font-medium [&_td]:!font-medium [&_th]:!p-4 [&_td]:!p-4 [&_tr]:border-b [&_tr:last-child]:border-b-0"
                emptyState={
                  searchQuery
                    ? 'No clients found matching your search'
                    : 'No clients found. Add your first client!'
                }
              />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </div>
      </div>

      <ClientFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedClient(null)
        }}
        onSubmit={handleEditSubmit}
        initialData={
          selectedClient
            ? {
                companyName: selectedClient.companyName,
                contactName: selectedClient.user.firstName,
                contactEmail: selectedClient.user.email,
                supportTier: selectedClient.supportTier,
                status: selectedClient.status,
              }
            : undefined
        }
        title="Edit Client"
      />

      <Dialog
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedClient(null)
        }}
        title="Delete Client"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this client? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false)
                setSelectedClient(null)
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleDeleteClient}>
              Delete
            </Button>
          </div>
        </div>
      </Dialog>

      <ProductSelectionModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false)
          setSelectedClient(null)
        }}
        onRemoveProduct={handleRemoveProduct}
        selectedProductIds={
          selectedClient?.clientProducts?.map((cp) => String(cp.product?.id)) ||
          []
        }
        clientId={selectedClient ? selectedClient.id : ''}
      />
    </div>
  )
}
