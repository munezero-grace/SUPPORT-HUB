import { Stats } from '@/types/interfaces/interface';

export const stats: Stats[] = [
  {
    name: 'Total Tickets',
    value: '127',
    change: '+5.2%',
    changeType: 'increase' as const,
    info: 'from last month'
  },
  {
    name: 'Open Tickets',
    value: '42',
    change: '-2.5%',
    changeType: 'decrease' as const,
    info: 'from last month'
  },
  {
    name: 'SLA Compliance',
    value: '94.3%',
    change: '+1.1%',
    changeType: 'increase' as const,
    info: 'from last month'
  },
  {
    name: 'Avg. Response Time',
    value: '2.4h',
    change: '-0.3h',
    changeType: 'decrease' as const,
    info: 'from last month'
  },
];
