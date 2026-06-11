import { z } from 'zod'

const supportTierEnum = z.enum(['standard', 'premium'])
const clientStatusEnum = z.enum(['active', 'inactive'])

export const clientFormSchema = z
  .object({
    companyName: z
      .string()
      .trim()
      .min(2, 'Client name must be at least 2 characters long')
      .nonempty('Client name is not allowed to be empty')
      .max(100, 'Client name must be less than 100 characters'),
    contactName: z
      .string()
      .trim()
      .min(2, 'Contact name must be at least 2 characters long')
      .nonempty('Contact name is not allowed to be empty'),
    contactEmail: z
      .string()
      .email('Contact email must be a valid email address')
      .nonempty('Contact email is not allowed to be empty'),
    supportTier: supportTierEnum,
    status: clientStatusEnum,
  })
  .required()
  .transform((data) => ({
    ...data,
    supportTier: data.supportTier ?? 'Standard',
    status: data.status ?? 'Active',
  }))

export type ClientFormData = z.infer<typeof clientFormSchema>

