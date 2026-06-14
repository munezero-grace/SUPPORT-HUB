import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  clientFormSchema,
  type ClientFormData,
} from '@/validations/clientSchema'
import { useCreateClientMutation } from '@/hooks/useQueries'
import { Button } from '@/components/ui/Button'
import {
  SupportTier,
  Status,
  AddClientFormProps,
  SelectOption,
} from '@/types/clients'
import Select from 'react-select'
import { productsService } from '@/services/products.service'
import { Product } from '@/types/interfaces/product'
import { useQueryClient } from '@tanstack/react-query'

export function AddClientForm({ onSuccess }: AddClientFormProps) {
  const [error, setError] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = useState<SelectOption[]>([])
  const createClientMutation = useCreateClientMutation()
  const queryClient = useQueryClient()

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      companyName: '',
      contactName: '',
      contactEmail: '',
      supportTier: SupportTier.Standard,
      status: Status.Active,
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form

  useEffect(() => {
    productsService
      .getAll()
      .then((allProducts) => {
        setProducts(allProducts.filter((p) => p.status === 'active'))
      })
      .catch(console.error)
  }, [])

  const submitForm = async (data: ClientFormData) => {
    if (selectedProducts.length === 0) {
      setError('Please select at least one product for this client')
      return
    }
    try {
      setError('')
      const client = await createClientMutation.mutateAsync({
        ...data,
        supportTier: data.supportTier as SupportTier,
        status: data.status as Status,
        productIds: selectedProducts.map((p) => p.value),
      })

      let allProductsAssigned = true
      let assignError = ''
      if (selectedProducts.length > 0) {
        for (const product of selectedProducts) {
          try {
            await productsService.addClientToProduct(product.value, client.id)
          } catch {
            allProductsAssigned = false
            assignError =
              'Some products could not be assigned. Please try again.'
          }
        }
      }

      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      if (!allProductsAssigned) {
        setError(assignError)
        return
      }
      onSuccess()
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const apiError = err as {
          response?: { data?: { error?: string; message?: string } }
        }
        setError(
          apiError.response?.data?.error ||
            apiError.response?.data?.message ||
            'Failed to create client. Please try again.'
        )
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to create client. Please try again.')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
      <InputField
        id="companyName"
        label="Company Name"
        register={register}
        error={errors.companyName?.message}
      />

      <InputField
        id="contactName"
        label="Contact Name"
        register={register}
        error={errors.contactName?.message}
      />

      <InputField
        id="contactEmail"
        label="Contact Email"
        type="email"
        register={register}
        error={errors.contactEmail?.message}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Products <span className="text-red-500">*</span>
        </label>
        <Select
          isMulti
          options={products.map((p) => ({
            value: p.id,
            label: `${p.productCode} - ${p.name}`,
          }))}
          value={selectedProducts}
          onChange={(newValue) => {
            setSelectedProducts(Array.from(newValue as SelectOption[]))
            if (newValue.length > 0) setError('')
          }}
          placeholder="Select products to assign"
        />
        {selectedProducts.length === 0 && (
          <p className="mt-1 text-sm text-gray-500">At least one product is required</p>
        )}
      </div>

      <div>
        <label htmlFor="supportTier" className="block text-sm font-medium text-gray-700">
          Client Type
        </label>
        <select
          id="supportTier"
          {...register('supportTier')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500 sm:text-sm"
        >
          <option value="standard">Standard</option>
          <option value="premium">Enterprise</option>
        </select>
      </div>

      <SelectField
        id="status"
        label="Status"
        register={register}
        options={Status}
      />

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <p className="mt-2 text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
        <Button
          type="submit"
          disabled={isSubmitting || createClientMutation.isPending || selectedProducts.length === 0}
          loading={isSubmitting || createClientMutation.isPending}
          variant="primary"
          className="col-start-2"
        >
          Create Client
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onSuccess}
          disabled={createClientMutation.isPending}
          className="col-start-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

interface FieldProps {
  id: keyof ClientFormData
  label: string
  register: ReturnType<typeof useForm<ClientFormData>>['register']
  type?: string
  error?: string
}

function InputField({ id, label, register, type = 'text', error }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type={type}
        id={id}
        {...register(id)}
        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500 sm:text-sm"
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

interface SelectFieldProps {
  id: keyof ClientFormData
  label: string
  register: ReturnType<typeof useForm<ClientFormData>>['register']
  options: Record<string, string>
}

function SelectField({ id, label, register, options }: SelectFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        id={id}
        {...register(id)}
        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500 sm:text-sm"
      >
        {Object.entries(options).map(([key, value]) => (
          <option key={key} value={value}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </option>
        ))}
      </select>
    </div>
  )
}
