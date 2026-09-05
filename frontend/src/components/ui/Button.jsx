import React from 'react';
import { cn } from '../../utils/cn';

export const Button = React.forwardRef(({
  className,
  variant = 'default',
  size = 'default',
  children,
  disabled,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none';
  
  const variants = {
    default: 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm shadow-indigo-900/20 active:scale-[0.98]',
    destructive: 'bg-rose-600 text-white hover:bg-rose-500 shadow-sm shadow-rose-900/20 active:scale-[0.98]',
    outline: 'border border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800 hover:text-white',
    secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700 active:scale-[0.98]',
    ghost: 'text-slate-300 hover:bg-slate-800 hover:text-white',
    link: 'text-indigo-400 underline-offset-4 hover:underline p-0 h-auto',
  };

  const sizes = {
    default: 'h-9 px-4 py-2',
    sm: 'h-8 rounded-md px-3 text-xs',
    lg: 'h-10 rounded-lg px-6 text-base',
    icon: 'h-9 w-9 p-0',
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
