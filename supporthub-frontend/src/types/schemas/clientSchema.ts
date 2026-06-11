import * as z from 'zod'

export const schema = z.object({
  productId: z.string().min(1, 'Product is required'),
  clientId: z.string().min(1, 'Client is required'),
})
