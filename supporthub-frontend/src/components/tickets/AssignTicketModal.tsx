'use client'
import React, { useState, useEffect } from 'react'
import { ticketService } from '@/services/tickets.service'
import { userService } from '@/services/user.service'
import { toast } from 'react-toastify'
import { useNotifications } from '@/context/NotificationContext'

interface TeamMember {
  id: string
  firstName: string
  lastName: string
  email: string
  roles: string[]
}

interface AssignTicketModalProps {
  isOpen: boolean
  onClose: () => void
  ticketId: string
  ticketTitle: string
  ticketCode?: string
  onAssigned: () => void
}

export default function AssignTicketModal({
  isOpen,
  onClose,
  ticketId,
  ticketTitle,
  ticketCode,
  onAssigned,
}: AssignTicketModalProps) {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [deadline, setDeadline] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const { addNotification } = useNotifications()

  useEffect(() => {
    if (!isOpen) return
    setFetching(true)
    userService.getTeamMembers()
      .then(setTeam)
      .catch(() => toast.error('Failed to load team members'))
      .finally(() => setFetching(false))
  }, [isOpen])

  const handleAssign = async () => {
    if (!selectedId) return
    setLoading(true)
    try {
      await ticketService.assignTicket(ticketId, selectedId, deadline || undefined)
      const member = team.find((m) => m.id === selectedId)
      const memberName = member ? `${member.firstName} ${member.lastName}` : 'a team member'
      toast.success(`Ticket assigned to ${memberName}`)
      addNotification({
        type: 'ticket_assigned',
        title: 'Ticket Assigned',
        description: `"${ticketTitle}" assigned to ${memberName}.`,
        ticketCode,
      })
      onAssigned()
      onClose()
    } catch {
      toast.error('Failed to assign ticket')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Assign Ticket</h2>
        <p className="text-sm text-gray-500 mb-4 truncate">"{ticketTitle}"</p>

        {fetching ? (
          <p className="text-sm text-gray-400 py-4 text-center">Loading team members...</p>
        ) : team.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">
            No developers or ticket managers found.
          </p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
            {team.map((member) => (
              <label
                key={member.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedId === member.id
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="assignee"
                  value={member.id}
                  checked={selectedId === member.id}
                  onChange={() => setSelectedId(member.id)}
                  className="accent-black"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {member.firstName} {member.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{member.email}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {member.roles.map((r) => (
                    <span key={r} className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                      {r.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </label>
            ))}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deadline <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="datetime-local"
            value={deadline}
            min={new Date().toISOString().slice(0, 16)}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-800"
          />
          <p className="text-xs text-gray-400 mt-1">Leave blank to keep the AI-assigned due date</p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedId || loading}
            className="px-4 py-2 text-sm rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-40"
          >
            {loading ? 'Assigning...' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  )
}
