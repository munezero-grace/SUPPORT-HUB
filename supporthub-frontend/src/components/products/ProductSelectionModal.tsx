'use client'

import { useState, useEffect } from 'react'
import { Product } from '@/types/interfaces/product'
import { productService } from '@/services/products.service'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { ProductSelectionModalProps } from '@/types/interfaces/Props'

export default function ProductSelectionModal({
  isOpen,
  onClose,
  selectedProductIds,
  clientId,
}: ProductSelectionModalProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      productService
        .getProducts()
        .then((data) => {
          const activeProducts = data.filter((product) => product.status === 'active')
          const clientProducts = activeProducts.filter((product) =>
            selectedProductIds.includes(product.id)
          )
          setProducts(clientProducts)
        })
        .finally(() => setLoading(false))
    }
  }, [isOpen, clientId, selectedProductIds])

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Manage Products">
      {loading ? (
        <div>Loading products...</div>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr>
              <th>Product Code</th>
              <th>Product Name</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-100">
                <td className="p-2">{product.productCode}</td>
                <td className="p-2">{product.name}</td>
                <td className="p-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      product.status === 'active'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {product.status}
                  </span>
                </td>
                <td className="p-2">
                  {' '}
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center p-4 text-gray-500">
                  No products linked to this client
                </td>
              </tr>
            )}
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
