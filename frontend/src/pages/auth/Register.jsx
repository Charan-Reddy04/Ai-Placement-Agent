import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  GraduationCap,
  Award,
  Hash,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Phone,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';
import { useAuth } from '../../context/AuthContext';

export const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  // Current Step: 1 = Personal Details, 2 = Academic & Security
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNumber: '',
    phone: '',
    branch: 'Computer Science and Engineering',
    graduationYear: 2026,
    cgpa: '',
    activeBacklogs: 0,
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const branches = [
    'Computer Science and Engineering',
    'Information Technology',
    'Electronics and Communication',
    'Electrical and Electronics',
    'Data Science & AI',
    'Mechanical Engineering',
    'Civil Engineering',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  // Validate Step 1 before proceeding
  const handleNextStep = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!formData.rollNumber.trim()) {
      setError('Please provide your roll number or student ID.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please provide a valid college email address.');
      return;
    }

    setError('');
    setCurrentStep(2);
  };

  // Submit Final Registration (Step 2)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.cgpa) {
      setError('Please enter your current CGPA.');
      return;
    }

    const parsedCGPA = parseFloat(formData.cgpa);
    if (isNaN(parsedCGPA) || parsedCGPA < 0 || parsedCGPA > 10) {
      setError('CGPA must be a valid number between 0.0 and 10.0');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-check.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        rollNumber: formData.rollNumber.trim().toUpperCase(),
        phone: formData.phone.trim(),
        branch: formData.branch,
        department: 'School of Computing',
        cgpa: parsedCGPA,
        activeBacklogs: parseInt(formData.activeBacklogs) || 0,
        graduationYear: parseInt(formData.graduationYear),
        skills: ['Python', 'Problem Solving', 'Web Development'],
      };

      await register(payload);
      setSuccess(true);
      setTimeout(() => {
        navigate('/student', { replace: true });
      }, 1200);
    } catch (err) {
      console.error('[Registration Error]:', err);
      const msg = err.response?.data?.message || 'Registration failed. Please verify your details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isPasswordMatching =
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword;

  return (
    <GlassCard padding="lg" className="w-full relative shadow-soft-hover max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-11 h-11 rounded-2xl bg-gradient-primary text-white flex items-center justify-center mx-auto mb-3 shadow-soft">
          <GraduationCap className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-brand-navy dark:text-slate-100">
          Create Student Account
        </h2>
        <p className="text-xs text-brand-secondary dark:text-slate-400 mt-1">
          Join CampusPilot for autonomous eligibility checks & interview coordination
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-bold mb-2">
          <span className={currentStep === 1 ? 'text-brand-teal dark:text-brand-cyan' : 'text-slate-400'}>
            1. Personal Info
          </span>
          <span className={currentStep === 2 ? 'text-brand-teal dark:text-brand-cyan' : 'text-slate-400'}>
            2. Academics & Password
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-primary transition-all duration-300 rounded-full"
            style={{ width: currentStep === 1 ? '50%' : '100%' }}
          />
        </div>
      </div>

      {/* Alert Notices */}
      {error && (
        <div className="mb-4 p-3 rounded-control text-xs font-semibold text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-control text-xs font-semibold text-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Account created! Redirecting to your Student Portal...</span>
        </div>
      )}

      {/* STEP 1: Personal Details */}
      {currentStep === 1 && (
        <form onSubmit={handleNextStep} className="space-y-4 animate-in fade-in">
          <div>
            <label className="block text-xs font-semibold text-brand-navy dark:text-slate-200 mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Vikas Reddy"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-control text-sm bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-navy dark:text-slate-200 mb-1.5">
              Roll / Registration Number *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Hash className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleChange}
                placeholder="e.g. 22CSE1099"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-control text-sm bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal transition-all uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-navy dark:text-slate-200 mb-1.5">
              College Email Address *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. vikas.reddy@campus.edu"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-control text-sm bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-navy dark:text-slate-200 mb-1.5">
              Contact Phone (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +91 98765 43210"
                className="w-full pl-10 pr-4 py-2.5 rounded-control text-sm bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal transition-all"
              />
            </div>
          </div>

          <div className="pt-2">
            <GradientButton type="submit" icon={ArrowRight} size="lg" className="w-full">
              Continue to Academic Details
            </GradientButton>
          </div>
        </form>
      )}

      {/* STEP 2: Academic Metrics & Password */}
      {currentStep === 2 && (
        <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in">
          <div>
            <label className="block text-xs font-semibold text-brand-navy dark:text-slate-200 mb-1.5">
              Branch / Discipline *
            </label>
            <select
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-control text-sm bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal"
            >
              {branches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-brand-navy dark:text-slate-200 mb-1.5">
                Current CGPA (0-10) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Award className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  name="cgpa"
                  value={formData.cgpa}
                  onChange={handleChange}
                  placeholder="8.75"
                  required
                  className="w-full pl-10 pr-3 py-2.5 rounded-control text-sm bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-navy dark:text-slate-200 mb-1.5">
                Active Backlogs *
              </label>
              <input
                type="number"
                min="0"
                name="activeBacklogs"
                value={formData.activeBacklogs}
                onChange={handleChange}
                placeholder="0"
                required
                className="w-full px-3.5 py-2.5 rounded-control text-sm bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-navy dark:text-slate-200 mb-1.5">
              Graduation Year *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <GraduationCap className="w-4 h-4" />
              </div>
              <input
                type="number"
                name="graduationYear"
                value={formData.graduationYear}
                onChange={handleChange}
                min="2024"
                max="2030"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-control text-sm bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-navy dark:text-slate-200 mb-1.5">
              Create Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="w-full pl-10 pr-10 py-2.5 rounded-control text-sm bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-brand-teal"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-brand-navy dark:text-slate-200">
                Confirm Password *
              </label>
              {isPasswordMatching && (
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Passwords Match
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-control text-sm bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-brand-teal"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => {
                setError('');
                setCurrentStep(1);
              }}
              className="flex-1 py-3 px-4 rounded-control text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <GradientButton
              type="submit"
              loading={loading}
              icon={ArrowRight}
              size="lg"
              className="flex-[2]"
            >
              Complete Registration
            </GradientButton>
          </div>
        </form>
      )}

      {/* Footer link to login */}
      <div className="mt-6 pt-5 border-t border-slate-200/60 dark:border-slate-800 text-center text-xs text-brand-secondary dark:text-slate-400">
        Already registered?{' '}
        <Link
          to="/login"
          className="font-bold text-brand-teal dark:text-brand-cyan hover:underline inline-flex items-center gap-1"
        >
          <span>Sign In to your account</span>
          <Sparkles className="w-3 h-3 inline" />
        </Link>
      </div>
    </GlassCard>
  );
};

export default Register;
