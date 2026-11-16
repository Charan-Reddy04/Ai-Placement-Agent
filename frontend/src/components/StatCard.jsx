import React from 'react';
import GlassCard from './GlassCard';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  change,
  trend = 'up',
  subtitle,
  icon: Icon,
  accentColor = 'teal',
  className = '',
}) => {
  const accentStyles = {
    teal: 'from-[#009EAD]/15 to-[#00B8C7]/10 text-brand-teal border-brand-teal/20',
    turquoise: 'from-[#00B8C7]/15 to-[#38BDF8]/10 text-brand-turquoise border-brand-turquoise/20',
    cyan: 'from-[#38BDF8]/15 to-[#00B8C7]/10 text-brand-cyan border-brand-cyan/20',
    green: 'from-emerald-500/15 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    orange: 'from-amber-500/15 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    coral: 'from-rose-500/15 to-pink-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20',
  }[accentColor] || 'from-[#009EAD]/15 to-[#00B8C7]/10 text-brand-teal border-brand-teal/20';

  return (
    <GlassCard hoverEffect className={`relative overflow-hidden ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-wider uppercase text-brand-secondary dark:text-slate-400">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-bold text-brand-navy dark:text-slate-100 tracking-tight">
              {value}
            </h3>
            {change && (
              <span
                className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
                  trend === 'up'
                    ? 'text-emerald-700 bg-emerald-100/80 dark:text-emerald-300 dark:bg-emerald-900/40'
                    : 'text-rose-700 bg-rose-100/80 dark:text-rose-300 dark:bg-rose-900/40'
                }`}
              >
                {trend === 'up' ? (
                  <TrendingUp className="w-3 h-3 mr-0.5 inline" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-0.5 inline" />
                )}
                {change}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-brand-secondary/80 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className={`w-12 h-12 rounded-control-lg bg-gradient-to-br ${accentStyles} border flex items-center justify-center shadow-soft shrink-0`}
          >
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {/* Subtle bottom decorative accent */}
      <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-brand-teal/20 to-transparent" />
    </GlassCard>
  );
};

export default StatCard;
