'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ticketService } from '@/services/tickets.service'
import { format } from 'date-fns'
import type { PageProps } from '@/types/TicketTypes'
import type { Ticket, TicketNote, TicketComment } from '@/types/interfaces/interface'
import Image from 'next/image'
import { useState } from 'react'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { PriorityScoreBadge } from '@/components/tickets/PriorityScoreBadge'
import { useNotifications } from '@/context/NotificationContext'

const AGE_SATURATION_DAYS = 14

function ScoreBreakdown({ ticket }: { ticket: Ticket }) {
    if (ticket.priorityScore == null) return null

    const createdMs = new Date(ticket.createdAt || ticket.created || '').getTime()
    const ageDays = Number.isFinite(createdMs)
        ? (Date.now() - createdMs) / (1000 * 60 * 60 * 24)
        : 0
    const ageScore = Math.min(ageDays / AGE_SATURATION_DAYS, 1)
    const emotionScore = ticket.emotionScore ?? 0.5
    const complexityScore = ticket.complexityScore ?? 0.5

    const factors = [
        {
            label: 'Emotion',
            description: 'Tone & urgency in the writing',
            weight: 0.4,
            score: emotionScore,
            barColor: 'bg-rose-400',
            textColor: 'text-rose-600',
        },
        {
            label: 'Complexity',
            description: 'Technical severity & business impact',
            weight: 0.35,
            score: complexityScore,
            barColor: 'bg-amber-400',
            textColor: 'text-amber-600',
        },
        {
            label: 'Age',
            description: `${ageDays.toFixed(1)} days old (saturates at ${AGE_SATURATION_DAYS}d)`,
            weight: 0.25,
            score: ageScore,
            barColor: 'bg-blue-400',
            textColor: 'text-blue-600',
        },
    ]

    return (
        <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-0.5">AI Score Breakdown</h3>
                <p className="text-xs text-gray-400 mb-4">How this ticket&apos;s priority score was computed</p>
                <div className="space-y-4">
                    {factors.map(f => {
                        const contribution = f.score * f.weight
                        return (
                            <div key={f.label}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <div>
                                        <span className="text-sm font-semibold text-gray-700">{f.label}</span>
                                        <span className="text-xs text-gray-400 ml-2">{Math.round(f.weight * 100)}% weight</span>
                                    </div>
                                    <span className={`text-xs font-bold ${f.textColor}`}>
                                        {f.score.toFixed(2)} &rarr; +{contribution.toFixed(2)}
                                    </span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${f.barColor} rounded-full`}
                                        style={{ width: `${f.score * 100}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-0.5">{f.description}</p>
                            </div>
                        )
                    })}
                    <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-500">Total Score</span>
                        <span className="text-sm font-bold text-gray-900">{ticket.priorityScore.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function TicketDetailsPage({ params }: PageProps) {
    const router = useRouter()
    const queryClient = useQueryClient()
    const { ticketCode } = React.use(params)
    const ticketId = ticketCode
    const [selectedStatus, setSelectedStatus] = useState('')
    const [ticketUUID, setTicketUUID] = useState<string>('')
    const [noteInput, setNoteInput] = useState('')
    const [localNotes, setLocalNotes] = useState<TicketNote[]>([])
    const [commentInput, setCommentInput] = useState('')
    const [localComments, setLocalComments] = useState<TicketComment[]>([])
    const { user } = useCurrentUser();
    const isAdmin = user?.role === 'super_admin' || user?.role === 'ticket_manager'
    const canSeeNotes = user?.role === 'super_admin' || user?.role === 'ticket_manager' || user?.role === 'developer'
    const canUpdateStatus = canSeeNotes
    const { addNotification } = useNotifications()
    const { data: response, isLoading } = useQuery<{ data: Ticket } | Ticket>({
        queryKey: ['ticket', ticketId],
        queryFn: () => ticketService.getTicketByCode(ticketId),
        retry: 1
    })
    React.useEffect(() => {
        if (response) {
            const ticketData = 'data' in response ? response.data : response
            setSelectedStatus(ticketData.status || '')
            if (ticketData.id) setTicketUUID(ticketData.id)
            setLocalNotes(ticketData.TicketNotes || [])
            setLocalComments(ticketData.TicketComments || [])
        }
    }, [response])
    const updateMutation = useMutation({
        mutationFn: (updateData: { status?: string; priority?: string }) =>
            ticketService.updateTicket(ticketUUID, updateData),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })
            const updatedTicket = data?.data || data
            setSelectedStatus(updatedTicket.status || '')
            addNotification({
                type: 'status_change',
                title: 'Status Updated',
                description: `"${updatedTicket.title}" was changed to ${(updatedTicket.status || '').replace(/_/g, ' ')}.`,
                ticketCode: ticketId,
            })
        }
    })
    const notesMutation = useMutation({
        mutationFn: (text: string) => ticketService.addNote(ticketUUID, text),
        onSuccess: (data) => {
            const newNote: TicketNote = data?.data ?? data
            setLocalNotes((prev) => [...prev, newNote])
            setNoteInput('')
        }
    })
    const commentMutation = useMutation({
        mutationFn: (text: string) => ticketService.addComment(ticketUUID, text),
        onSuccess: (data) => {
            const newComment: TicketComment = data?.data ?? data
            setLocalComments((prev) => [...prev, newComment])
            setCommentInput('')
        }
    })
    const handleAddComment = () => {
        if (!commentInput.trim() || !ticketUUID) return
        commentMutation.mutate(commentInput.trim())
    }
    const handleUpdateTicket = () => {
        if (!selectedStatus) return
        updateMutation.mutate({ status: selectedStatus })
    }
    const handleAddNote = () => {
        if (!noteInput.trim() || !ticketUUID) return
        notesMutation.mutate(noteInput.trim())
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    if (!response) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-2xl font-semibold text-gray-900">Ticket not found</h1>
                <button
                    onClick={() => router.back()}
                    className="mt-4 text-sm text-gray-600 hover:text-gray-900"
                >
                    Go back
                </button>
            </div>
        )
    }

    const ticket = 'data' in response ? response.data : response

    const formatDate = (dateString?: string) => {
        if (!dateString) return ''
        return format(new Date(dateString), 'MMM d, yyyy \'at\' h:mm a')
    }

    const getStatusColor = (status: string) => {
        const statusColors: Record<string, string> = {
            new: 'bg-blue-100 text-blue-800',
            active: 'bg-green-100 text-green-800',
            in_progress: 'bg-blue-500 text-white',
            assigned: 'bg-purple-100 text-purple-800',
            awaiting_client: 'bg-orange-100 text-orange-800',
            pending: 'bg-yellow-100 text-yellow-800',
            resolved: 'bg-gray-100 text-gray-800',
            closed: 'bg-red-100 text-red-800',
        }
        return statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800'
    }

    const formatStatusDisplay = (status: string) => {
        return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex items-center mb-8 gap-3">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-500 hover:text-gray-700 transition-colors p-1"
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                </button>

                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {ticket.ticketCode}
                    </h1>
                    <span
                        className={`${getStatusColor(
                            ticket.status
                        )} px-3 py-1 rounded-2xl text-sm font-medium capitalize`}
                    >
                        {formatStatusDisplay(ticket.status)}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg border border-gray-200">
                        <div className="p-6 space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                {ticket.title}
                            </h2>
                            <div className="text-sm font-medium text-gray-600 mb-4">
                                <span>Reported by </span>
                                <span className="font-medium text-gray-600">
                                    {typeof ticket.client === 'object' && ticket.client
                                        ? ticket.client.companyName
                                        : typeof ticket.client === 'string'
                                            ? ticket.client
                                            : 'Unknown Client'}
                                </span>
                                <span> on </span>
                                <span className="text-gray-600">
                                    {formatDate(ticket.createdAt || ticket.created)}
                                </span>
                            </div>

                            <div className="text-gray-800 text-sm font-medium leading-relaxed mb-4">
                                {ticket.description || 'No description provided.'}
                            </div>

                            {ticket.tags && ticket.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {Array.isArray(ticket.tags) && ticket.tags.map((tag: string | { name: string }, index: number) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                                        >
                                            {typeof tag === 'object' && tag !== null ? tag.name : tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {ticket.imageUrl && (
                        <div className="mt-5 bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Attached Image</h3>
                            <div className="relative w-full h-[400px]">
                                <Image
                                    src={ticket.imageUrl}
                                    alt="Ticket attachment"
                                    fill
                                    style={{ objectFit: 'contain' }}
                                    className="rounded-lg"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-lg border border-gray-200">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Ticket Details</h3>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-600">Status</span>
                                    <span
                                        className={`${getStatusColor(
                                            ticket.status
                                        )} px-2.5 py-1 rounded-2xl text-xs font-semibold capitalize`}
                                    >
                                        {formatStatusDisplay(ticket.status)}
                                    </span>
                                </div>

                                {canSeeNotes && (
                                    <div className="flex flex-col gap-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-gray-600">Priority Score</span>
                                            {ticket.lastScoredAt && (
                                                <span className="text-[10px] text-gray-400">
                                                    scored {formatDate(ticket.lastScoredAt)}
                                                </span>
                                            )}
                                        </div>
                                        <PriorityScoreBadge score={ticket.priorityScore} confidence={ticket.confidence} llmReasoning={ticket.llmReasoning} priority={ticket.priority} variant="detailed" showTriage={true} />
                                    </div>
                                )}

                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-600">Client</span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {typeof ticket.client === 'object' && ticket.client
                                            ? ticket.client.companyName
                                            : typeof ticket.client === 'string'
                                                ? ticket.client
                                                : 'Unknown Client'}
                                    </span>
                                </div>
                                {ticket.product && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-gray-700">Product</span>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {typeof ticket.product === 'object' && ticket.product.name
                                                ? ticket.product.name
                                                : typeof ticket.product === 'string'
                                                    ? ticket.product
                                                    : 'No product assigned'}
                                        </span>
                                    </div>
                                )}

                                {ticket.UserTickets && ticket.UserTickets.length > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">Assignee</span>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {ticket.UserTickets[0].user.firstName} {ticket.UserTickets[0].user.lastName}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-700">Created</span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {formatDate(ticket.createdAt || ticket.created)}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-600">Updated</span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {formatDate(ticket.lastUpdated || ticket.createdAt)}
                                    </span>
                                </div>

                                {ticket.dueDate && (() => {
                                    const due = new Date(ticket.dueDate)
                                    const now = new Date()
                                    const hoursLeft = (due.getTime() - now.getTime()) / 3_600_000
                                    const isOverdue = hoursLeft < 0
                                    const isUrgent  = !isOverdue && hoursLeft < 24
                                    const color = isOverdue ? 'text-red-600' : isUrgent ? 'text-orange-500' : 'text-gray-900'
                                    const label = isOverdue ? 'Overdue' : isUrgent ? `Due in ${Math.round(hoursLeft)}h` : null
                                    return (
                                        <div className={`flex justify-between items-center ${isOverdue || isUrgent ? 'bg-red-50 -mx-2 px-2 py-1 rounded-lg' : ''}`}>
                                            <span className="text-sm font-bold text-gray-600">Due Date</span>
                                            <div className="text-right">
                                                <span className={`text-sm font-semibold ${color}`}>{formatDate(ticket.dueDate)}</span>
                                                {label && <p className={`text-[10px] font-bold ${color}`}>{label}</p>}
                                            </div>
                                        </div>
                                    )
                                })()}
                            </div>
                        </div>
                    </div>
                    {canSeeNotes && <ScoreBreakdown ticket={ticket} />}

                    {/* ── Customer Conversation ── */}
                    <div className="rounded-lg border border-blue-200 bg-white overflow-hidden" style={{ borderLeftWidth: '4px', borderLeftColor: '#3b82f6' }}>
                        <div className="px-5 py-4 border-b border-blue-100 bg-blue-50 flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <div>
                                <h3 className="text-sm font-semibold text-blue-900">External Conversation</h3>
                                <p className="text-[11px] text-blue-500">Visible to client and support team</p>
                            </div>
                        </div>
                        <div className="p-5">
                            {localComments.length === 0 && (
                                <p className="text-xs text-gray-400 mb-4 italic">No messages yet. Start the conversation.</p>
                            )}
                            {localComments.length > 0 && (
                                <div className="space-y-3 mb-4">
                                    {localComments.map((c) => (
                                        <div key={c.id} className="flex gap-3">
                                            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700 uppercase">
                                                {c.user.firstName[0]}{c.user.lastName[0]}
                                            </div>
                                            <div className="flex-1 bg-blue-50 rounded-lg px-3 py-2 border border-blue-100">
                                                <div className="flex items-baseline gap-2 mb-1">
                                                    <span className="text-xs font-semibold text-blue-900">{c.user.firstName} {c.user.lastName}</span>
                                                    <span className="text-[10px] text-blue-400">{format(new Date(c.createdAt), 'MMM d \'at\' h:mm a')}</span>
                                                </div>
                                                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{c.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <textarea
                                value={commentInput}
                                onChange={(e) => setCommentInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment() } }}
                                placeholder="Write a reply to the customer... (Enter to send)"
                                rows={2}
                                className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none text-gray-800 placeholder-blue-300 bg-blue-50"
                            />
                            <button
                                onClick={handleAddComment}
                                disabled={commentMutation.isPending || !commentInput.trim() || !ticketUUID}
                                className="mt-2 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                {commentMutation.isPending ? 'Sending…' : '↩ Reply to Customer'}
                            </button>
                        </div>
                    </div>

                    {/* ── Divider ── */}
                    {canSeeNotes && (
                        <div className="flex items-center gap-3 py-1">
                            <div className="flex-1 h-px bg-gray-200" />
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">Staff only below</span>
                            <div className="flex-1 h-px bg-gray-200" />
                        </div>
                    )}

                    {/* ── Internal Notes ── */}
                    {canSeeNotes && (
                    <div className="rounded-lg border border-amber-300 bg-amber-50 overflow-hidden" style={{ borderLeftWidth: '4px', borderLeftColor: '#f59e0b' }}>
                        <div className="px-5 py-4 border-b border-amber-200 bg-amber-100 flex items-center gap-2">
                            <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <div>
                                <h3 className="text-sm font-semibold text-amber-900 flex items-center gap-1.5">
                                    Internal Notes — Staff only
                                </h3>
                                <p className="text-[11px] font-bold text-amber-700">Not visible to the client</p>
                            </div>
                        </div>
                        <div className="p-5">
                            {localNotes.length === 0 && (
                                <p className="text-xs text-amber-600 mb-4 italic">No internal notes yet.</p>
                            )}
                            {localNotes.length > 0 && (
                                <div className="space-y-3 mb-4">
                                    {localNotes.map((note) => (
                                        <div key={note.id} className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className="text-xs font-semibold text-amber-900">
                                                    {note.user.firstName} {note.user.lastName}
                                                </span>
                                                <span className="text-[10px] text-amber-500">
                                                    {format(new Date(note.createdAt), 'MMM d, yyyy \'at\' h:mm a')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{note.text}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <textarea
                                value={noteInput}
                                onChange={(e) => setNoteInput(e.target.value)}
                                placeholder="Add an internal note — only your team will see this..."
                                rows={3}
                                className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none text-gray-800 placeholder-amber-400 bg-amber-50"
                            />
                            <button
                                onClick={handleAddNote}
                                disabled={notesMutation.isPending || !noteInput.trim() || !ticketUUID}
                                className="mt-2 w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                {notesMutation.isPending ? 'Saving…' : 'Save Internal Note'}
                            </button>
                        </div>
                    </div>
                    )}

                    {canUpdateStatus && (
                    <div className="bg-white rounded-lg border border-gray-200">
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">
                                {isAdmin ? 'Actions' : 'Update Status'}
                            </h3>
                            <div className="space-y-3">
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                                >
                                    <option value="">Select Status</option>
                                    {isAdmin ? (
                                        <>
                                            <option value="new">New</option>
                                            <option value="assigned">Assigned</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="awaiting_client">Awaiting Client</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="closed">Closed</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="in_progress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                        </>
                                    )}
                                </select>
                                <button
                                    onClick={handleUpdateTicket}
                                    disabled={updateMutation.isPending || !selectedStatus}
                                    className="w-full px-4 py-2 bg-black text-white rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {updateMutation.isPending ? 'Updating...' : 'Update Ticket'}
                                </button>
                            </div>
                        </div>
                    </div>
                    )}
                </div>
            </div>
        </div>
    )
}