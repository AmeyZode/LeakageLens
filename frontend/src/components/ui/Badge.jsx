import React from 'react';
import { cn } from '../../utils/cn';

export const Badge = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const variants = {
    default: 'border-transparent bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    critical: 'border-rose-500/30 bg-rose-500/10 text-rose-400 border font-semibold',
    major: 'border-amber-500/30 bg-amber-500/10 text-amber-400 border font-semibold',
    minor: 'border-sky-500/30 bg-sky-500/10 text-sky-400 border',
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 border',
    secondary: 'border-slate-700 bg-slate-800 text-slate-300 border',
    outline: 'text-slate-300 border border-slate-700',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2',
        variants[variant] || variants.default,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
