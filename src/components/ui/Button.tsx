import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'gradient' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...props
}) => {
  const isGradient = variant === 'gradient';
  
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
        {
          // Primary variant - Kodigo primary color
          'bg-kodigo-primary text-white hover:bg-kodigo-dark focus:ring-kodigo-primary shadow-md hover:shadow-lg': variant === 'primary',
          // Secondary variant - Kodigo secondary color
          'bg-kodigo-secondary text-white hover:bg-pink-600 focus:ring-kodigo-secondary shadow-md hover:shadow-lg': variant === 'secondary',
          // Gradient variant - will be handled by inline style
          'text-white hover:opacity-90 focus:ring-kodigo-primary shadow-md hover:shadow-lg': variant === 'gradient',
          // Danger variant
          'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-md hover:shadow-lg': variant === 'danger',
          // Ghost variant
          'bg-transparent text-kodigo-primary hover:bg-kodigo-light focus:ring-kodigo-primary': variant === 'ghost',
          // Sizes
          'px-3 py-2 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        },
        className
      )}
      style={isGradient ? { background: 'linear-gradient(135deg, #6B46C1 0%, #EC4899 50%, #F97316 100%)' } : undefined}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};