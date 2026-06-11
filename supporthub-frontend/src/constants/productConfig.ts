import { SelectOption } from '@/types/interfaces/Props';

export const PRODUCT_STATUS_OPTIONS = [
  { label: 'active', value: 'active' },
  { label: 'inactive', value: 'inactive' }
];

export const PRODUCT_STATUS_STYLES = {
  active: 'bg-green-500 text-white',
  inactive: 'bg-gray-200 text-black'
} as const;

export const STATUS_OPTIONS: SelectOption[] = [
  { label: 'active', value: 'active' },
  { label: 'inactive', value: 'inactive' }
];
