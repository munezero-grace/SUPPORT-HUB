import { CheckCircleIcon, ExclamationCircleIcon, ClockIcon, XCircleIcon, UserCircleIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/solid'

export const statusConfig = {
  'new': {
    icon: ExclamationCircleIcon,
    text: 'New',
    className: 'bg-[#FEF3C7] text-[#D97706]'
  },
  'assigned': {
    icon: UserCircleIcon,
    text: 'Assigned',
    className: 'bg-[#EDE9FE] text-[#7C3AED]'
  },
  'in_progress': {
    icon: ClockIcon,
    text: 'In Progress',
    className: 'bg-[#EFF6FF] text-[#3B82F6]'
  },
  'awaiting_client': {
    icon: QuestionMarkCircleIcon,
    text: 'Awaiting Client',
    className: 'bg-[#FFF7ED] text-[#EA580C]'
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
