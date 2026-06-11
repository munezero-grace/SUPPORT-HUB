import { z } from 'zod';

export interface Product {
  id: string;
  productCode: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  clientProducts?: { id: string }[];
  activeTickets?: number;
}

export const productValidationSchema = z.object({
  name: z.string()
    .min(2, 'Product name must be at least 2 characters')
    .max(50, 'Product name must not exceed 50 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters'),
  status: z.enum(['active', 'inactive']),

});

export type ProductFormData = z.infer<typeof productValidationSchema>;
