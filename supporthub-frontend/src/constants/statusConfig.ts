import { CheckCircleIcon, ExclamationCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/solid'

export const statusConfig = {
  'open': {
    icon: ExclamationCircleIcon,
    text: 'Open',
    className: 'bg-[#FEF3C7] text-[#D97706]'
  },
  'in-progress': {
    icon: ClockIcon,
    text: 'In Progress',
    className: 'bg-[#EFF6FF] text-[#3B82F6]'
  },
  'resolved': {
    icon: CheckCircleIcon,
    text: 'Resolved',
    className: 'bg-[#F3F4F6] text-[#374151]'
  },
  'closed': {
    icon: XCircleIcon,
    text: 'Closed',
    className: 'bg-[#F3F4F6] text-[#374151]'
  }
}

