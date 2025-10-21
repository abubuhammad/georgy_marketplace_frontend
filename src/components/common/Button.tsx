import React from 'react';
import { cn } from '@/lib/utils';
import { IconType } from '@/assets/icons';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  icon?: IconType;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconPosition = 'left',
    loading = false,
    fullWidth = false,
    children,
    disabled,
    ...props
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
    
    const variants = {
      primary: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
      secondary: 'bg-yellow-500 text-white hover:bg-yellow-600 focus-visible:ring-yellow-500',
      outline: 'border border-red-600 text-red-600 hover:bg-red-50 focus-visible:ring-red-500',
      ghost: 'text-red-600 hover:bg-red-50 focus-visible:ring-red-500',
      destructive: 'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500'
    };
    
    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base'
    };
    
    const iconSize = size === 'sm' ? 16 : size === 'lg' ? 20 : 18;
    
    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
        )}
        {Icon && iconPosition === 'left' && !loading && (
          <Icon size={iconSize} className="mr-2" />
        )}
        {children}
        {Icon && iconPosition === 'right' && !loading && (
          <Icon size={iconSize} className="ml-2" />
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };