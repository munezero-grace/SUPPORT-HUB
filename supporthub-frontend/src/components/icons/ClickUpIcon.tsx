import { IconProps } from '@/types/interfaces/Props';

export function ClickUpIcon({ className = "w-8 h-8" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.16 4.61A6.27 6.27 0 0 0 12 4a6.27 6.27 0 0 0-8.16 9.48l7.45 7.45a1 1 0 0 0 1.42 0l7.45-7.45a6.27 6.27 0 0 0 0-8.87zM12 17l-6.75-6.75a4.27 4.27 0 1 1 6.75-4.25 4.27 4.27 0 1 1 6.75 4.25z" />
    </svg>
  );
}
