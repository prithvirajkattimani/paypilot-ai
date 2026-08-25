import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-800 shadow-sm',
  secondary: 'bg-navy-900 text-white hover:bg-navy-800 active:bg-navy-950 shadow-sm',
  outline: 'border border-gray-300 bg-white text-navy-700 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100',
  ghost: 'text-navy-600 hover:bg-gray-100 hover:text-navy-900 active:bg-gray-200',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-sm',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
};

export const Button = ({ variant = 'primary', size = 'md', children, className = '', ...props }: ButtonProps) => (
  <button
    className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    {...props}
  >
    {children}
  </button>
);
