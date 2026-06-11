import React from 'react';
import { Badge } from '@/components/ui/Badge';

type Product = {
  name: string;
  status: string;
  updatedAt?: string;
};

interface ProductDisplayProps {
  product: Product | string | null;
}

export function ProductDisplay({ product }: ProductDisplayProps) {
  if (!product) {
    return <span className="text-gray-500 italic">No product</span>;
  }

  const productName = typeof product === 'string' ? product : product.name;
  const productStatus = typeof product === 'string' ? null : product.status;

  return (
    <div className="flex items-center gap-2">
      <span className="font-medium text-gray-700">{productName}</span>
      {productStatus && (
        <Badge variant={productStatus === 'active' ? 'success' : 'error'}>
          {productStatus}
        </Badge>
      )}
    </div>
  );
}
