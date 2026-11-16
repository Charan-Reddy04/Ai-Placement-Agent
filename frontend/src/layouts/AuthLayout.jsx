import React from 'react';
import { Compass, Sparkles, ShieldCheck } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Decorative Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-brand-cyan/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-brand-teal/15 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[20%] w-[25vw] h-[25vw] rounded-full bg-brand-turquoise/15 blur-[90px] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 flex items-center justify-between max-w-6xl mx-auto w-full pt-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-control bg-gradient-primary flex items-center justify-center shadow-button shadow-brand-teal/25">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-brand-teal via-brand-turquoise to-brand-cyan bg-clip-text text-transparent">
              CampusPilot
            </h1>
            <p className="text-[11px] font-medium text-brand-secondary dark:text-slate-400">
              AI Placement & Interview Agent
            </p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 text-center py-4 text-xs text-brand-secondary dark:text-slate-400">
        <div className="flex items-center justify-center gap-4 mb-1">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-teal" />
            Enterprise Role-Based Access
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-cyan" />
            Groq AI Powered
          </span>
        </div>
        <p>© 2026 CampusPilot Operations. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AuthLayout;

