import React from 'react'
import { ReviewSubmitStepProps } from '@/types/TicketTypes'
import { PriorityScoreBadge } from '../PriorityScoreBadge'

function SummaryRow({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 py-2 border-b border-gray-100 last:border-b-0">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
      <span className="text-sm text-gray-900 sm:max-w-[60%] sm:text-right break-words">{value}</span>
    </div>
  )
}

function ReviewSubmitStep({
  formData,
  uploadedFiles,
  productOptions,
  isAdmin,
  isStaff,
  loading,
  submitted,
  createdTicket,
  onSubmit,
}: ReviewSubmitStepProps) {
  if (submitted && createdTicket) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-4 rounded-md bg-green-50 border border-green-200">
          <svg className="w-6 h-6 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-green-800">Ticket created successfully</p>
            <p className="text-xs text-green-700 mt-0.5">Your request has been submitted.</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-md p-4">
          <SummaryRow label="Status" value={(createdTicket.status || 'new').replace(/_/g, ' ')} />
          <SummaryRow label="Title" value={createdTicket.title || ''} />
          <SummaryRow label="Description" value={createdTicket.description || ''} />
          <SummaryRow label="Assigned To" value={createdTicket.assignee || 'Unassigned'} />
        </div>

        {isStaff && (
          <div className="bg-white border border-gray-200 rounded-md p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">AI Priority Insights</h3>
            <PriorityScoreBadge
              score={createdTicket.priorityScore}
              confidence={createdTicket.confidence}
              llmReasoning={createdTicket.llmReasoning}
              variant="detailed"
            />
            <SummaryRow
              label="Aging Score"
              value={
                createdTicket.agingScore !== undefined && createdTicket.agingScore !== null
                  ? `${Math.round(createdTicket.agingScore * 100)}%`
                  : ''
              }
            />
          </div>
        )}
      </div>
    )
  }

  const productLabel =
    productOptions.find((option) => option.value === formData.product)?.label || '—'

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        Review your ticket details below. Click &ldquo;Submit Ticket&rdquo; to create the ticket.
      </p>

      <div className="bg-white border border-gray-200 rounded-md p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Request Details</h3>
        <SummaryRow label="Category" value={formData.category || '—'} />
        <SummaryRow label="Client" value={formData.client || '—'} />
        <SummaryRow label="Product" value={productLabel} />
        {isAdmin && <SummaryRow label="Priority" value={formData.priority} />}
      </div>

      <div className="bg-white border border-gray-200 rounded-md p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Ticket</h3>
        <SummaryRow label="Title" value={formData.title} />
        <SummaryRow label="Description" value={formData.description} />
        <SummaryRow label="Contact Name" value={formData.contactName} />
        <SummaryRow label="Contact Email" value={formData.contactEmail} />
        <SummaryRow label="Contact Phone" value={formData.contactPhone} />
      </div>

      <div className="bg-white border border-gray-200 rounded-md p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Attachments</h3>
        {uploadedFiles.length > 0 ? (
          <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
            {uploadedFiles.map((fileItem, index) => (
              <li key={index}>{fileItem.name}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No files attached</p>
        )}
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={loading}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Submitting...' : 'Submit Ticket'}
      </button>
    </div>
  )
}

export default ReviewSubmitStep
