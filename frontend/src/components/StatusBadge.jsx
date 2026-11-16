import React from 'react';

export const StatusBadge = ({
  status = 'active',
  label,
  variant,
  size = 'md',
  showDot = true,
  className = '',
}) => {
  // Map common status terms to variants if not explicitly set
  const detectedVariant = variant || (() => {
    const s = String(status).toLowerCase();
    if (['active', 'completed', 'placed', 'selected', 'approved', 'success', 'confirmed', 'eligible'].includes(s)) {
      return 'success';
    }
    if (['pending', 'in-progress', 'in progress', 'waiting', 'reviewing', 'warning', 'scheduled'].includes(s)) {
      return 'warning';
    }
    if (['rejected', 'ineligible', 'cancelled', 'failed', 'alert', 'closed'].includes(s)) {
      return 'alert';
    }
    if (['shortlisted', 'interviewing', 'info', 'ai-analyzed'].includes(s)) {
      return 'teal';
    }
    return 'neutral';
  })();

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  }[size] || 'text-xs px-2.5 py-1 gap-1.5';

  const variantStyles = {
    success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
    alert: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
    teal: 'bg-brand-teal/10 text-brand-teal dark:text-brand-cyan border-brand-teal/20',
    neutral: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
  }[detectedVariant] || 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20';

  const dotColors = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    alert: 'bg-rose-500',
    teal: 'bg-brand-teal',
    neutral: 'bg-slate-400',
  }[detectedVariant] || 'bg-slate-400';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border backdrop-blur-sm select-none capitalize ${sizeStyles} ${variantStyles} ${className}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors} shrink-0 animate-pulse`} />
      )}
      <span>{label || status}</span>
    </span>
  );
};

export default StatusBadge;

