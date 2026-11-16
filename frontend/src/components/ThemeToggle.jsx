import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label="Toggle theme"
      className={`relative inline-flex items-center justify-center p-2 rounded-control bg-white/60 dark:bg-slate-800/80 backdrop-blur-md border border-white/80 dark:border-white/10 shadow-soft hover:shadow-soft-hover transition-all duration-200 text-brand-secondary dark:text-slate-200 hover:text-brand-teal dark:hover:text-brand-cyan ${className}`}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-amber-400 animate-in fade-in zoom-in duration-200" />
      ) : (
        <Moon className="w-5 h-5 text-brand-teal animate-in fade-in zoom-in duration-200" />
      )}
    </button>
  );
};

export default ThemeToggle;
