import { IconProps } from './interfaces/Props'
import { RESPONSE_STATUS } from '@/constants/errorMessages'

export type GoogleIconProps = IconProps
export type Size = 'sm' | 'md' | 'lg'
export type Status = 'open' | 'in-progress' | 'resolved' | 'closed'
export type StatusType = 'open' | 'in-progress' | 'resolved' | 'closed'

export * from './clients'

export interface ActionItem {
  label: string
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export interface ActionMenuProps {
  items: ActionItem[]
}


export interface ServiceResponse<T = unknown> {
  status: typeof RESPONSE_STATUS.SUCCESS | typeof RESPONSE_STATUS.ERROR;
  data?: T;
  message?: string;
}

export interface SuccessResponse<T> extends ServiceResponse<T> {
  status: typeof RESPONSE_STATUS.SUCCESS;
  data: T;
}

export interface ErrorResponse extends ServiceResponse<never> {
  status: typeof RESPONSE_STATUS.ERROR;
  message: string;
  data?: never;
}