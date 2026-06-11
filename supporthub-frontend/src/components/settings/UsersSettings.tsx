'use client'
import React, { useState } from 'react'
import { Table } from '@/components/ui/Table'
import { ActionMenu } from '@/components/ui/ActionMenu'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { userService } from '@/services/user.service'
import { User } from '@/types/interfaces'
import CreateUserModal from './CreateUserModal'

const ROLE_STYLES: Record<string, string> = {
  super_admin: 'bg-red-100 text-red-700',
  ticket_manager: 'bg-blue-100 text-blue-700',
  developer: 'bg-purple-100 text-purple-700',
  client: 'bg-green-100 text-green-700',
}

function formatRole(role: string) {
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const UsersSettings = () => {
  const queryClient = useQueryClient()
  const [confirmUser, setConfirmUser] = useState<User | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: userService.getAll,
  })

  const deactivateMutation = useMutation({
    mutationFn: (user: User) => userService.softDelete(user.id),
    onSuccess: () => {
      toast.success('User deactivated successfully')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setConfirmUser(null)
    },
    onError: (error: unknown) => {
      const err = error as { message?: string }
      toast.error(err?.message || 'Error deactivating user')
    },
  })

  const reactivateMutation = useMutation({
    mutationFn: (user: User) => userService.reactivate(user.id),
    onSuccess: () => {
      toast.success('User reactivated successfully')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error: unknown) => {
      const err = error as { message?: string }
      toast.error(err?.message || 'Error reactivating user')
    },
  })

  const columns = [
    {
      header: 'Name',
      accessor: (user: User) => (
        <span className={user.deletedAt ? 'text-gray-400' : ''}>
          {user.firstName} {user.lastName}
        </span>
      ),
    },
    {
      header: 'Email',
      accessor: (user: User) => (
        <span className={user.deletedAt ? 'text-gray-400' : ''}>{user.email}</span>
      ),
    },
    {
      header: 'Role',
      accessor: (user: User) => (
        <div className="flex flex-wrap gap-1">
          {user.roles.map((role) => (
            <span
              key={role}
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${user.deletedAt ? 'bg-gray-100 text-gray-400' : (ROLE_STYLES[role] ?? 'bg-gray-100 text-gray-600')}`}
            >
              {formatRole(role)}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (user: User) => (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${user.deletedAt ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
          {user.deletedAt ? 'Deactivated' : 'Active'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (user: User) => (
        <ActionMenu
          items={
            user.deletedAt
              ? [{ label: 'Reactivate', onClick: () => reactivateMutation.mutate(user) }]
              : [{ label: 'Deactivate', variant: 'danger' as const, onClick: () => setConfirmUser(user) }]
          }
        />
      ),
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-white">
      <div className="p-6 overflow-x-auto">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
            <p className="text-gray-500 text-sm mt-1">Manage user accounts and permissions</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
          >
            Create User
          </button>
        </div>

        <Table
          data={users}
          columns={columns}
          emptyState={<p className="text-center text-gray-400 py-8">No users found.</p>}
        />
      </div>

      <CreateUserModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />

      {/* Deactivate confirmation modal */}
      {confirmUser && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        >
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Deactivate User</h3>
            <p className="text-gray-600 text-sm mb-4">
              Are you sure you want to deactivate{' '}
              <span className="font-medium">{confirmUser.firstName} {confirmUser.lastName}</span>?
              They will no longer be able to log in.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmUser(null)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deactivateMutation.mutate(confirmUser)}
                disabled={deactivateMutation.isPending}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deactivateMutation.isPending ? 'Deactivating...' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UsersSettings
