import React from 'react';

export const ProgressRing = ({
  progress = 0,
  size = 72,
  strokeWidth = 6,
  label = '',
  color = 'teal',
  showPercentage = true,
  className = '',
}) => {
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;

  const gradientId = `progress-grad-${color}-${size}`;

  return (
    <div className={`relative inline-flex flex-col items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#009EAD" />
            <stop offset="50%" stop-color="#00B8C7" />
            <stop offset="100%" stop-color="#38BDF8" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-200/80 dark:text-slate-700/60"
          fill="transparent"
        />
        {/* Fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-bold text-brand-navy dark:text-slate-100">
            {Math.round(normalizedProgress)}%
          </span>
        </div>
      )}
      {label && (
        <span className="mt-1 text-[11px] font-medium text-brand-secondary dark:text-slate-400">
          {label}
        </span>
      )}
    </div>
  );
};

export default ProgressRing;

