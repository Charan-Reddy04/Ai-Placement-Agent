import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  Calendar,
  AlertCircle,
  Bot,
  Sparkles,
  ArrowRight,
  Clock,
  Briefcase,
  CheckCircle2,
  CalendarCheck2,
  ChevronRight,
  GraduationCap,
  ExternalLink,
  Send,
  Loader2,
  Trash2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import GlassCard from '../../components/GlassCard';
import StatCard from '../../components/StatCard';
import GradientButton from '../../components/GradientButton';
import StatusBadge from '../../components/StatusBadge';
import ProgressRing from '../../components/ProgressRing';
import analyticsService from '../../services/analyticsService';

const defaultPlacementTrendData = [
  { month: 'Jul', offers: 35, applications: 210 },
  { month: 'Aug', offers: 78, applications: 450 },
  { month: 'Sep', offers: 145, applications: 680 },
  { month: 'Oct', offers: 230, applications: 920 },
  { month: 'Nov', offers: 380, applications: 1250 },
  { month: 'Dec', offers: 490, applications: 1420 },
];

export const Dashboard = () => {
  const [timePeriod, setTimePeriod] = useState('season');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    metrics: {
      registeredStudents: 0,
      activeCompanies: 0,
      upcomingInterviews: 0,
      pendingActions: 0,
      placedStudents: 0,
      inProgressStudents: 0,
      pendingStudents: 0,
      placementRate: '0%',
    },
    recentActivities: [],
    upcomingInterviews: [],
  });

  const [deletingActivityId, setDeletingActivityId] = useState(null);

  useEffect(() => {
    fetchDashboardTelemetry();
  }, []);

  const fetchDashboardTelemetry = async () => {
    try {
      setLoading(true);
      const res = await analyticsService.getDashboardStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteActivity = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      setDeletingActivityId(id);
      await analyticsService.deleteActivityLog(id);
      setStats((prev) => ({
        ...prev,
        recentActivities: (prev.recentActivities || []).filter((act) => act._id !== id),
      }));
    } catch (err) {
      console.error('Failed to delete activity log:', err);
    } finally {
      setDeletingActivityId(null);
    }
  };

  const m = stats.metrics || {};
  const interviewsList = stats.upcomingInterviews || [];
  const activitiesList = stats.recentActivities || [];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* A. Welcome Banner */}
      <div className="relative overflow-hidden rounded-card-lg bg-gradient-to-r from-brand-navy via-[#163750] to-[#0A2540] text-white p-6 sm:p-8 shadow-card border border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-turquoise/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-brand-cyan/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-brand-cyan text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Placement Season 2025 – 2026 Live</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-outfit">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-brand-turquoise to-brand-cyan bg-clip-text text-transparent">
              Placement Cell Admin
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            CampusPilot AI Agent is actively coordinating {m.registeredStudents || 0} registered candidates, {m.activeCompanies || 0} partner recruiters, and {m.upcomingInterviews || 0} scheduled interview sessions.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link to="/admin/agent">
              <GradientButton icon={Bot} size="md">
                Launch AI Placement Agent
              </GradientButton>
            </Link>
            <Link to="/admin/companies?action=new-job">
              <button className="px-4 py-2.5 rounded-control text-xs sm:text-sm font-semibold text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all">
                + Create New Recruitment Drive
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* B. Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Registered Students"
          value={m.registeredStudents ? m.registeredStudents.toString() : '0'}
          change="Real MongoDB Data"
          trend="up"
          subtitle="Verified placement profiles"
          icon={Users}
          accentColor="teal"
        />
        <StatCard
          title="Active Recruiters"
          value={m.activeCompanies ? m.activeCompanies.toString() : '0'}
          change="Corporate Partners"
          trend="up"
          subtitle="Tier 1 & Core companies"
          icon={Building2}
          accentColor="turquoise"
        />
        <StatCard
          title="Upcoming Interviews"
          value={m.upcomingInterviews ? m.upcomingInterviews.toString() : '0'}
          change="Scheduled rounds"
          trend="neutral"
          subtitle="Faculty panels assigned"
          icon={Calendar}
          accentColor="cyan"
        />
        <StatCard
          title="Pending Actions"
          value={m.pendingActions ? m.pendingActions.toString() : '0'}
          change="Awaiting review"
          trend="down"
          subtitle="Shortlists & drive slots"
          icon={AlertCircle}
          accentColor="orange"
        />
      </div>

      {/* C. Placement Overview Chart & D. AI Placement Agent Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Placement Trajectory Chart (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard padding="md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-lg font-bold text-brand-navy dark:text-slate-100">
                  Placement Season Trajectory
                </h3>
                <p className="text-xs text-brand-secondary dark:text-slate-400">
                  Cumulative job offers vs. total verified student applications
                </p>
              </div>

              {/* Time Period Filter */}
              <div className="flex items-center gap-1 p-1 bg-white/50 dark:bg-slate-800/60 rounded-control border border-slate-200/80 dark:border-white/10 text-xs">
                {['season', 'month', 'all'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTimePeriod(filter)}
                    className={`px-3 py-1 rounded-control font-semibold capitalize transition-all ${
                      timePeriod === filter
                        ? 'bg-gradient-primary text-white shadow-sm'
                        : 'text-brand-secondary dark:text-slate-300 hover:text-brand-navy dark:hover:text-white'
                    }`}
                  >
                    {filter === 'season' ? '2025-26' : filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={defaultPlacementTrendData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="offersGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#009EAD" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#009EAD" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="appsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '12px',
                      border: '1px solid rgba(0, 158, 173, 0.2)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                      fontSize: '12px',
                      color: '#102A43',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="applications"
                    stroke="#38BDF8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#appsGrad)"
                    name="Applications"
                  />
                  <Area
                    type="monotone"
                    dataKey="offers"
                    stroke="#009EAD"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#offersGrad)"
                    name="Offers Released"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 font-medium text-brand-navy dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-teal" />
                  Offers Released ({m.placedStudents || 0})
                </span>
                <span className="flex items-center gap-1.5 font-medium text-brand-secondary dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan" />
                  Registered Candidates ({m.registeredStudents || 0})
                </span>
              </div>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                Placement Success Rate: {m.placementRate || '0%'}
              </span>
            </div>
          </GlassCard>
        </div>

        {/* AI Placement Agent Highlight Panel */}
        <div className="space-y-6">
          <GlassCard padding="md" className="relative overflow-hidden border-brand-teal/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-control bg-gradient-primary flex items-center justify-center text-white shadow-soft">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-brand-navy dark:text-slate-100">
                    AI Placement Agent
                  </h4>
                  <p className="text-[10px] text-brand-secondary dark:text-slate-400">
                    Autonomous Operations Engine
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Ready
              </span>
            </div>

            <p className="text-xs text-brand-secondary dark:text-slate-300 leading-relaxed mb-4">
              Ask natural language requests to inspect JDs, calculate deterministic eligibility, rank matching candidate pools, coordinate faculty panels, and schedule interviews.
            </p>

            <div className="space-y-2 mb-4">
              {[
                'Extract eligibility criteria from unstructured JD',
                'Find eligible candidates for Microsoft SDE role',
                'Propose interview timetable avoiding timetable clashes',
              ].map((capability, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-[11px] text-brand-navy dark:text-slate-200 font-medium"
                >
                  <Sparkles className="w-3 h-3 text-brand-teal shrink-0" />
                  <span>{capability}</span>
                </div>
              ))}
            </div>

            <Link to="/admin/agent" className="block w-full">
              <GradientButton icon={ArrowRight} size="sm" className="w-full justify-center">
                Chat with AI Agent
              </GradientButton>
            </Link>
          </GlassCard>

          {/* G. Analytics Insights Card */}
          <GlassCard padding="md" className="space-y-3">
            <h4 className="text-sm font-bold text-brand-navy dark:text-slate-100">
              Placement Conversion Metrics
            </h4>

            <div className="flex items-center gap-4 py-2">
              <ProgressRing
                progress={parseInt(m.placementRate) || 20}
                size={70}
                strokeWidth={6}
              />
              <div className="space-y-1">
                <p className="text-xl font-bold text-brand-navy dark:text-slate-100">
                  {m.placementRate || '20%'}
                </p>
                <p className="text-xs text-brand-secondary dark:text-slate-400">
                  {m.placedStudents || 0} of {m.registeredStudents || 0} students placed
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-brand-secondary dark:text-slate-400">Active in Rounds</span>
                <span className="font-bold text-brand-teal">{m.inProgressStudents || 0} candidates</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-brand-secondary dark:text-slate-400">Open Jobs</span>
                <span className="font-bold text-brand-navy dark:text-slate-200">{m.openJobs || 0} drives</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-brand-secondary dark:text-slate-400">Pending Review</span>
                <span className="font-bold text-amber-500">{m.pendingActions || 0} applications</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Grid: Upcoming Interviews & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* F. Upcoming Interviews (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <GlassCard padding="md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-brand-navy dark:text-slate-100">
                  Upcoming Interview Sessions & Panel Coordination
                </h3>
                <p className="text-xs text-brand-secondary dark:text-slate-400">
                  Real-time slots verified for candidate, faculty panel, and venue availability
                </p>
              </div>
              <Link
                to="/admin/coordination"
                className="text-xs font-semibold text-brand-teal dark:text-brand-cyan hover:underline inline-flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-slate-800 text-brand-secondary dark:text-slate-400">
                    <th className="pb-2.5 font-semibold">Candidate</th>
                    <th className="pb-2.5 font-semibold">Company & Role</th>
                    <th className="pb-2.5 font-semibold">Round & Time</th>
                    <th className="pb-2.5 font-semibold">Panel & Venue</th>
                    <th className="pb-2.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {interviewsList.map((interview) => (
                    <tr key={interview._id} className="hover:bg-brand-teal/5 transition-colors">
                      <td className="py-3 pr-2">
                        <div className="font-semibold text-brand-navy dark:text-slate-100">
                          {interview.studentId?.userId?.name || 'Candidate'}
                        </div>
                        <div className="text-[10px] text-brand-secondary dark:text-slate-400">
                          {interview.studentId?.rollNumber} • {interview.studentId?.branch?.split(' ')[0]}
                        </div>
                      </td>
                      <td className="py-3 pr-2">
                        <div className="font-medium text-brand-navy dark:text-slate-200">
                          {interview.companyId?.name || 'Company'}
                        </div>
                        <div className="text-[10px] text-brand-secondary dark:text-slate-400">
                          {interview.jobId?.title || 'Engineering Role'}
                        </div>
                      </td>
                      <td className="py-3 pr-2">
                        <div className="font-medium text-brand-teal dark:text-brand-cyan">
                          {interview.startTime} - {interview.endTime}
                        </div>
                        <div className="text-[10px] text-brand-secondary dark:text-slate-400">
                          {interview.roundName}
                        </div>
                      </td>
                      <td className="py-3 pr-2">
                        <div className="text-brand-navy dark:text-slate-200">
                          {interview.venueId ? interview.venueId.name : 'Virtual Session'}
                        </div>
                        <div className="text-[10px] text-brand-secondary dark:text-slate-400">
                          {interview.venueId?.roomNumber ? `Room ${interview.venueId.roomNumber}` : 'Online Meeting'}
                        </div>
                      </td>
                      <td className="py-3">
                        <StatusBadge status={interview.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                  {interviewsList.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-xs text-slate-400 italic">
                        No upcoming interviews currently scheduled.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* E. Recent Activities Feed */}
        <div className="space-y-4">
          <GlassCard padding="md">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-brand-navy dark:text-slate-100">
                  Recent Placement Activity
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider text-brand-teal bg-brand-teal/10 px-2 py-0.5 rounded-full">
                  Live Audit
                </span>
              </div>
            </div>

            <div className="space-y-3.5">
              {activitiesList.map((act) => (
                <div
                  key={act._id}
                  className="flex items-start justify-between gap-3 text-xs p-2.5 rounded-lg transition-colors bg-slate-50/60 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200/60 dark:border-white/5"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="p-2 rounded-control shrink-0 text-brand-teal bg-brand-teal/10 mt-0.5">
                      <Briefcase className="w-3.5 h-3.5" />
                    </div>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <p className="font-semibold text-brand-navy dark:text-slate-200">
                        {act.action}
                      </p>
                      <p className="text-[11px] text-brand-secondary dark:text-slate-400 truncate">
                        By {act.actorName} ({act.entityType})
                      </p>
                      <p className="text-[10px] text-brand-secondary/60 dark:text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 inline" />
                        <span>{new Date(act.createdAt).toLocaleTimeString()}</span>
                      </p>
                    </div>
                  </div>
                  {/* Highly Visible Delete Trash Option */}
                  <button
                    type="button"
                    onClick={(e) => handleDeleteActivity(act._id, e)}
                    disabled={deletingActivityId === act._id}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white border border-rose-200 dark:border-rose-500/30 transition-all shrink-0 cursor-pointer shadow-xs disabled:opacity-50"
                    title="Delete activity log"
                  >
                    {deletingActivityId === act._id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Delete</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
              {activitiesList.length === 0 && (
                <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                  <p className="text-xs text-slate-400 italic">
                    No activity logged yet.
                  </p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
