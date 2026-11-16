import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles, Shield, AlertCircle, X, ShieldAlert } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, bootstrapAdmin } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initial Admin Setup State
  const [needsAdminSetup, setNeedsAdminSetup] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');

  useEffect(() => {
    authService.getSetupStatus()
      .then((res) => {
        if (res?.needsAdminSetup) {
          setNeedsAdminSetup(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleAdminChange = (e) => {
    setAdminFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (adminError) setAdminError('');
  };

  const handleAdminBootstrap = async (e) => {
    e.preventDefault();
    if (!adminFormData.name || !adminFormData.email || !adminFormData.password) {
      setAdminError('Please fill in all administrator credentials.');
      return;
    }
    if (adminFormData.password !== adminFormData.confirmPassword) {
      setAdminError('Passwords do not match.');
      return;
    }

    setAdminLoading(true);
    setAdminError('');

    try {
      await bootstrapAdmin({
        name: adminFormData.name.trim(),
        email: adminFormData.email.trim(),
        password: adminFormData.password,
      });
      setShowAdminModal(false);
      navigate('/admin', { replace: true });
    } catch (err) {
      console.error('[Admin Bootstrap Error]:', err);
      const msg = err.response?.data?.message || 'Failed to create initial administrator.';
      setAdminError(msg);
    } finally {
      setAdminLoading(false);
    }
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

      {/* Needs Admin Setup Banner */}
      {needsAdminSetup && (
        <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-300 dark:border-amber-700/50 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-bold">Initial Setup Needed</p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300">
                No Administrator exists yet. Create your first Placement Officer account.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAdminModal(true)}
            className="w-full mt-1 py-1.5 px-3 rounded-control text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-sm transition-all"
          >
            Create Initial Admin Account
          </button>
        </div>
      )}

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

      {/* Direct Link to Setup Admin */}
      <div className="mt-2 text-center text-xs text-brand-secondary dark:text-slate-400">
        Placement Officer?{' '}
        <Link
          to="/setup-admin"
          className="font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
        >
          <span>Create Admin Account</span>
          <Shield className="w-3 h-3 inline" />
        </Link>
      </div>

      {/* Admin Bootstrap Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-white/10 relative">
            <button
              type="button"
              onClick={() => setShowAdminModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4 text-brand-teal dark:text-brand-cyan">
              <Shield className="w-6 h-6" />
              <h3 className="text-lg font-bold text-brand-navy dark:text-slate-100">
                Setup Initial Placement Administrator
              </h3>
            </div>

            <p className="text-xs text-brand-secondary dark:text-slate-400 mb-4">
              Enter credentials to initialize the primary University Administrator account.
            </p>

            {adminError && (
              <div className="mb-4 p-3 rounded-control text-xs font-semibold text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{adminError}</span>
              </div>
            )}

            <form onSubmit={handleAdminBootstrap} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-brand-navy dark:text-slate-200 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={adminFormData.name}
                  onChange={handleAdminChange}
                  placeholder="e.g. Dr. Anita Sharma"
                  required
                  className="w-full px-3.5 py-2 rounded-control text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-brand-navy dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-navy dark:text-slate-200 mb-1">
                  Admin Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={adminFormData.email}
                  onChange={handleAdminChange}
                  placeholder="e.g. admin.placement@campus.edu"
                  required
                  className="w-full px-3.5 py-2 rounded-control text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-brand-navy dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-navy dark:text-slate-200 mb-1">
                  Master Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={adminFormData.password}
                  onChange={handleAdminChange}
                  placeholder="Enter secure password"
                  required
                  className="w-full px-3.5 py-2 rounded-control text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-brand-navy dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-navy dark:text-slate-200 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={adminFormData.confirmPassword}
                  onChange={handleAdminChange}
                  placeholder="Re-enter password"
                  required
                  className="w-full px-3.5 py-2 rounded-control text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-brand-navy dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="flex-1 py-2 px-3 rounded-control text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <GradientButton
                  type="submit"
                  loading={adminLoading}
                  className="flex-1"
                  size="md"
                >
                  Create & Launch Admin
                </GradientButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </GlassCard>
  );
};

export default Login;
