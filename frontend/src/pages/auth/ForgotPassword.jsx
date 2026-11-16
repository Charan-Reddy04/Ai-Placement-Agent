import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <GlassCard padding="lg" className="w-full relative shadow-soft-hover">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-brand-navy dark:text-slate-100">
          Reset Password
        </h2>
        <p className="text-sm text-brand-secondary dark:text-slate-400 mt-1">
          Enter your registered email to receive reset instructions
        </p>
      </div>

      {submitted ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-sm text-brand-navy dark:text-slate-200">
            If an account exists for <span className="font-semibold text-brand-teal">{email}</span>, a reset link has been dispatched.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-teal dark:text-brand-cyan hover:underline pt-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Login</span>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@campus.edu"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-control text-sm bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal"
              />
            </div>
          </div>

          <GradientButton
            type="submit"
            loading={loading}
            icon={Send}
            className="w-full"
            size="lg"
          >
            Send Recovery Link
          </GradientButton>

          <div className="pt-2 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-secondary dark:text-slate-400 hover:text-brand-teal dark:hover:text-brand-cyan"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </form>
      )}
    </GlassCard>
  );
};

export default ForgotPassword;

