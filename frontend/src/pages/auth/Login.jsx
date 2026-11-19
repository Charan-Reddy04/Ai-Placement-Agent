import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';
import { useAuth } from '../../context/AuthContext';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Send credentials to backend API
      const result = await login(formData.email, formData.password);

      // 2. Redirect based on the verified role from MongoDB
      const verifiedRole = result.user?.role;
      const targetPath = verifiedRole === 'admin' ? '/admin' : '/student';
      navigate(targetPath, { replace: true });
    } catch (err) {
      console.error('[Login Error]:', err);
      const msg = err.response?.data?.message || 'Invalid email or password. Please verify your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard padding="lg" className="w-full relative shadow-soft-hover">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-brand-navy dark:text-slate-100">
          Welcome to CampusPilot
        </h2>
        <p className="text-sm text-brand-secondary dark:text-slate-400 mt-1">
          Enter your credentials to access your placement operations portal
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-control text-xs font-semibold text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email field */}
        <div>
          <label className="block text-xs font-semibold text-brand-navy dark:text-slate-200 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-secondary dark:text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. user@campus.edu"
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-control text-sm bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal transition-all"
            />
          </div>
        </div>

        {/* Password field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-brand-navy dark:text-slate-200">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-brand-teal dark:text-brand-cyan hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-secondary dark:text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              className="w-full pl-10 pr-10 py-2.5 rounded-control text-sm bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-brand-teal dark:hover:text-brand-cyan"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <GradientButton
          type="submit"
          loading={loading}
          icon={ArrowRight}
          className="w-full mt-2"
          size="lg"
        >
          Sign In
        </GradientButton>
      </form>

      {/* Registration Link */}
      <div className="mt-6 text-center text-xs text-brand-secondary dark:text-slate-400">
        New Student?{' '}
        <Link
          to="/register"
          className="font-bold text-brand-teal dark:text-brand-cyan hover:underline inline-flex items-center gap-1"
        >
          <span>Register here</span>
          <Sparkles className="w-3 h-3 inline" />
        </Link>
      </div>
    </GlassCard>
  );
};

export default Login;
