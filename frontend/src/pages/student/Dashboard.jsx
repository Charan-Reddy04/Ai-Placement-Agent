import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Briefcase,
  CalendarCheck2,
  CheckCircle,
  Award,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import ProgressRing from '../../components/ProgressRing';
import analyticsService from '../../services/analyticsService';
import studentService from '../../services/studentService';

export const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    metrics: {
      profileCompletion: 80,
      availableJobs: 0,
      eligibleOpportunities: 0,
      activeApplications: 0,
      upcomingInterviews: 0,
    },
    student: {
      name: 'Student',
      rollNumber: '',
      branch: '',
      cgpa: 0,
      activeBacklogs: 0,
    },
    recentNotifications: [],
    recentActivities: [],
  });
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    loadStudentDashboard();
  }, []);

  const loadStudentDashboard = async () => {
    try {
      setLoading(true);
      const [statsRes, appsRes, intvsRes] = await Promise.all([
        analyticsService.getDashboardStats(),
        studentService.getMyApplications(),
        studentService.getMyInterviews(),
      ]);

      if (statsRes.success && statsRes.data) {
        setDashboardData(statsRes.data);
      }
      if (appsRes.success && appsRes.data) {
        setApplications(appsRes.data);
      }
      if (intvsRes.success && intvsRes.data) {
        setInterviews(intvsRes.data);
      }
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const m = dashboardData.metrics || {};
  const s = dashboardData.student || {};

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-teal" />
        <p className="text-xs font-semibold text-brand-secondary">
          Loading student dashboard & applications...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-card-lg bg-gradient-to-r from-brand-teal via-brand-turquoise to-brand-cyan text-white p-6 sm:p-8 shadow-card">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Placement Matching Engine Connected</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-outfit text-white">
            Welcome back, {s.name ? s.name.split(' ')[0] : 'Student'}!
          </h1>
          <p className="text-sm sm:text-base text-white/95 leading-relaxed">
            You are eligible for <span className="font-bold underline decoration-white/40">{m.eligibleOpportunities || 0} active recruitment drives</span>. You have {m.upcomingInterviews || 0} scheduled interview sessions.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link to="/student/jobs">
              <button className="px-4 py-2.5 rounded-control text-xs sm:text-sm font-semibold bg-white text-brand-teal hover:bg-white/90 shadow-button transition-all">
                Explore Available Jobs
              </button>
            </Link>
            <Link to="/student/ai-assistant">
              <button className="px-4 py-2.5 rounded-control text-xs sm:text-sm font-semibold bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/30 transition-all">
                Practice with AI Career Assistant
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Profile Completion"
          value={`${m.profileCompletion || 60}%`}
          subtitle="Add Projects & Certifications"
          icon={Award}
          accentColor="teal"
        />
        <StatCard
          title="Eligible Opportunities"
          value={m.eligibleOpportunities ? m.eligibleOpportunities.toString() : '0'}
          subtitle={`CGPA ≥ Cutoff (${s.cgpa || 0})`}
          icon={Briefcase}
          accentColor="turquoise"
        />
        <StatCard
          title="Active Applications"
          value={applications.length.toString()}
          subtitle="Submitted to recruiters"
          icon={CheckCircle}
          accentColor="cyan"
        />
        <StatCard
          title="Upcoming Interviews"
          value={interviews.length.toString()}
          subtitle="Slots confirmed"
          icon={CalendarCheck2}
          accentColor="green"
        />
      </div>

      {/* Grid: Applications & Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications List */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard padding="md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-brand-navy dark:text-slate-100">
                  My Active Applications
                </h3>
                <p className="text-xs text-brand-secondary dark:text-slate-400">
                  Track your eligibility status and recruiter shortlists in real time
                </p>
              </div>
              <Link
                to="/student/jobs"
                className="text-xs font-semibold text-brand-teal dark:text-brand-cyan hover:underline inline-flex items-center gap-1"
              >
                <span>View All Jobs</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {applications.map((app) => (
                <div
                  key={app._id}
                  className="p-3.5 rounded-control-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-brand-teal/30 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-brand-navy dark:text-slate-100">
                        {app.jobId?.companyName || 'Recruiting Partner'}
                      </span>
                      <span className="text-xs text-brand-teal font-semibold">
                        {app.jobId?.title || 'Role'}
                      </span>
                    </div>
                    <p className="text-xs text-brand-secondary dark:text-slate-300">
                      Applied on {new Date(app.applicationDate || app.createdAt).toLocaleDateString()} •{' '}
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        {app.eligibilityStatus}
                      </span>
                    </p>
                    <p className="text-[11px] text-brand-secondary/80 dark:text-slate-400 line-clamp-1">
                      {app.matchExplanation}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                    <StatusBadge status={app.status} size="sm" />
                    <span className="text-[11px] font-semibold text-brand-secondary dark:text-slate-400">
                      Compatibility: <span className="text-brand-teal font-bold">{app.matchScore}%</span>
                    </span>
                  </div>
                </div>
              ))}
              {applications.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-400 italic">
                  No active job applications yet. Go to "Available Jobs" to submit applications.
                </div>
              )}
            </div>
          </GlassCard>

          {/* Upcoming Interviews Preview */}
          <GlassCard padding="md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-brand-navy dark:text-slate-100">
                  Upcoming Interview Rounds
                </h3>
                <p className="text-xs text-brand-secondary dark:text-slate-400">
                  Confirmed venue and virtual interview links
                </p>
              </div>
              <Link
                to="/student/interviews"
                className="text-xs font-semibold text-brand-teal dark:text-brand-cyan hover:underline inline-flex items-center gap-1"
              >
                <span>Full Schedule</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {interviews.length > 0 ? (
                interviews.map((intv) => (
                  <div
                    key={intv._id}
                    className="p-3.5 rounded-control-lg bg-gradient-to-r from-brand-teal/5 to-transparent border border-brand-teal/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-brand-navy dark:text-slate-100">
                          {intv.companyId?.name || 'Company'}
                        </span>
                        <span className="text-xs text-brand-teal font-semibold">
                          • {intv.roundName}
                        </span>
                      </div>
                      <p className="text-xs text-brand-secondary dark:text-slate-300">
                        Date:{' '}
                        <strong className="text-brand-navy dark:text-slate-100">
                          {new Date(intv.scheduledDate).toLocaleDateString()}
                        </strong>{' '}
                        ({intv.startTime} - {intv.endTime})
                      </p>
                      <p className="text-[11px] text-brand-secondary/80 dark:text-slate-400">
                        Venue / Link: {intv.venueId ? `${intv.venueId.name} (${intv.venueId.roomNumber})` : 'Online Meeting'}
                      </p>
                    </div>
                    <StatusBadge status={intv.status} size="sm" />
                  </div>
                ))
              ) : (
                <p className="text-xs text-brand-secondary py-4 text-center">
                  No upcoming interviews currently scheduled.
                </p>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Profile Strength & Preparation Suggestions */}
        <div className="space-y-6">
          {/* Profile Card */}
          <GlassCard padding="md">
            <h4 className="text-sm font-bold text-brand-navy dark:text-slate-100 mb-3">
              Profile Strength
            </h4>
            <div className="flex items-center gap-4 mb-4">
              <ProgressRing progress={m.profileCompletion || 60} size={70} strokeWidth={6} />
              <div>
                <p className="text-sm font-bold text-brand-navy dark:text-slate-100">
                  {m.profileCompletion || 60}% Complete
                </p>
                <p className="text-xs text-brand-secondary dark:text-slate-400">
                  CGPA: {s.cgpa || 0} | Backlogs: {s.activeBacklogs || 0}
                </p>
                <p className="text-xs text-brand-secondary dark:text-slate-400">
                  {s.branch}
                </p>
              </div>
            </div>
            <Link to="/student/profile" className="block">
              <button className="w-full py-2 rounded-control text-xs font-semibold text-brand-teal bg-brand-teal/10 hover:bg-brand-teal/20 transition-all border border-brand-teal/20">
                Edit Placement Profile & Skills
              </button>
            </Link>
          </GlassCard>

          {/* AI Prep Advice */}
          <GlassCard padding="md" className="border-brand-teal/30">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-control bg-gradient-primary text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-brand-navy dark:text-slate-100">
                AI Placement Prep Suggestions
              </h4>
            </div>
            <p className="text-xs text-brand-secondary dark:text-slate-300 leading-relaxed mb-3">
              Based on your target roles and competencies, prioritize:
            </p>
            <div className="space-y-2 mb-4">
              <div className="p-2.5 rounded-control bg-brand-teal/10 border border-brand-teal/20 text-xs">
                <p className="font-semibold text-brand-teal">1. Microservices & Distributed Caching</p>
                <p className="text-[11px] text-brand-secondary dark:text-slate-400 mt-0.5">
                  Core requirement for Tier-1 engineering recruitment rounds
                </p>
              </div>
              <div className="p-2.5 rounded-control bg-brand-turquoise/10 border border-brand-turquoise/20 text-xs">
                <p className="font-semibold text-brand-turquoise">2. System Design Fundamentals</p>
                <p className="text-[11px] text-brand-secondary dark:text-slate-400 mt-0.5">
                  Frequently tested in technical round 2 discussions
                </p>
              </div>
            </div>

            <Link to="/student/ai-assistant" className="block">
              <button className="w-full py-2 rounded-control text-xs font-semibold text-white bg-gradient-primary shadow-button hover:opacity-95 transition-all">
                Start Mock Technical Chat
              </button>
            </Link>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
