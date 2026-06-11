import { ReactNode, FormEvent, ButtonHTMLAttributes, InputHTMLAttributes } from "react"
import { Size, StatusType } from '@/types/index'
import { Client } from '@/types/clients'
import { Product, ProductFormData } from '@/types/interfaces/product'


export interface FormProps {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  children: ReactNode
  className?: string
  disabled?: boolean
}

export interface FormFieldProps {
  label?: string
  error?: string
  children: ReactNode
  className?: string
  required?: boolean
  helpText?: string
}

export interface FormActionsProps {
  children: ReactNode
  className?: string
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}

export interface DialogProps extends React.PropsWithChildren {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  className?: string;
  initialFocus?: React.RefObject<HTMLElement>;
}

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export interface CardProps {
  children: ReactNode
  className?: string
}

export interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error'
  className?: string
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: Size;
  loading?: boolean;
  children: ReactNode;
}

export interface IconBaseProps {
  className?: string;
  size?: number;
  color?: string;
}

export interface IconProps extends IconBaseProps {
  'aria-hidden'?: boolean;
  role?: string;
}

export interface LoadingSpinnerProps {
  size?: Size;
  color?: 'primary' | 'secondary' | 'white';
}

export interface SearchComboboxProps {
  options: ComboboxOption[]
  value: ComboboxOption | null
  onChange: (value: ComboboxOption | null) => void
  label?: string
  placeholder?: string
  error?: string
  className?: string
}

export interface ComboboxOption<T = unknown> {
  id: string | number
  label: string
  value: T
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface FilterOptions {
  status: SelectOption;
  priority?: SelectOption;
  minClients?: number;
  minDevelopers?: number;
  hasActiveTickets?: boolean;
}

export interface FilterField {
  name: string;
  label: string;
  type: 'select';
  options: Array<{ label: string; value: string; }>;
}

export interface FilterValues {
  [key: string]: string;
}

export interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  values: FilterValues;
  onApply: (newFilters: FilterOptions) => void;
  onChange: (fieldName: string, value: string) => void;
  initialFilters: FilterOptions;
  fields: {
    name: string;
    label: string;
    type: string;
    options: { value: string; label: string; }[];
  }[];
}

export interface FilterModalTicketsProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  initialFilters: FilterOptions;
}

export interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface SelectProps {
  value: SelectOption;
  onChange: (value: SelectOption) => void;
  options: SelectOption[];
  label?: string;
  error?: string;
  className?: string;
}

export interface StatusProps {
  type: StatusType
  className?: string
}

export interface DashboardLayoutProps {
  children: React.ReactNode;
}

export interface ClientSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectClient: (client: Client) => void
  onRemoveClient?: (client: Client) => void
  selectedClientIds: string[]
}

export interface ProductSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onRemoveProduct: (product: Product) => void
  selectedProductIds: string[]
  clientId: string
}

export interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => void | Promise<void>;
  initialData?: Partial<ProductFormData>;
  title: string;
}

export interface ClientListItemProps {
  client: Client
  onManageProducts: () => void
}

export interface NavLinkProps {
  href: string
  icon: React.ElementType
  name: string
}

export type Ticket = {
  id: string;
  ticketCode?: string;
  title: string;
  client: { companyName: string } | null;
  product: { name: string; status: string; updatedAt?: string } | null;
  status: string;
  priority: string;
  assignee: string;
  createdAt: string;
  updatedAt: string;
};

export interface TableColumn<T extends Record<string, unknown> = Record<string, unknown>> {
  header: string | ReactNode;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
  wrap?: boolean;
}

export interface TableProps<T extends { id: string | number }> {
  data: T[];
  columns: TableColumn<T>[];
  onRowClick?: (item: T) => void;
  className?: string;
  emptyState?: ReactNode;
}

export interface TicketTableColumn {
  header: string;
  accessor: (ticket: Ticket) => ReactNode;
  className?: string;
}