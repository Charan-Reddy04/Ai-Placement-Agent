import React from 'react';
import { Loader2 } from 'lucide-react';

export const GradientButton = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3.5 py-1.5 text-xs rounded-control gap-1.5',
    md: 'px-5 py-2.5 text-sm rounded-control gap-2',
    lg: 'px-6 py-3.5 text-base rounded-control-lg gap-2.5',
  }[size] || 'px-5 py-2.5 text-sm rounded-control gap-2';

  const variantClasses = {
    primary: 'btn-gradient border border-white/20',
    secondary: 'bg-white/70 dark:bg-slate-800/80 backdrop-blur-md text-brand-navy dark:text-slate-100 border border-brand-teal/20 dark:border-brand-cyan/20 hover:border-brand-teal/40 shadow-soft hover:shadow-soft-hover',
    outline: 'bg-transparent border border-brand-teal text-brand-teal dark:text-brand-cyan hover:bg-brand-teal/10',
    ghost: 'bg-transparent text-brand-secondary dark:text-slate-300 hover:bg-brand-teal/10 dark:hover:bg-slate-800/60',
  }[variant] || 'btn-gradient';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium transition-all duration-200 select-none disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export default GradientButton;
