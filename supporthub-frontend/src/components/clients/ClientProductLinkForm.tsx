'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Select from 'react-select'
import { productsService } from '@/services/products.service'
import { clientService } from '@/services/clients.service'
import { Product } from '@/types/interfaces/product'
import { Client, SelectOption, FormData } from '@/types/clients'
import { schema } from '@/types/schemas/clientSchema'
import { Button } from '@/components/ui/Button'
import { toast } from 'react-toastify'

export default function ClientProductLinkForm() {
  const [products, setProducts] = useState<Product[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    productsService.getAll().then(setProducts).catch(console.error)
    clientService.getAll().then(setClients).catch(console.error)
  }, [])

  const onSubmit = async (data: FormData) => {
    try {
      const response = await productsService.addClientToProduct(
        data.productId,
        data.clientId
      )
      const successMessage = response?.message
      toast.success(successMessage)
      reset()
    } catch (error: unknown) {
      const errorResponse = error as {
        response?: { data?: { message?: string } }
        message?: string
      }
      toast.error(
        errorResponse?.response?.data?.message || errorResponse?.message
      )
    }
  }
  const productOptions = products.map((p) => ({
    value: p.id,
    label: `${p.productCode} - ${p.name}`,
  })) as SelectOption[]

  const clientOptions = clients.map((c) => ({
    value: c.id,
    label: c.clientCode,
  })) as SelectOption[]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <div>
        <label className="block mb-1 font-medium">Product</label>
        <Controller
          name="productId"
          control={control}
          render={({ field }) => (
            <Select<SelectOption>
              {...field}
              value={productOptions.find(
                (option) => option.value === field.value
              )}
              options={productOptions}
              onChange={(val) => field.onChange(val?.value)}
              placeholder="Select a product"
            />
          )}
        />
        {errors.productId && (
          <p className="text-red-600 text-sm mt-1">
            {errors.productId.message}
          </p>
        )}
      </div>

      <div>
        <label className="block mb-1 font-medium">Client</label>
        <Controller
          name="clientId"
          control={control}
          render={({ field }) => (
            <Select<SelectOption>
              {...field}
              value={clientOptions.find(
                (option) => option.value === field.value
              )}
              options={clientOptions}
              onChange={(val) => field.onChange(val?.value)}
              placeholder="Select a client"
            />
          )}
        />
        {errors.clientId && (
          <p className="text-red-600 text-sm mt-1">{errors.clientId.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} variant="primary">
        Link Client to Product
      </Button>
    </form>
  )
}
