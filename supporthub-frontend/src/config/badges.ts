import { StatusType } from '@/types';

type Variant = 'default' | 'success' | 'warning' | 'error';

interface BadgeConfig {
  variants: Record<Variant, string>;
}

interface StatusConfig {
  types: Record<StatusType, {
    className: string;
    text: string;
  }>;
}

export const badgeConfig: BadgeConfig = {
  variants: {
    default: 'bg-[#F3F4F6] text-[#374151]',
    success: 'bg-[#ECFDF5] text-[#059669]',
    warning: 'bg-[#FEF3C7] text-[#D97706]',
    error: 'bg-[#FEE2E2] text-[#DC2626]'
  }
};

export const statusConfig: StatusConfig = {
  types: {
    'new': {
      text: 'New',
      className: 'bg-[#FEF3C7] text-[#D97706]'
    },
    'assigned': {
      text: 'Assigned',
      className: 'bg-[#EDE9FE] text-[#7C3AED]'
    },
    'in_progress': {
      text: 'In Progress',
      className: 'bg-[#EFF6FF] text-[#3B82F6]'
    },
    'awaiting_client': {
      text: 'Awaiting Client',
      className: 'bg-[#FFF7ED] text-[#EA580C]'
    },
    'resolved': {
      text: 'Resolved',
      className: 'bg-[#F3F4F6] text-[#374151]'
    },
    'closed': {
      text: 'Closed',
      className: 'bg-[#F3F4F6] text-[#374151]'
    }
  }
};
