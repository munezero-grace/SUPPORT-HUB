import { Size } from '@/types';

type Color = 'primary' | 'secondary' | 'white';

interface SpinnerConfig {
  sizes: Record<Size, string>;
  colors: Record<Color, string>;
}

export const spinnerConfig: SpinnerConfig = {
  sizes: {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  },
  colors: {
    primary: 'text-green-600',
    secondary: 'text-gray-600',
    white: 'text-white'
  }
};
