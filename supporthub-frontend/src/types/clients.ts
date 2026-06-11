export enum SupportTier {
  Standard = 'standard',
  Premium = 'premium',
}

export enum Status {
  Active = 'active',
  Inactive = 'inactive',
}

export interface User {
  email: string
  firstName: string
  lastName: string
}

export interface Client {
  id: string
  clientCode: string
  name: string
  contactName: string
  companyName: string
  products: string[]
  supportTier: SupportTier
  activeTickets: number
  status: Status
  createdAt: string
  updatedAt: string
  user: User
  userId?: string
  clientProducts?: { 
    id: string;
    product?: {
      id: string;
      productCode: string;
      name: string;
      description?: string;
      status: 'active' | 'inactive';
    };
  }[];
}

export interface CreateClientDto {
  companyName: string
  contactName: string
  contactEmail: string
  supportTier?: SupportTier
  status?: Status
  userId?: string
}

export interface UpdateClientDto extends Partial<CreateClientDto> {
  activeTickets?: number
  status: Status
}

export interface SelectOption {
  value: string
  label: string
}

export type FormData = {
  productId: string
  clientId: string
}

export interface AddClientFormProps {
  onSuccess: () => void
}

export interface AddClientModalProps {
  isOpen: boolean
  onClose: () => void
}
