'use client'

import * as React from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import type { FilterModalTicketsProps, SelectOption } from '@/types/interfaces/Props'
import { TICKET_PRIORITY_OPTIONS, TICKET_STATUS_OPTIONS } from '@/constants/ticketconfig'

const ALL_OPTION: SelectOption = { label: 'All', value: '' }

export function FilterModalTickets({
  isOpen,
  onClose,
  onApply,
  initialFilters = { status: ALL_OPTION, priority: ALL_OPTION }
}: FilterModalTicketsProps): React.ReactElement {
  const safeInitialFilters = {
    status: initialFilters?.status || ALL_OPTION,
    priority: initialFilters?.priority || ALL_OPTION
  };
  const [filters, setFilters] = React.useState({
    status: safeInitialFilters.status,
    priority: safeInitialFilters.priority
  })
  const [isApplying, setIsApplying] = React.useState(false)
  const initialFocusRef = React.useRef<HTMLButtonElement>(null)

  const handleStatusChange = React.useCallback((option: SelectOption): void => {
    setFilters(prev => ({ ...prev, status: option }))
  }, [])

  const handlePriorityChange = React.useCallback((option: SelectOption): void => {
    setFilters(prev => ({ ...prev, priority: option }))
  }, [])

  const handleApply = React.useCallback(async (): Promise<void> => {
    try {
      setIsApplying(true)
      await onApply(filters)
      onClose()
    } catch (error) {
      console.error('Error applying filters:', error)
    } finally {
      setIsApplying(false)
    }
  }, [filters, onApply, onClose])

  const handleReset = React.useCallback((): void => {
    const resetFilters = {
      status: ALL_OPTION,
      priority: ALL_OPTION
    }
    setFilters(resetFilters)
    onApply(resetFilters)
  }, [onApply])

  const handleClose = React.useCallback((): void => {
    setFilters({
      status: initialFilters.status || ALL_OPTION,
      priority: initialFilters.priority || ALL_OPTION
    })
    onClose()
  }, [initialFilters, onClose])

  const handleSubmit = React.useCallback((e: React.FormEvent): void => {
    e.preventDefault()
    void handleApply()
  }, [handleApply])

  const filterChanged = React.useMemo(() => {
    return filters.status.value !== initialFilters.status?.value ||
      filters.priority.value !== initialFilters.priority?.value
  }, [filters, initialFilters])



  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Filter Tickets"
      className="max-w-md w-full"
      description="Filter tickets by status and priority."
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
        aria-label="Filter tickets form"
      >
        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <Select
              label="All"
              value={filters.status}
              onChange={handleStatusChange}
              options={TICKET_STATUS_OPTIONS}
              className="w-full"
              aria-label="Filter by ticket status"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Priority</label>
            <Select
              label="All"
              value={filters.priority}
              onChange={handlePriorityChange}
              options={TICKET_PRIORITY_OPTIONS}
              className="w-full"
              aria-label="Filter by ticket priority"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 pb-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            ref={initialFocusRef}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={!filterChanged || isApplying}
          >
            Reset
          </Button>
          <Button
            type="submit"
            loading={isApplying}
            disabled={!filterChanged || isApplying}
          >
            Apply Filters
          </Button>
        </div>
      </form>
    </Dialog>
  )
}