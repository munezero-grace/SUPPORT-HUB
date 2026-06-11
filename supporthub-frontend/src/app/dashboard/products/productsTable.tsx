import { ReactNode } from 'react';
import type { Product } from '@/types/interfaces/product';
import { ProductIcon } from '@/components/icons';
import { UsersIcon } from '@heroicons/react/24/outline';

export type TableColumn = {
  header: string;
  accessor: (product: Product) => ReactNode;
  className?: string;
};

export const productTableColumns: TableColumn[] = [
  {
    header: 'ID',
    accessor: (product: Product): ReactNode => (
      <span className="block truncate">{product.productCode}</span>
    ),
    className: 'w-20 min-w-20 max-w-20'
  },
  {
    header: 'Product Name',
    accessor: (product: Product): ReactNode => (
      <div className="flex items-center gap-2 min-w-0">
        <ProductIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
        <span className="font-medium truncate">{product.name}</span>
      </div>
    ),
    className: 'w-48 min-w-48 max-w-48'
  },
  {
    header: 'Description',
    accessor: (product: Product): ReactNode => (
      <span className="text-sm text-gray-600" title={product.description}>
        {product.description}
      </span>
    ),
    className: 'w-64 min-w-64 max-w-64'
  },
  {
    header: 'Clients',
    accessor: (product): ReactNode => (
      <div className="flex items-center gap-1">
        <UsersIcon className="w-4 h-4 text-gray-400" />
        <span>{product.clientProducts ? product.clientProducts.length : 0}</span>
      </div>
    ),
    className: 'w-20 min-w-20 max-w-20'
  },
  {
    header: 'Developers',
    accessor: (): ReactNode => (
      <div className="flex items-center gap-1">
        <UsersIcon className="w-4 h-4 text-gray-400" />
        <span>{100}</span>
      </div>
    ),
    className: 'w-24 min-w-24 max-w-24'
  },
  {
    header: 'Active Tickets',
    accessor: (): ReactNode => (
      <div className="flex items-center gap-1">
        <span>{100}</span>
      </div>
    ),
    className: 'w-28 min-w-28 max-w-28'
  },
  {
    header: 'Status',
    accessor: (product: Product): ReactNode => (
      <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
        product.status === 'active'
          ? 'bg-green-500 text-white'
          : 'bg-gray-400 text-black'
      }`}>
        {product.status}
      </span>
    ),
    className: 'w-20 min-w-20 max-w-20'
  }
];