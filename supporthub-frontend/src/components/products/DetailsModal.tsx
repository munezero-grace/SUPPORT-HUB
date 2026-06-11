import React from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProductDetailsModalProps } from '@/types/interfaces/productComponents';
import { Card } from '@/components/ui/Card';

export function ProductDetailsModal({ isOpen, onClose, product, onEdit }: ProductDetailsModalProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Product Details">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
            <p className="text-gray-600 mt-1">{product.description}</p>
          </div>
          <Badge variant={product.status === 'active' ? 'success' : 'error'}>
            {product.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500">Clients</h3>
            <div className="flex items-center mt-2">
              <svg className="w-5 h-5 text-gray-400 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>              <span className="text-2xl font-bold text-gray-900">{100}</span>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500">Developers</h3>
            <div className="flex items-center mt-2">
              <svg className="w-5 h-5 text-gray-400 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="text-2xl font-bold text-gray-900">{100}</span>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500">Active Tickets</h3>
            <div className="flex items-center mt-2">
              <svg className="w-5 h-5 text-gray-400 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              <span className="text-2xl font-bold text-gray-900">{100}</span>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
            <div className="flex items-center mt-2">
              <svg className="w-5 h-5 text-gray-400 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-900">{new Date(product.updatedAt).toLocaleDateString()}</span>
            </div>
          </Card>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" onClick={onEdit}>
            Edit Product
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
