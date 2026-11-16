import React from 'react';

export const GlassCard = ({
  children,
  className = '',
  hoverEffect = false,
  inset = false,
  padding = 'md',
  onClick,
  ...props
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }[padding] || 'p-6';

  const baseStyle = inset
    ? 'inset-panel rounded-card'
    : 'glass-panel rounded-card';

  const hoverStyle = hoverEffect ? 'glass-panel-hover cursor-pointer' : '';

  return (
    <div
      onClick={onClick}
      className={`${baseStyle} ${hoverStyle} ${paddingClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
