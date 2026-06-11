import classNames from 'classnames';

export const getStatusStyles = (status: string) => classNames(
  'px-2 py-1 rounded-full text-xs font-medium',
  {
    'bg-[#EFF6FF] text-[#3B82F6]': status === 'New',
    'bg-[#FEF3C7] text-[#D97706]': status === 'In Progress',
    'bg-[#F3F4F6] text-[#374151]': status !== 'New' && status !== 'In Progress'
  }
);

export const getPriorityStyles = (priority: string) => classNames(
  'px-2 py-1 rounded-full text-xs font-medium',
  {
    'bg-[#FEE2E2] text-[#DC2626]': priority === 'High',
    'bg-[#FEF3C7] text-[#D97706]': priority === 'Medium',
    'bg-[#ECFDF5] text-[#059669]': priority === 'Low'
  }
);

export const getProductStatusStyles = (status: string) => classNames(
  'px-2 py-1 rounded-full text-xs font-medium',
  {
    'bg-gray-400 text-white': status === 'active',
    'bg-yellow-100 text-yellow-700': status !== 'active'
  }
);

export const getNavItemStyles = (isActive: boolean) => ({
  container: classNames(
    'flex items-center px-4 py-2 text-sm font-medium rounded-lg',
    {
      'text-[#17191d] bg-[#F9FAFB]': isActive,
      'text-[#17191d] hover:text-[#111827] hover:bg-[#F9FAFB]': !isActive
    }
  ),
  icon: classNames(
    'mr-3 h-5 w-5 flex-shrink-0',
    {
      'text-[#111827]': isActive,
      'text-[#17191d]': !isActive
    }
  )
});
