import React, { FC, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import ProfilePictureUpload from './ProfilePictureUpload'
import { PersonnelProfileSectionProps } from '@/types/interfaces/Settings'
import { Input } from '../ui/Input'
import SaveButton from './SaveButton'
import { useMutation } from '@tanstack/react-query'
import { queryClient } from '@/providers/QueryProvider'
import { updateUserProfile } from '@/services/settings.service'
import { User } from '@/types'
import { toast } from 'react-toastify'
import { userProfileSchema } from '@/types/schemas/userProfileSchema'
import { ApiError } from '@/types/interfaces'

const PersonnelProfileSection: FC<PersonnelProfileSectionProps> = ({
  data,
}) => {
  const [loading, setLoading] = useState(false)
  const isAdmin = data?.data?.userRoles.some(
    (role) => role.role.name === 'super_admin'
  )
  const clientCode = isAdmin ? '' : data?.data?.Clients[0]?.clientCode || ''

  const { register, handleSubmit, setError } = useForm({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      firstName: data?.data?.firstName || '',
      lastName: data?.data?.lastName || '',
      email: data?.data?.email || '',
    },
  })

  const mutation = useMutation({
    mutationFn: updateUserProfile,
    onError(error: ApiError) {
      const { details = [], message = error.response?.data?.message } =
        error.response?.data ?? {}
      details.forEach(({ field, message: msg }) => {
        setError(field as 'firstName' | 'lastName' | 'email', { message: msg })
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

  const handleUpdateUserProfile = async (data: User) => {
    setLoading(true)
    mutation.mutate(data)
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Your Profile</h2>
      <div className="border-b border-gray-300 pb-4 mb-4">
        <ProfilePictureUpload
          profilePicture={data?.data?.profilePicture ?? ''}
        />
      </div>

      <form
        onSubmit={handleSubmit(handleUpdateUserProfile)}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              type="text"
              {...register('firstName')}
              placeholder="Enter your first name"
              label="First Name"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <Input
              type="text"
              {...register('lastName')}
              label="Last Name"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {!isAdmin && (
            <div>
              <Input
                type="text"
                value={clientCode}
                label="Client Code"
                disabled
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          <div>
            <Input
              type="email"
              {...register('email')}
              placeholder="Enter your email"
              label="Email"
              disabled
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>

        <SaveButton isLoading={loading} disabled={loading} />
      </form>
    </div>
  )
}

export default PersonnelProfileSection
