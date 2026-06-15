import React from 'react'
import { Product, ProductFormData } from '@/types/interfaces/product'
import { ActionMenu } from '@/components/ui/ActionMenu'
import { TableProps } from '@/types/interfaces/Props'
import { PRODUCT_STATUS_STYLES } from '@/constants/productConfig'
import { productService } from '@/services/products.service'
import { ProductHandlerProps } from '@/types/interfaces/productComponents'
import { UsersIcon } from '@heroicons/react/24/outline'

export const createProductHandlers = ({
  setSelectedProduct,
  setIsAddModalOpen,
  setIsDeleteModalOpen,
  selectedProduct,
  refreshData,
  openClientModal,
  isAdmin = true,
}: ProductHandlerProps & { openClientModal: (product: Product) => void; isAdmin?: boolean }) => ({
  handleAddProduct: async (data: ProductFormData) => {
    try {
      if (data.description.trim().length < 10) {
        throw new Error('Description must be at least 10 characters')
      }

      await productService.createProduct(data)
      setIsAddModalOpen(false)
      if (refreshData) await refreshData()
    } catch (error) {
      console.error('Error adding product:', error)
      throw error instanceof Error
        ? error
        : new Error('Failed to create product. Please try again.')
    }
  },

  handleEditProduct: async (data: ProductFormData) => {
    try {
      if (!selectedProduct?.id) return
      await productService.updateProduct(selectedProduct.id, data)
      setIsAddModalOpen(false)
      setSelectedProduct(null)
      if (refreshData) await refreshData()
    } catch (error) {
      console.error('Error editing product:', error)
      throw new Error('Failed to update product. Please try again.')
    }
  },

  handleDeleteProduct: async () => {
    try {
      if (!selectedProduct?.id) {
        throw new Error('No product selected for deletion')
      }
      await productService.deleteProduct(selectedProduct.id)
      setIsDeleteModalOpen(false)
      setSelectedProduct(null)
      if (refreshData) {
        await refreshData()
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to delete product. Please try again.'
      throw new Error(errorMessage)
    }
  },

  getProductColumns: (): TableProps<Product>['columns'] => [
    {
      header: 'ID',
      accessor: (product) => (
        <div className="truncate max-w-[120px]" title={product.productCode}>
          {product.productCode}
        </div>
      ),
      className: 'max-w-[120px]',
    },
    {
      header: 'Name',
      accessor: (product) => (
        <div className="truncate max-w-[200px]" title={product.name}>
          {product.name}
        </div>
      ),
      className: 'max-w-[200px]',
    },
    {
      header: 'Description',
      accessor: (product) => (
        <div className="truncate max-w-xs" title={product.description}>
          {product.description}
        </div>
      ),
      className: 'max-w-xs',
    },
    {
      header: 'Active Clients',
      accessor: (product) => (
        <div className="flex items-center gap-2">
          <UsersIcon className="w-4 h-4" />
          <span>
            {product.clientProducts ? product.clientProducts.length : 0}
          </span>
        </div>
      ),
    },
    {
      header: 'Active Tickets',
      accessor: (product: Product) => (
        <div className="flex items-center gap-2">
          <span>{product.activeTickets ?? 0}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (product: Product) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
            PRODUCT_STATUS_STYLES[product.status]
          }`}
        >
          {product.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (product: Product) => (
        <ActionMenu
          items={[
            {
              label: 'View Details',
              onClick: () => {
                window.location.href = `/dashboard/products/${product.productCode}`;
              },
            },
            ...(isAdmin ? [
              {
                label: 'Edit Product',
                onClick: () => {
                  setSelectedProduct(product)
                  setIsAddModalOpen(true)
                },
              },
              {
                label: 'Manage Clients',
                onClick: () => openClientModal(product),
              },
            ] : []),
            {
              label: 'View Tickets',
              onClick: () => {
                window.location.href = `/dashboard/tickets?product=${product.productCode}`
              },
            },
            ...(isAdmin ? [
              {
                label: 'Delete',
                onClick: () => {
                  setSelectedProduct(product)
                  setIsDeleteModalOpen(true)
                },
                variant: 'danger' as const,
              },
            ] : []),
          ]}
        />
      ),
    },
  ],
})
