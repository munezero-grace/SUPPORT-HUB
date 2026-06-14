import { Product } from '@/types/interfaces/product';
import { FilterOptions } from '@/types/interfaces/Props';

export const filterProducts = (products: Product[], filters: FilterOptions, searchTerm: string) => {
  return products.filter(product => {
    if (filters.status.value && product.status !== filters.status.value) {
      return false;
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.status.toLowerCase().includes(searchLower)
      )
    }

    return true
  })
}

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

const CLIENT_TYPE_OPTIONS = [
  { label: 'Standard', value: 'standard' },
  { label: 'Enterprise', value: 'premium' },
];

export const filterFields = [
  {
    label: 'Status',
    name: 'status',
    type: 'select',
    options: STATUS_OPTIONS,
  },
  {
    label: 'Client Type',
    name: 'supportTier',
    type: 'select',
    options: CLIENT_TYPE_OPTIONS,
  },
]
