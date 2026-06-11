import { Product } from './product';

export interface ProductHandlerProps {
    setSelectedProduct: (product: Product | null) => void;
    setIsAddModalOpen: (isOpen: boolean) => void;
    setIsDeleteModalOpen: (isOpen: boolean) => void;
    setIsManageClientsModalOpen: (isOpen: boolean) => void;
    selectedProduct: Product | null;
    refreshData?: () => void;
    openClientModal: (product: Product) => void;
    onNavigate: (path: string) => void;
}

export interface ProductCardProps {
    product: Product;
    onView?: (product: Product) => void;
    onEdit?: (product: Product) => void;
    onDelete?: (product: Product) => void;
}

export interface ProductDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product;
    onEdit: () => void;
}