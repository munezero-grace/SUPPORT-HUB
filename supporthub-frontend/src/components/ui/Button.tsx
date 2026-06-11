import { forwardRef } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { ButtonProps } from '@/types/interfaces/Props';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', loading = false, children, disabled, ...props }, ref) => {
    const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center';
     
    const variants = {
      primary: 'bg-black text-white hover:bg-gray-900 focus:ring-black',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-black',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-black'
    };
     
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };
     
    const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
     
    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <LoadingSpinner size="sm" color="white" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
