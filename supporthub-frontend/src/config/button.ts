type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

interface ButtonConfig {
  base: string;
  sizes: Record<ButtonSize, string>;
  variants: Record<ButtonVariant, string>;
  loading: string;
}

export const buttonConfig: ButtonConfig = {
  base: 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center',
  sizes: {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  },
  variants: {
    primary: 'bg-[#111827] text-white hover:bg-[#374151] focus:ring-[#111827]',
    secondary: 'bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB] focus:ring-[#E5E7EB]',
    outline: 'border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB] focus:ring-[#E5E7EB]',
    ghost: 'text-[#374151] hover:bg-[#F3F4F6] focus:ring-[#F3F4F6]'
  },
  loading: 'cursor-not-allowed'
};
