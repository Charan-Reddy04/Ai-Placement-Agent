import React from 'react';
import Navbar from '../components/Navbar';

export const StudentLayout = ({ children, user, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-page-light dark:bg-gradient-page-dark transition-colors duration-300">
      <Navbar role="student" user={user} onLogout={onLogout} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-12">
        {children}
      </main>
      <footer className="py-4 text-center text-xs text-brand-secondary dark:text-slate-400 border-t border-slate-200/40 dark:border-white/5">
        <p>© 2026 CampusPilot • Student Career & Placement Portal</p>
      </footer>
    </div>
  );
};

export default StudentLayout;

