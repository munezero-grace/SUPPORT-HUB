import { Product } from '@/types/interfaces/product';

export const getProductActions = (
  onView: (id: string) => void,
  onEdit: (product: Product) => void,
  onManageClients: (id: string) => void,
  onViewTickets: (id: string) => void,
  onDelete: (product: Product) => void
) => (product: Product) => [
  {
    label: 'View Details',
    onClick: () => onView(product.id)
  },
  {
    label: 'Edit Product',
    onClick: () => onEdit(product)
  },
  {
    label: 'Manage Clients',
    onClick: () => onManageClients(product.id)
  },
  {
    label: 'View Tickets',
    onClick: () => onViewTickets(product.id)
  },
  {
    label: 'Delete',
    onClick: () => onDelete(product)
  }
];
