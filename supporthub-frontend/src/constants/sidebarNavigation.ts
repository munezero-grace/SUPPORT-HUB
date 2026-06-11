import { NavItem } from '@/types/interfaces/interface';
import {
  DashboardIcon,
  TicketIcon,
  ClientsIcon,
  ProductIcon,
  ReportIcon,
  SettingsIcon,
  TeamIcon,
  TasksIcon,
  PriorityQueueIcon,
} from '@/components/icons';

const ADMIN_ROLES = ['super_admin', 'ticket_manager'];
const TEAM_ROLES = ['developer'];
const CLIENT_ROLES = ['client'];

export const navigation: NavItem[] = [
  // Visible to everyone
  { name: 'Dashboard', href: '/dashboard', icon: DashboardIcon },

  // Admin & Ticket Manager
  { name: 'Tickets',        href: '/dashboard/tickets',        icon: TicketIcon,        visibleTo: ADMIN_ROLES },
  { name: 'Priority Queue', href: '/dashboard/priority-queue', icon: PriorityQueueIcon, visibleTo: ADMIN_ROLES },
  { name: 'Team',           href: '/dashboard/team',           icon: TeamIcon,          visibleTo: ADMIN_ROLES },
  { name: 'Clients',  href: '/dashboard/clients', icon: ClientsIcon,  visibleTo: ['super_admin'] },
  { name: 'Products', href: '/dashboard/products',icon: ProductIcon,  visibleTo: ['super_admin'] },
  { name: 'Reports',  href: '/dashboard/reports', icon: ReportIcon,   visibleTo: ADMIN_ROLES },

  // Team Members (developers)
  { name: 'My Tasks', href: '/dashboard/my-tasks', icon: TasksIcon, visibleTo: TEAM_ROLES },

  // Clients
  { name: 'My Requests', href: '/dashboard/tickets', icon: TicketIcon, visibleTo: CLIENT_ROLES },

  { name: 'Settings', href: '/dashboard/settings', icon: SettingsIcon, visibleTo: ['super_admin'] },
];
