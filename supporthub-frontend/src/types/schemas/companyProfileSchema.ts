import { z } from 'zod'

export const companyProfileSchema = z.object({
  id: z.string().optional(),
  companyName: z.string().min(1, 'Company name is required'),
  companyDomain: z
    .string()
    .url('Invalid company website URL')
    .nullable()
    .optional()
    .or(z.literal('')),
})
