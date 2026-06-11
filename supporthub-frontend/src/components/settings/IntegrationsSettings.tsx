'use client'
import React, { useEffect } from 'react'
import { notificationEvents } from '@/constants/integrationEvents'
import { toast } from 'react-toastify'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import settingsService from '@/services/settings.service'
import type { SlackSettings, ApiResponse } from '../../types/settings'
import { SUCCESS_MESSAGES } from '@/constants/successMessages'
import { useForm, Controller } from 'react-hook-form'

const IntegrationsSettings = () => {
  const { user } = useCurrentUser()
  const queryClient = useQueryClient()
  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: {  },
  } = useForm<SlackSettings>({
    defaultValues: {
      slackWebhookUrl: '',
      newTickets: false,
      ticketAssignments: false,
      statusChanges: false,
    },
  })

  const {
    data,
    isLoading: queryLoading,
    isError,
  } = useQuery<ApiResponse<SlackSettings>>({
    queryKey: ['slackSettings'],
    queryFn: () => settingsService.getSlackSettings(),
    retry: false,
  })

  const mutation = useMutation({
    mutationFn: settingsService.updateSlackSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slackSettings'] })
      toast.success(SUCCESS_MESSAGES.WEBHOOK_SAVED_SUCCESSFULLY)
    },
    onError: (error: unknown) => {
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? 'Failed to save Slack settings.'
      )
    },
  })

  useEffect(() => {
    if (data?.data) {
      reset(data.data)
    }
  }, [data, reset])

  const onSubmit = (formData: SlackSettings) => {
    mutation.mutate(formData)
  }

  const watchedValues = watch()

  const handleToggleSave = async (field: keyof SlackSettings, value: boolean) => {
    if (field === 'newTickets' && user?.role !== 'super_admin') return

    const updatedData = {
      ...watchedValues,
      [field]: value,
    }

    mutation.mutate(updatedData)

    if (field === 'newTickets') {
      if (value) {
        toast.success(SUCCESS_MESSAGES.NEW_TICKET_SLACK_NOTIFICATION_ENABLED)
      } else {
        toast.success(SUCCESS_MESSAGES.NEW_TICKET_SLACK_NOTIFICATION_DISABLED)
      }
    } else if (field === 'statusChanges') {
      if (value) {
        toast.success(SUCCESS_MESSAGES.SLACK_NOTIFICATION_ENABLED)
      } else {
        toast.success(SUCCESS_MESSAGES.SLACK_NOTIFICATION_DISABLED)
      }
    }
  }

  if (queryLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-6 text-sm text-red-500">Failed to load Slack settings. Please try again.</div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-lg border border-gray-200"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-1">
          Slack Integration
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Connect a Slack webhook to receive ticket notifications in your channel
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Webhook URL
          </label>
          <input
            type="text"
            {...register('slackWebhookUrl')}
            placeholder="https://hooks.slack.com/services/..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={mutation.status === 'pending'}
            className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          >
            {mutation.status === 'pending' ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-base font-semibold text-gray-900 mb-1">Notification Events</h3>
        <p className="text-sm text-gray-500 mb-4">Choose which events send a Slack message</p>
        <div className="space-y-4">
          {notificationEvents.map(({ label, field }) => (
            <Controller
              key={field}
              name={field as keyof SlackSettings}
              control={control}
              render={({ field: controllerField }) => (
                <label
                  className="flex items-center space-x-3 cursor-pointer"
                  onClick={async () => {
                    if (field === 'newTickets' && user?.role !== 'super_admin')
                      return
                    if (field === 'newTickets' || field === 'statusChanges') {
                      const newValue = !controllerField.value
                      await handleToggleSave(field as keyof SlackSettings, newValue)
                      controllerField.onChange(newValue)
                    } else {
                      controllerField.onChange(!controllerField.value)
                    }
                  }}
                >
                  <div
                    className={`w-11 h-6 flex items-center rounded-full duration-200 ease-in-out relative select-none cursor-pointer ${
                      controllerField.value ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-sm transform duration-200 ease-in-out absolute ${
                        controllerField.value ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                  <span className="text-sm text-gray-700 select-none">{label}</span>
                </label>
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default IntegrationsSettings
