'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { Table } from '@/components/ui/Table'
import { PlusIcon } from '@/components/icons/ActionIcons'
import { ProductFormModal } from '@/components/products/ProductFormModal'
import { Dialog } from '@/components/ui/Dialog'
import { STATUS_OPTIONS } from '@/constants/productConfig'
import { Product } from '@/types/interfaces/product'
import { createProductHandlers } from '@/components/products/productHandlers'
import ClientSelectionModal from '@/components/clients/ClientSelectionModal'
import { productService } from '@/services/products.service'
import { Client } from '@/types/clients'
import { ClientResponse } from '@/types/clients/clientResponse'
import SearchAndFilters from '@/components/shared/SearchAndFilters'
import { useRouter } from 'next/navigation'
import { FilterModal } from '@/components/shared/FilterModal'
import { Pagination } from '@/components/ui/Pagination'

const PAGE_SIZE = 10

interface ProductFilters {
  status: string
}

const ALL_OPTION = { label: 'All', value: '' }
const FILTER_STATUS_OPTIONS = [ALL_OPTION, ...STATUS_OPTIONS]

export default function ProductsAdminPage() {
  const { data: session } = useSession()
  const isSuperAdmin = session?.user?.role === 'super_admin'
  const router = useRouter()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [filterValues, setFilterValues] = useState<ProductFilters>({
    status: '',
  })

  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [selectedClients, setSelectedClients] = useState<Client[]>([])
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsWithActiveClients =
          await productService.fetchProductsWithActiveClients()
        setProducts(productsWithActiveClients)
      } catch {
        setProducts([])
      }
    }
    fetchProducts()
  }, [])

  const openClientModal = (product: Product) => {
    setSelectedProduct(product)

    // Each cp from the backend is { id: joinTableId, client: { id, clientCode, ... } }.
    // We must use cp.client.id (the actual client UUID), not cp.id (the join-table row UUID).
    type CpWithClient = { id: string; client: ClientResponse }

    const initialSelectedClients: Client[] = product.clientProducts
      ? product.clientProducts.map((cp) => {
          const clientData = (cp as unknown as CpWithClient).client
          return {
            id: String(clientData.id),
            clientCode: clientData.clientCode,
            name: clientData.name,
            contactName: clientData.contactName,
            companyName: clientData.companyName,
            products: clientData.products,
            supportTier: clientData.supportTier,
            activeTickets: clientData.activeTickets,
            status: clientData.status,
            createdAt: clientData.createdAt,
            updatedAt: clientData.updatedAt,
            user: clientData.user,
            userId: clientData.userId,
            clientProducts: clientData.clientProducts,
          }
        })
      : []
    setSelectedClients(initialSelectedClients)

    const initialSelectedProductIds = product.clientProducts
      ? product.clientProducts.map((cp) =>
          String((cp as unknown as CpWithClient).client.id)
        )
      : []
    setSelectedProductIds(initialSelectedProductIds)
    setIsClientModalOpen(true)
  }

  const {
    handleAddProduct,
    handleEditProduct,
    handleDeleteProduct,
    getProductColumns,
  } = createProductHandlers({
    setSelectedProduct,
    setIsAddModalOpen,
    setIsDeleteModalOpen,
    selectedProduct,
    refreshData: async () => {
      try {
        const productsWithActiveClients =
          await productService.fetchProductsWithActiveClients()
        setProducts(productsWithActiveClients)
      } catch {
        setProducts([])
      }
    },
    openClientModal,
    setIsManageClientsModalOpen: setIsClientModalOpen,
    onNavigate: (path) => router.push(path),
    isAdmin: isSuperAdmin,
  })
  const handleFilterChange = (name: string, value: string): void => {
    setFilterValues((prev) => ({ ...prev, [name]: value }))
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())

    const matchesStatus =
      !filterValues.status ||
      product.status.toLowerCase() === filterValues.status.toLowerCase()

    return matchesSearch && matchesStatus
  })
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE))
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const columns = getProductColumns()

  const handleClientSelect = async (client: Client) => {
    const exists = selectedClients.find((c) => c.id === client.id)
    if (!exists && selectedProduct) {
      await productService.addClientToProduct(
        String(selectedProduct.id),
        String(client.id)
      )
      setSelectedClients([...selectedClients, client])
      setSelectedProductIds([...selectedProductIds, String(client.id)])
      try {
        const productsWithActiveClients =
          await productService.fetchProductsWithActiveClients()
        setProducts(productsWithActiveClients)
      } catch {
        setProducts([])
      }
    }
  }

  const handleClientRemove = async (client: Client) => {
    if (selectedProduct) {
      try {
        await productService.removeClientFromProduct(
          String(selectedProduct.id),
          String(client.id)
        )
        setSelectedClients(selectedClients.filter((c) => c.id !== client.id))
        setSelectedProductIds(
          selectedProductIds.filter((id) => id !== String(client.id))
        )
        try {
          const productsWithActiveClients =
            await productService.fetchProductsWithActiveClients()
          setProducts(productsWithActiveClients)
        } catch {
          setProducts([])
        }
        setIsClientModalOpen(false)
        setTimeout(() => {
          setIsClientModalOpen(true)
        }, 0)
      } catch {}
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your products and their configurations
          </p>
        </div>
        {isSuperAdmin && (
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Add Product
          </Button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="relative">
          <SearchAndFilters
            searchQuery={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Search products..."
            onFilterClick={() => setFilterModalOpen(true)}
          />
          {filterModalOpen && (
            <FilterModal
              isOpen={filterModalOpen}
              onClose={() => setFilterModalOpen(false)}
              fields={[
                {
                  name: 'status',
                  label: 'Status',
                  type: 'select',
                  options: FILTER_STATUS_OPTIONS,
                },
              ]}
              values={filterValues}
              onChange={handleFilterChange}
              onApply={() => setFilterModalOpen(false)}
              title="Filter Products"
            />
          )}
        </div>
        <div className="p-4 overflow-hidden">
          <div className="overflow-x-auto">
            <Table
              data={paginatedProducts}
              className="w-full min-w-[800px]"
              columns={columns}
              emptyState={
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg mb-2">
                    No products found
                  </p>
                  <p className="text-gray-400 text-sm">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              }
            />
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>

      <ProductFormModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setSelectedProduct(null)
        }}
        onSubmit={selectedProduct ? handleEditProduct : handleAddProduct}
        title={selectedProduct ? 'Edit Product' : 'Add Product'}
        initialData={
          selectedProduct
            ? {
                name: selectedProduct.name,
                description: selectedProduct.description,
                status: selectedProduct.status as 'active' | 'inactive',
              }
            : undefined
        }
      />

      <Dialog
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedProduct(null)
        }}
        title="Delete Product"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this product? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false)
                setSelectedProduct(null)
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleDeleteProduct}>
              Delete
            </Button>
          </div>
        </div>
      </Dialog>

      <ClientSelectionModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSelectClient={handleClientSelect}
        onRemoveClient={handleClientRemove}
        selectedClientIds={selectedClients.map((c) => String(c.id))}
      />
    </div>
  )
}
