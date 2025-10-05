import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className,
  ...props
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          className={clsx(
            // use form-input from @tailwindcss/forms as a baseline when available
            'form-input block w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 shadow-sm',
            'focus:outline-none focus:ring-2 focus:ring-kodigo-primary/40 focus:border-kodigo-primary transition-colors duration-150',
            {
              // leave space for icon when provided
              'pl-10': icon,
              // error overrides
              'border-red-300 focus:ring-red-500 focus:border-red-500': error,
            },
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};