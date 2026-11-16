import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Compass,
  LayoutDashboard,
  Building2,
  Users,
  Bot,
  CalendarCheck2,
  Bell,
  BarChart3,
  User,
  Briefcase,
  Sparkles,
  Menu,
  X,
  LogOut,
  ChevronDown
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import notificationService from '../services/notificationService';

export const Navbar = ({ role = 'admin', user = null, onLogout }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnread();
  }, [location.pathname]);

  const fetchUnread = async () => {
    try {
      const res = await notificationService.getUnreadCount();
      if (res && typeof res.unreadCount === 'number') {
        setUnreadCount(res.unreadCount);
      }
    } catch {
      // Graceful fallback if not authenticated yet
    }
  };

  const adminNavItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Companies & Jobs', path: '/admin/companies', icon: Building2 },
    { label: 'Candidates', path: '/admin/candidates', icon: Users },
    { label: 'AI Agent', path: '/admin/agent', icon: Bot, badge: 'Agentic' },
    { label: 'Coordination', path: '/admin/coordination', icon: CalendarCheck2 },
    { label: 'Notifications', path: '/admin/notifications', icon: Bell },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  ];

  const studentNavItems = [
    { label: 'Dashboard', path: '/student', icon: LayoutDashboard },
    { label: 'My Profile', path: '/student/profile', icon: User },
    { label: 'Jobs & Applications', path: '/student/jobs', icon: Briefcase },
    { label: 'Interviews & Alerts', path: '/student/interviews', icon: CalendarCheck2 },
    { label: 'AI Career Assistant', path: '/student/ai-assistant', icon: Sparkles, badge: 'AI' },
  ];

  const navItems = role === 'student' ? studentNavItems : adminNavItems;

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-6 lg:px-8 pt-3 pb-2">
      <nav className="max-w-7xl mx-auto rounded-card-lg bg-white/75 dark:bg-slate-900/80 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-soft px-4 sm:px-6 py-2.5 transition-all duration-200">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <Link to={role === 'student' ? '/student' : '/admin'} className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 rounded-control bg-gradient-primary flex items-center justify-center shadow-button shadow-brand-teal/20 transition-transform duration-200 group-hover:scale-105">
              <Compass className="w-6 h-6 text-white animate-spin-slow" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-brand-teal via-brand-turquoise to-brand-cyan bg-clip-text text-transparent">
                CampusPilot
              </span>
              <span className="text-[10px] -mt-1 font-semibold tracking-wider uppercase text-brand-secondary/80 dark:text-slate-400">
                {role === 'student' ? 'Student Portal' : 'Placement Ops'}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-control text-xs xl:text-sm font-medium transition-all duration-200 select-none ${
                    isActive
                      ? 'bg-gradient-primary text-white shadow-button shadow-brand-teal/25 font-semibold'
                      : 'text-brand-secondary dark:text-slate-300 hover:text-brand-navy dark:hover:text-white hover:bg-brand-teal/10 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                      isActive ? 'bg-white/25 text-white' : 'bg-brand-teal/15 text-brand-teal dark:text-brand-cyan'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notification Bell */}
            <Link
              to={role === 'student' ? '/student/interviews' : '/admin/notifications'}
              className="relative p-2 rounded-control bg-white/60 dark:bg-slate-800/80 backdrop-blur-md border border-white/80 dark:border-white/10 shadow-soft hover:shadow-soft-hover text-brand-secondary dark:text-slate-300 hover:text-brand-teal transition-all"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 ? (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : null}
            </Link>

            {/* User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-control bg-white/60 dark:bg-slate-800/80 backdrop-blur-md border border-white/80 dark:border-white/10 shadow-soft hover:shadow-soft-hover transition-all text-left"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-teal to-brand-cyan flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : (role === 'admin' ? 'A' : 'S')}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-brand-navy dark:text-slate-100 leading-tight">
                    {user?.name || (role === 'admin' ? 'Dr. Sharma' : 'Rahul V.')}
                  </span>
                  <span className="text-[10px] font-medium text-brand-secondary dark:text-slate-400 capitalize">
                    {user?.role || role}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-brand-secondary dark:text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-card-sm bg-white dark:bg-slate-900 border border-white/80 dark:border-white/10 shadow-card py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-brand-navy dark:text-slate-100">Signed in as</p>
                    <p className="text-xs text-brand-secondary dark:text-slate-400 truncate">
                      {user?.email || (role === 'admin' ? 'placement.officer@campus.edu' : 'rahul.v@student.edu')}
                    </p>
                  </div>
                  <Link
                    to={role === 'student' ? '/student/profile' : '/admin'}
                    className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-brand-navy dark:text-slate-200 hover:bg-brand-teal/10 dark:hover:bg-slate-800 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-brand-teal" />
                    <span>My Profile</span>
                  </Link>
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-control bg-white/60 dark:bg-slate-800/80 border border-white/80 dark:border-white/10 text-brand-navy dark:text-slate-200"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex flex-col gap-1 pb-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-control text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gradient-primary text-white font-semibold'
                      : 'text-brand-navy dark:text-slate-200 hover:bg-brand-teal/10 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-white/20 text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
            <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex justify-between items-center px-1">
              <span className="text-xs text-brand-secondary dark:text-slate-400">Appearance</span>
              <ThemeToggle />
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;

