import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Bot,
  CalendarCheck2,
  CheckCircle2,
  ShieldCheck,
  BarChart3,
  Bell,
  ArrowRight,
  GraduationCap,
  Building2,
  Users,
  Award,
  Layers,
  ChevronRight,
  Sun,
  Moon,
  Clock,
  MapPin,
  Check,
  Shield,
  FileSpreadsheet,
  Cpu,
  Target,
  Compass,
  Briefcase
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  const [activeTab, setActiveTab] = useState('student'); // 'student' | 'admin'

  const dashboardPath = user?.role === 'admin' ? '/admin' : '/student';

  const stats = [
    { label: 'Conflict-Free Interviews', value: '100%', sub: 'Deterministic interval validation' },
    { label: 'Faster Candidate Match', value: '10x', sub: 'Groq Real LLM Agent' },
    { label: 'Eligibility Scoring', value: '< 1.2s', sub: 'Zero-error academic criteria checks' },
    { label: 'Admin Approval Gates', value: '100%', sub: 'Strict Human-in-the-Loop control' },
  ];

  const features = [
    {
      icon: Bot,
      color: 'from-brand-teal to-brand-turquoise',
      title: 'Autonomous Real LLM Placement Agent',
      desc: 'Zero-heuristic semantic job description analysis, live candidate skill intelligence, and interview scheduling workflows powered by Groq Real LLM.',
      badge: 'Real LLM Agent'
    },
    {
      icon: CalendarCheck2,
      color: 'from-brand-turquoise to-brand-cyan',
      title: 'Zero-Conflict Interview Engine',
      desc: 'Exact mathematical interval clash prevention: max(Sa, Sb) < min(Ea, Eb). Eliminates double-booking of students, faculty panels, and physical rooms.',
      badge: 'Zero Clashes'
    },
    {
      icon: Target,
      color: 'from-amber-500 to-orange-500',
      title: 'Deterministic Eligibility Engine',
      desc: 'Automatic verification of minimum CGPA, active backlogs, graduation year, and eligible branches. Fully blocks unqualified or duplicate applications.',
      badge: 'Zero Errors'
    },
    {
      icon: Compass,
      color: 'from-purple-500 to-indigo-500',
      title: 'AI Career Assistant for Students',
      desc: 'Interactive 24/7 student advisor powered by Real LLM providing tailored resume optimization, mock technical interview questions, and placement drive preparation.',
      badge: 'Student Success'
    },
    {
      icon: Bell,
      color: 'from-emerald-500 to-teal-500',
      title: 'Multi-Channel Notification Feed',
      desc: 'Instant in-app notification streams, real-time unread badges, simulated SMS/Email receipts, and priority broadcast tier filtering.',
      badge: 'Omnichannel'
    },
    {
      icon: BarChart3,
      color: 'from-sky-500 to-blue-600',
      title: 'Placement Analytics & CSV Export',
      desc: 'Real-time salary distribution metrics (average, median, highest CTC), branch-wise placement rates, package tiers, and one-click master CSV report export.',
      badge: 'Executive Intel'
    },
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Corporate Drive Launch',
      desc: 'Placement officers create enterprise profiles and publish job openings with custom academic eligibility criteria and package tier benchmarks.',
      role: 'Recruiters & Admins'
    },
    {
      step: '02',
      title: 'Instant Eligibility & Application',
      desc: 'Students verify qualifications in real time with 1 click and submit applications protected by unique compound database constraints.',
      role: 'Students'
    },
    {
      step: '03',
      title: 'Real LLM Semantic Evaluation & Staged Approval',
      desc: 'Groq Real LLM evaluates candidate resumes against JD requirements semantically, scores technical proficiency, and stages a verified plan in the admin approval queue.',
      role: 'Real LLM Agent'
    },
    {
      step: '04',
      title: 'Conflict-Free Interview Coordination',
      desc: 'Approved candidates are automatically paired with faculty interview panels and physical venue rooms without timetable overlaps.',
      role: 'Placement Cell'
    },
    {
      step: '05',
      title: 'Evaluation, Offers & Live Telemetry',
      desc: 'Panels record 1-10 scores and publish outcomes. Placements, average packages, and university report analytics update in real time.',
      role: 'All Stakeholders'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-page-light dark:bg-gradient-page-dark text-brand-navy dark:text-slate-100 transition-colors duration-300 selection:bg-brand-teal/20 selection:text-brand-teal">
      {/* 1. Sticky Navigation Bar */}
      <nav className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-brand-teal/10 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-primary flex items-center justify-center text-white shadow-soft group-hover:shadow-glow-teal transition-all">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-brand-teal via-brand-turquoise to-brand-cyan bg-clip-text text-transparent">
                CampusPilot
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-secondary dark:text-slate-400">
                AI Placement Platform
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-brand-secondary dark:text-slate-300">
            <a href="#features" className="hover:text-brand-teal dark:hover:text-brand-cyan transition-colors">
              Features
            </a>
            <a href="#agent" className="hover:text-brand-teal dark:hover:text-brand-cyan transition-colors">
              AI Agent
            </a>
            <a href="#coordination" className="hover:text-brand-teal dark:hover:text-brand-cyan transition-colors">
              Coordination
            </a>
            <a href="#workflow" className="hover:text-brand-teal dark:hover:text-brand-cyan transition-colors">
              How It Works
            </a>
            <a href="#portals" className="hover:text-brand-teal dark:hover:text-brand-cyan transition-colors">
              Portals
            </a>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-control text-brand-secondary hover:text-brand-teal dark:text-slate-300 dark:hover:text-brand-cyan bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/10 transition-all"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {isAuthenticated ? (
              <Link to={dashboardPath}>
                <GradientButton icon={ArrowRight} size="sm">
                  Go to Dashboard
                </GradientButton>
              </Link>
            ) : (
              <>
                <Link to="/login" className="hidden sm:inline-block">
                  <GradientButton variant="secondary" size="sm">
                    Sign In
                  </GradientButton>
                </Link>
                <Link to="/register">
                  <GradientButton icon={ArrowRight} size="sm">
                    Get Started
                  </GradientButton>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-brand-teal/20 via-brand-cyan/20 to-purple-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Announcement Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 border border-brand-teal/30 dark:border-brand-cyan/30 text-xs font-semibold text-brand-teal dark:text-brand-cyan shadow-sm mb-6 animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous University Placement & Interview Coordination Platform</span>
            <span className="hidden sm:inline px-2 py-0.5 rounded-full text-[10px] bg-brand-teal/10 text-brand-teal dark:text-brand-cyan font-bold">
              Groq Real LLM Active
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-tight">
            Autonomous Campus Placements with{' '}
            <span className="bg-gradient-to-r from-brand-teal via-brand-turquoise to-brand-cyan bg-clip-text text-transparent">
              Zero-Conflict Intelligence
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg md:text-xl text-brand-secondary dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Eliminate scheduling clashes, automate academic eligibility scoring, and empower candidates with 24/7 AI career coaching — backed by strict <strong>Human-in-the-Loop</strong> administrative governance.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto">
              <GradientButton icon={ArrowRight} size="lg" className="w-full sm:w-auto shadow-soft-hover">
                Explore Student Portal
              </GradientButton>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <GradientButton variant="secondary" icon={Shield} size="lg" className="w-full sm:w-auto">
                Placement Officer Sign In
              </GradientButton>
            </Link>
          </div>

          {/* Trust Metrics Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {stats.map((item, idx) => (
              <GlassCard key={idx} padding="md" className="text-center shadow-soft">
                <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-teal dark:text-brand-cyan">
                  {item.value}
                </div>
                <div className="text-xs sm:text-sm font-bold text-brand-navy dark:text-slate-200 mt-1">
                  {item.label}
                </div>
                <div className="text-[11px] text-brand-secondary dark:text-slate-400 mt-0.5">
                  {item.sub}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Interactive Preview Showcase */}
      <section id="agent" className="py-16 md:py-24 relative bg-slate-50/50 dark:bg-slate-900/30 border-y border-brand-teal/10 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-teal dark:text-brand-cyan mb-2">
              Agentic Orchestration in Action
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-navy dark:text-slate-100">
              Watch Autonomous Tools Meet Human Oversight
            </h3>
            <p className="mt-3 text-sm text-brand-secondary dark:text-slate-300">
              CampusPilot gives Placement Officers natural language controls while ensuring critical database mutations never occur without explicit approval.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Mockup Card: AI Agent Conversation */}
            <div className="lg:col-span-7">
              <GlassCard padding="none" className="overflow-hidden shadow-2xl border border-brand-teal/20 dark:border-white/10">
                {/* Terminal Header */}
                <div className="px-5 py-3.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="ml-2 text-xs font-mono font-semibold text-brand-secondary dark:text-slate-400">
                      CampusPilot Placement Agent Console
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Agent Ready</span>
                  </div>
                </div>

                {/* Simulated Conversation Body */}
                <div className="p-6 space-y-4 font-sans text-xs sm:text-sm">
                  {/* Admin Command */}
                  <div className="flex items-start gap-3 justify-end">
                    <div className="max-w-[85%] bg-gradient-primary text-white p-3.5 rounded-2xl rounded-tr-sm shadow-sm">
                      <p className="font-medium">
                        "Shortlist eligible CSE candidates for Palantir Technologies (Foundry Architect) and generate non-conflicting interview slots."
                      </p>
                    </div>
                  </div>

                  {/* Agent Response */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-brand-teal/20 text-brand-teal dark:text-brand-cyan flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="max-w-[90%] bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-sm border border-slate-200/80 dark:border-white/10 shadow-sm space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-brand-teal dark:text-brand-cyan">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Placement Agent Plan Generated</span>
                      </div>
                      <p className="text-brand-secondary dark:text-slate-300 text-xs leading-relaxed">
                        Evaluated candidate database against Palantir criteria via Real LLM semantic alignment (CGPA ≥ 7.5, Backlogs = 0, Python/Docker skills). Identified <strong>6 verified matching candidates</strong> with live competency scoring and paired with <strong>Faculty Panel 1 at Computing Lab A</strong>.
                      </p>

                      {/* Staged Slots Mini Table */}
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-white/5 space-y-1.5 font-mono text-[11px]">
                        <div className="flex justify-between text-brand-secondary dark:text-slate-400 font-bold border-b pb-1">
                          <span>Candidate</span>
                          <span>Slot Time</span>
                          <span>Clash Status</span>
                        </div>
                        <div className="flex justify-between text-brand-navy dark:text-slate-200">
                          <span>Rahul Verma (22CSE101)</span>
                          <span>10:00 - 10:45 AM</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Clear (0 Conflicts)</span>
                        </div>
                        <div className="flex justify-between text-brand-navy dark:text-slate-200">
                          <span>Sneha Patel (22CSE104)</span>
                          <span>10:45 - 11:30 AM</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Clear (0 Conflicts)</span>
                        </div>
                      </div>

                      {/* Human-in-the-Loop Action Bar */}
                      <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-700/60">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Status: Waiting for Admin Approval</span>
                        </div>
                        <span className="px-3 py-1 rounded-control text-xs font-bold text-white bg-emerald-600 shadow-sm">
                          Approve & Execute
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Right Feature Highlights */}
            <div className="lg:col-span-5 space-y-5">
              <GlassCard padding="md" className="shadow-soft hover:shadow-soft-hover transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-brand-teal/10 text-brand-teal dark:text-brand-cyan">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-brand-navy dark:text-slate-100">
                    Human-in-the-Loop Safe Governance
                  </h4>
                </div>
                <p className="text-xs text-brand-secondary dark:text-slate-300 leading-relaxed">
                  The AI Placement Agent cannot execute mutations directly. All shortlists, scheduled interviews, and mass broadcasts stage inside an administrative approval queue.
                </p>
              </GlassCard>

              <GlassCard padding="md" className="shadow-soft hover:shadow-soft-hover transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-brand-turquoise/10 text-brand-turquoise dark:text-brand-cyan">
                    <CalendarCheck2 className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-brand-navy dark:text-slate-100">
                    Mathematical Interval Protection
                  </h4>
                </div>
                <p className="text-xs text-brand-secondary dark:text-slate-300 leading-relaxed">
                  Real-time pre-flight conflict checks reject double-booking attempts across candidates, faculty evaluation panels, and physical venue rooms with instant HTTP 409 defenses.
                </p>
              </GlassCard>

              <GlassCard padding="md" className="shadow-soft hover:shadow-soft-hover transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-brand-navy dark:text-slate-100">
                    Enterprise Tier Analytics
                  </h4>
                </div>
                <p className="text-xs text-brand-secondary dark:text-slate-300 leading-relaxed">
                  Track Super Dream (≥20 LPA), Dream (10-20 LPA), and Regular packages with automated CTC calculations and streaming CSV exports.
                </p>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Features Grid */}
      <section id="features" className="py-20 md:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-teal dark:text-brand-cyan mb-2">
              Comprehensive University Platform
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-navy dark:text-slate-100">
              Engineered for Complete Placement Operations
            </h3>
            <p className="mt-3 text-sm text-brand-secondary dark:text-slate-300">
              Everything your institution needs to conduct modern, transparent, and scalable placement seasons.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <GlassCard key={idx} padding="lg" className="shadow-soft hover:shadow-soft-hover transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${feat.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-brand-secondary dark:text-slate-300 border border-slate-200/60 dark:border-white/5">
                        {feat.badge}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-brand-navy dark:text-slate-100 mb-2">
                      {feat.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-brand-secondary dark:text-slate-300 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center text-xs font-bold text-brand-teal dark:text-brand-cyan group-hover:translate-x-1 transition-transform">
                    <span>Explore Capability</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section id="workflow" className="py-20 md:py-28 bg-slate-50/50 dark:bg-slate-900/30 border-y border-brand-teal/10 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-teal dark:text-brand-cyan mb-2">
              End-to-End Workflow
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-navy dark:text-slate-100">
              The Modern Placement Season Lifecycle
            </h3>
            <p className="mt-3 text-sm text-brand-secondary dark:text-slate-300">
              How CampusPilot coordinates recruiters, placement officers, evaluation faculty, and candidates in harmony.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {workflowSteps.map((step, idx) => (
              <GlassCard key={idx} padding="md" className="shadow-soft hover:shadow-soft-hover transition-all flex flex-col justify-between relative">
                <div>
                  <div className="text-2xl font-extrabold bg-gradient-to-r from-brand-teal to-brand-cyan bg-clip-text text-transparent mb-2">
                    {step.step}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-secondary dark:text-slate-400 block mb-2">
                    {step.role}
                  </span>
                  <h4 className="text-sm font-bold text-brand-navy dark:text-slate-100 mb-1.5">
                    {step.title}
                  </h4>
                  <p className="text-xs text-brand-secondary dark:text-slate-300 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Role Comparison Portal Showcase */}
      <section id="portals" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-teal dark:text-brand-cyan mb-2">
              Dedicated User Experiences
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-navy dark:text-slate-100">
              Built for Every Campus Stakeholder
            </h3>
          </div>

          {/* Tab Selector */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab('student')}
                className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'student'
                    ? 'bg-white dark:bg-slate-900 text-brand-teal dark:text-brand-cyan shadow-sm'
                    : 'text-brand-secondary dark:text-slate-400 hover:text-brand-navy'
                }`}
              >
                For Students (5 Views)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'admin'
                    ? 'bg-white dark:bg-slate-900 text-brand-teal dark:text-brand-cyan shadow-sm'
                    : 'text-brand-secondary dark:text-slate-400 hover:text-brand-navy'
                }`}
              >
                For Placement Officers (7 Views)
              </button>
            </div>
          </div>

          {/* Active Tab Content */}
          <div className="max-w-4xl mx-auto">
            {activeTab === 'student' ? (
              <GlassCard padding="lg" className="shadow-soft animate-in fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-brand-teal/10 text-brand-teal dark:text-brand-cyan flex items-center justify-center">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-brand-navy dark:text-slate-100">
                      Student Career Acceleration Portal
                    </h4>
                    <p className="text-xs text-brand-secondary dark:text-slate-400">
                      Full transparency, instant eligibility scoring, and AI mock interview coaching
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5 space-y-1">
                    <div className="font-bold text-brand-navy dark:text-slate-100 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Student Dashboard</span>
                    </div>
                    <p className="text-brand-secondary dark:text-slate-400">
                      Live status counters: total eligible jobs, active applications, confirmed interview schedule.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5 space-y-1">
                    <div className="font-bold text-brand-navy dark:text-slate-100 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Verified Profile Builder</span>
                    </div>
                    <p className="text-brand-secondary dark:text-slate-400">
                      Maintain academic grades, active backlog counters, resume PDFs, and technical skill tag matrices.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5 space-y-1">
                    <div className="font-bold text-brand-navy dark:text-slate-100 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Jobs & Instant Eligibility</span>
                    </div>
                    <p className="text-brand-secondary dark:text-slate-400">
                      One-click pre-application checks against CGPA, allowed departments, and maximum backlogs.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5 space-y-1">
                    <div className="font-bold text-brand-navy dark:text-slate-100 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>AI Career Assistant</span>
                    </div>
                    <p className="text-brand-secondary dark:text-slate-400">
                      24/7 conversational mentor for technical mock interviews, behavioral coaching, and resume feedback.
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <Link to="/register">
                    <GradientButton icon={ArrowRight} size="md">
                      Register as Student
                    </GradientButton>
                  </Link>
                </div>
              </GlassCard>
            ) : (
              <GlassCard padding="lg" className="shadow-soft animate-in fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-brand-navy dark:text-slate-100">
                      Placement Cell Administrative Command Center
                    </h4>
                    <p className="text-xs text-brand-secondary dark:text-slate-400">
                      Autonomous agent orchestration, clash-free timetables, and master CSV analytics
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5 space-y-1">
                    <div className="font-bold text-brand-navy dark:text-slate-100 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-brand-teal" />
                      <span>AI Placement Agent Console</span>
                    </div>
                    <p className="text-brand-secondary dark:text-slate-400">
                      Dispatch natural language queries to shortlist candidates and schedule interviews with HITL approvals.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5 space-y-1">
                    <div className="font-bold text-brand-navy dark:text-slate-100 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-brand-teal" />
                      <span>Interview Coordination Workbench</span>
                    </div>
                    <p className="text-brand-secondary dark:text-slate-400">
                      Manage faculty evaluation panels and physical room allocations with live conflict checking.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5 space-y-1">
                    <div className="font-bold text-brand-navy dark:text-slate-100 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-brand-teal" />
                      <span>Companies & Jobs Board</span>
                    </div>
                    <p className="text-brand-secondary dark:text-slate-400">
                      Full lifecycle management of corporate recruiter profiles, job requisitions, and round schedules.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5 space-y-1">
                    <div className="font-bold text-brand-navy dark:text-slate-100 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-brand-teal" />
                      <span>Analytics & CSV Report Export</span>
                    </div>
                    <p className="text-brand-secondary dark:text-slate-400">
                      Branch distribution, CTC tier breakdowns, skill demand matrices, and streaming CSV export.
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <Link to="/login">
                    <GradientButton icon={ArrowRight} size="md">
                      Sign In as Administrator
                    </GradientButton>
                  </Link>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </section>

      {/* 7. Final Call to Action Banner */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-r from-brand-teal/90 via-brand-turquoise/90 to-brand-cyan/90 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            Ready to Modernize Your University Placements?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
            Eliminate scheduling conflicts, empower your students with AI preparation, and gain full visibility into your campus recruitment drives.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <button
                type="button"
                className="w-full sm:w-auto px-8 py-3.5 rounded-control-lg text-sm font-bold bg-white text-brand-teal hover:bg-slate-50 shadow-lg hover:shadow-xl transition-all"
              >
                Create Student Account
              </button>
            </Link>
            <Link to="/login">
              <button
                type="button"
                className="w-full sm:w-auto px-8 py-3.5 rounded-control-lg text-sm font-bold bg-brand-navy text-white hover:bg-slate-900 border border-white/20 transition-all"
              >
                Placement Officer Login
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="py-12 bg-white/60 dark:bg-slate-950/80 border-t border-slate-200/80 dark:border-white/10 text-xs text-brand-secondary dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-primary flex items-center justify-center text-white">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm text-brand-navy dark:text-slate-100">
              CampusPilot
            </span>
            <span>• Autonomous University Placement Management</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-brand-teal transition-colors">Features</a>
            <a href="#workflow" className="hover:text-brand-teal transition-colors">Workflow</a>
            <Link to="/login" className="hover:text-brand-teal transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-brand-teal transition-colors">Register</Link>
          </div>

          <div>
            <span>MIT License • Built with MERN Stack & Groq Real LLM Agent</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
