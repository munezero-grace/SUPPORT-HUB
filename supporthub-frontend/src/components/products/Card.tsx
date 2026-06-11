import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProductCardProps } from '@/types/interfaces/productComponents';
import { ActionMenu } from '@/components/ui/ActionMenu';
import { EyeIcon, EditIcon, TrashIcon } from '@/components/icons/ActionIcons';

export function ProductCard({ product, onView, onEdit, onDelete }: ProductCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-700">{product.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{product.description}</p>
        </div>
        <div className="flex items-start gap-3">
          <Badge variant={product.status === 'active' ? 'success' : 'error'}>
            {product.status}
          </Badge>
          <ActionMenu
            items={[
              {
                label: 'View Details',
                icon: EyeIcon,
                onClick: () => onView?.(product)
              },
              {
                label: 'Edit Product',
                icon: EditIcon,
                onClick: () => onEdit?.(product)
              },
              {
                label: 'Delete',
                icon: TrashIcon,
                onClick: () => onDelete?.(product),
                variant: 'danger'
              }
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div>
          <p className="text-sm font-medium text-gray-600">Clients</p>
          <p className="text-lg font-bold text-gray-700">{product.clientProducts?.length ?? 0}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Active Tickets</p>
          <p className="text-lg font-bold text-gray-700">{product.activeTickets ?? 0}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Last Updated</p>
          <p className="text-sm text-gray-700">{new Date(product.updatedAt).toLocaleDateString()}</p>
        </div>
      </div>
    </Card>
  );
}
