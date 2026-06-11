import { companyProfileSchema } from '@/types/schemas/companyProfileSchema'
import { useMutation } from '@tanstack/react-query'
import React, { FC, useState } from 'react'
import { z } from 'zod'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-toastify'
import { queryClient } from '@/providers/QueryProvider'
import { Input } from '../ui/Input'
import { updateUserCompanyProfile } from '@/services/settings.service'
import SaveButton from './SaveButton'
import { PersonnelCompanySectionProps } from '@/types/interfaces/Settings'
import { ApiError } from '@/types/interfaces'

const CompanyProfileSection: FC<PersonnelCompanySectionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      id: data?.id,
      companyName: data?.companyName,
      companyDomain: data?.companyDomain || undefined,
    },
  })

  const mutation = useMutation({
    mutationFn: updateUserCompanyProfile,
    onError(error: ApiError) {
      const { details = [], message = error.response?.data?.message } =
        error.response?.data ?? {}
      details.forEach(({ field, message: msg }) => {
        setError(field as 'id' | 'companyName' | 'companyDomain', {
          message: msg,
        })
      })
      setLoading(false)
      toast.error(message)
    },
    onSuccess(res) {
      queryClient.invalidateQueries({ refetchType: 'active' })
      setLoading(false)
      const successMessage = res?.message
      toast.success(successMessage)
    },
  })

  const handleUpdateCompanyProfile: SubmitHandler<
    z.infer<typeof companyProfileSchema>
  > = async (data) => {
    setLoading(true)
    mutation.mutate(data)
  }
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Company Profile</h2>

      <form
        onSubmit={handleSubmit(handleUpdateCompanyProfile)}
        className="space-y-4"
      >
        <div className="space-y-6">
          <div>
            <Input {...register('id')} type="text" hidden />
          </div>

          <div>
            <Input
              {...register('companyName')}
              type="text"
              label="Company Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
            />
          </div>
          <div>
            <Input
              {...register('companyDomain')}
              type="text"
              label="Company Website"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
            />
            {errors.companyDomain && (
              <p className="text-red-500">{errors.companyDomain.message}</p>
            )}
          </div>
        </div>
        <SaveButton
          isLoading={loading}
          disabled={loading}
          label="Update"
          loadingLabel="Updating..."
        />
      </form>
    </div>
  )
}
export default CompanyProfileSection
