'use client'
import React, { useState } from 'react'
import { Table } from '@/components/ui/Table'
import { ActionMenu } from '@/components/ui/ActionMenu'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { userService } from '@/services/user.service'
import { User } from '@/types/interfaces'
import CreateUserModal from './CreateUserModal'
import EditUserModal from './EditUserModal'

const ROLE_STYLES: Record<string, string> = {
  super_admin: 'bg-red-100 text-red-700',
  ticket_manager: 'bg-blue-100 text-blue-700',
  developer: 'bg-purple-100 text-purple-700',
  client: 'bg-green-100 text-green-700',
}

function formatRole(role: string) {
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const ROLE_FILTER_OPTIONS = [
  { value: 'all', label: 'All Roles' },
  { value: 'client', label: 'Client' },
  { value: 'developer', label: 'Developer' },
  { value: 'ticket_manager', label: 'Ticket Manager' },
  { value: 'super_admin', label: 'Super Admin' },
]

const SUMMARY_ROLES = [
  { key: 'super_admin',    singular: 'Super Admin',     plural: 'Super Admins' },
  { key: 'ticket_manager', singular: 'Ticket Manager',  plural: 'Ticket Managers' },
  { key: 'developer',      singular: 'Developer',       plural: 'Developers' },
  { key: 'client',         singular: 'Client',          plural: 'Clients' },
]

const UsersSettings = () => {
  const queryClient = useQueryClient()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [confirmDeactivate, setConfirmDeactivate] = useState<User | null>(null)
  const [confirmResetPassword, setConfirmResetPassword] = useState<User | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: userService.getAll,
  })

  const filteredUsers = users.filter((user) => {
    const q = searchQuery.trim().toLowerCase()
    const matchesSearch =
      !q ||
      (user.firstName ?? '').toLowerCase().includes(q) ||
      (user.lastName ?? '').toLowerCase().includes(q) ||
      (user.email ?? '').toLowerCase().includes(q)
    const matchesRole = roleFilter === 'all' || user.roles.includes(roleFilter)
    return matchesSearch && matchesRole
  })

  const roleCounts = SUMMARY_ROLES
    .map(({ key, singular, plural }) => {
      const count = filteredUsers.filter((u) => u.roles.includes(key)).length
      return { count, label: count === 1 ? singular : plural }
    })
    .filter(({ count }) => count > 0)

  const summaryText = [
    `${filteredUsers.length} ${filteredUsers.length === 1 ? 'user' : 'users'}`,
    ...roleCounts.map(({ count, label }) => `${count} ${label}`),
  ].join(' · ')

  const deactivateMutation = useMutation({
    mutationFn: (user: User) => userService.softDelete(user.id),
    onSuccess: () => {
      toast.success('User deactivated successfully')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setConfirmDeactivate(null)
    },
    onError: (error: unknown) => {
      const err = error as { message?: string }
      toast.error(err?.message || 'Error deactivating user')
    },
  })

  const reactivateMutation = useMutation({
    mutationFn: (user: User) => userService.reactivate(user.id),
    onSuccess: () => {
      toast.success('User activated successfully')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error: unknown) => {
      const err = error as { message?: string }
      toast.error(err?.message || 'Error activating user')
    },
  })

  const resetPasswordMutation = useMutation({
    mutationFn: (user: User) => userService.resetPassword(user.id),
    onSuccess: () => {
      toast.success('Password reset email sent successfully')
      setConfirmResetPassword(null)
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: string } }; message?: string }
      toast.error(err?.response?.data?.error || err?.message || 'Error resetting password')
    },
  })

  const hardDeleteMutation = useMutation({
    mutationFn: (user: User) => userService.hardDelete(user.id),
    onSuccess: () => {
      toast.success('User deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setConfirmDelete(null)
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: string } }; message?: string }
      toast.error(err?.response?.data?.error || err?.message || 'Error deleting user')
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
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${user.deletedAt ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-600'}`}>
          {user.deletedAt ? 'Inactive' : 'Active'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (user: User) => {
        const items = [
          { label: 'Edit User', onClick: () => setEditUser(user) },
          user.deletedAt
            ? { label: 'Activate', onClick: () => reactivateMutation.mutate(user) }
            : { label: 'Deactivate', onClick: () => setConfirmDeactivate(user) },
          { label: 'Reset Password', onClick: () => setConfirmResetPassword(user) },
          { label: 'Delete User', variant: 'danger' as const, divider: true, onClick: () => setConfirmDelete(user) },
        ]
        return <ActionMenu items={items} />
      },
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

        <div className="mb-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by name or email…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="sm:w-44 px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            {ROLE_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <p className="text-sm text-gray-500 mb-3">{summaryText}</p>

        <Table
          data={filteredUsers}
          columns={columns}
          emptyState={<p className="text-center text-gray-400 py-8">No users found.</p>}
        />
      </div>

      <CreateUserModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
      <EditUserModal user={editUser} onClose={() => setEditUser(null)} />

      {/* Deactivate confirmation modal */}
      {confirmDeactivate && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        >
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Deactivate User</h3>
            <p className="text-gray-600 text-sm mb-4">
              Are you sure you want to deactivate{' '}
              <span className="font-medium">{confirmDeactivate.firstName} {confirmDeactivate.lastName}</span>?
              They will no longer be able to log in.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeactivate(null)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deactivateMutation.mutate(confirmDeactivate)}
                disabled={deactivateMutation.isPending}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deactivateMutation.isPending ? 'Deactivating...' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password confirmation modal */}
      {confirmResetPassword && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        >
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reset Password</h3>
            <p className="text-gray-600 text-sm mb-4">
              Send a password reset link to{' '}
              <span className="font-medium">{confirmResetPassword.firstName} {confirmResetPassword.lastName}</span>?
              They will receive an email to set a new password.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmResetPassword(null)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => resetPasswordMutation.mutate(confirmResetPassword)}
                disabled={resetPasswordMutation.isPending}
                className="px-4 py-2 text-sm rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {resetPasswordMutation.isPending ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        >
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete User</h3>
            <p className="text-gray-600 text-sm mb-4">
              Permanently delete{' '}
              <span className="font-medium">{confirmDelete.firstName} {confirmDelete.lastName}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => hardDeleteMutation.mutate(confirmDelete)}
                disabled={hardDeleteMutation.isPending}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {hardDeleteMutation.isPending ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UsersSettings
