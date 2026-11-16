import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-page-light dark:bg-gradient-page-dark">
        <div className="glass-panel p-6 rounded-card flex items-center gap-3 shadow-soft">
          <Loader2 className="w-5 h-5 text-brand-teal animate-spin" />
          <span className="text-xs font-semibold text-brand-navy dark:text-slate-100">
            Verifying Authentication Session...
          </span>
        </div>
      </div>
    );
  }

  // Not authenticated -> redirect to Login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // If authenticated but unauthorized for this portal, redirect to their role's home
    const redirectPath = user.role === 'admin' ? '/admin' : '/student';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;

