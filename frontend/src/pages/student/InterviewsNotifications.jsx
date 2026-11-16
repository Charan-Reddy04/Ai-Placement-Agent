import React, { useState, useEffect } from 'react';
import {
  CalendarCheck2,
  Bell,
  Clock,
  MapPin,
  Check,
  ExternalLink,
  Loader2,
  Award,
  Star,
  Users,
} from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import StatusBadge from '../../components/StatusBadge';
import studentService from '../../services/studentService';
import notificationService from '../../services/notificationService';

export const InterviewsNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [notifFilter, setNotifFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [notifsRes, intvsRes] = await Promise.all([
        notificationService.getMyNotifications(),
        studentService.getMyInterviews(),
      ]);

      if (notifsRes.success) {
        setNotifications(notifsRes.data || []);
      }
      if (intvsRes.success) {
        setInterviews(intvsRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load notifications & interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (notifFilter === 'All') return true;
    return (n.type || '').toLowerCase() === notifFilter.toLowerCase();
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-teal" />
        <p className="text-xs font-semibold text-brand-secondary">
          Loading interview schedule and official notifications...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <GlassCard padding="md" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-brand-navy dark:text-slate-100 flex items-center gap-2">
            <CalendarCheck2 className="w-5 h-5 text-brand-teal" />
            <span>Interview Schedule & Placement Alerts</span>
          </h1>
          <p className="text-xs text-brand-secondary dark:text-slate-400 mt-1">
            Confirmed coordination slots, panel allocations, and official placement broadcasts
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-semibold bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal dark:text-brand-cyan transition-all border border-brand-teal/20 self-start sm:self-auto"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark {unreadCount} as Read</span>
          </button>
        )}
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interviews Section (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-brand-navy dark:text-slate-100 flex items-center gap-2">
              <CalendarCheck2 className="w-4 h-4 text-brand-teal" />
              <span>Confirmed Interview Appointments ({interviews.length})</span>
            </h2>
            <span className="text-xs text-brand-secondary dark:text-slate-400">
              Auto-synced with faculty panels
            </span>
          </div>

          <div className="space-y-4">
            {interviews.map((intv) => {
              const compName = intv.companyId?.name || intv.jobId?.companyName || 'Recruiter';
              const jobTitle = intv.jobId?.title || 'Engineering Trainee';
              const roundTitle = intv.round || intv.roundName || 'Interview Session';
              const dateDisplay = intv.date || (intv.scheduledDate ? new Date(intv.scheduledDate).toLocaleDateString() : 'Scheduled Date');

              return (
                <GlassCard key={intv._id} padding="md" hoverEffect className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-brand-navy dark:text-slate-100">
                          {compName}
                        </span>
                        <span className="text-xs font-semibold text-brand-teal">
                          • {roundTitle}
                        </span>
                      </div>
                      <p className="text-xs text-brand-secondary dark:text-slate-400">
                        Role: {jobTitle}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={intv.status} size="md" />
                      {intv.outcome && intv.outcome !== 'Pending' && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            intv.outcome === 'Selected'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : intv.outcome === 'Next Round'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}
                        >
                          {intv.outcome}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <p className="text-brand-secondary dark:text-slate-400">Date & Slot:</p>
                      <p className="font-bold text-brand-navy dark:text-slate-100 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-brand-teal" />
                        <span>
                          {dateDisplay} ({intv.startTime} {intv.endTime ? `- ${intv.endTime}` : ''})
                        </span>
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-brand-secondary dark:text-slate-400">Evaluation Panel:</p>
                      <p className="font-bold text-brand-navy dark:text-slate-100 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-brand-teal" />
                        <span>{intv.panelId?.name || 'Department Academic Committee'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-control bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-brand-secondary dark:text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-brand-teal shrink-0" />
                      <span>
                        {intv.venueId
                          ? `${intv.venueId.name} ${intv.venueId.roomNumber ? `(${intv.venueId.roomNumber})` : ''}`
                          : 'Virtual Session'}
                      </span>
                    </div>

                    {intv.meetingLink && (
                      <a
                        href={intv.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-brand-teal hover:underline text-[11px]"
                      >
                        <span>Join Meeting Room</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {/* Feedback / Evaluation Notes when completed */}
                  {(intv.feedback || intv.rating) && (
                    <div className="p-3 rounded-control bg-brand-teal/5 border border-brand-teal/20 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-brand-navy dark:text-slate-100 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-brand-teal" />
                          <span>Panel Evaluation Assessment</span>
                        </span>
                        {intv.rating && (
                          <span className="font-bold text-brand-teal">
                            Score: {intv.rating}/10
                          </span>
                        )}
                      </div>
                      {intv.feedback && (
                        <p className="text-brand-secondary dark:text-slate-300 italic text-[11px]">
                          "{intv.feedback}"
                        </p>
                      )}
                    </div>
                  )}
                </GlassCard>
              );
            })}

            {interviews.length === 0 && (
              <GlassCard padding="lg" className="text-center py-10">
                <p className="text-xs text-brand-secondary italic">
                  No upcoming interview sessions currently scheduled.
                </p>
              </GlassCard>
            )}
          </div>
        </div>

        {/* Notifications Stream (1 Column) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-brand-navy dark:text-slate-100 flex items-center gap-2">
              <Bell className="w-4 h-4 text-brand-teal" />
              <span>Official Notifications</span>
            </h2>
          </div>

          {/* Type filters */}
          <div className="flex flex-wrap gap-1 text-[11px]">
            {['All', 'Announcement', 'Interview', 'Application', 'Alert'].map((f) => (
              <button
                key={f}
                onClick={() => setNotifFilter(f)}
                className={`px-2.5 py-1 rounded-control font-semibold transition-all ${
                  notifFilter === f
                    ? 'bg-gradient-primary text-white shadow-sm'
                    : 'bg-white/60 dark:bg-slate-800/60 text-brand-secondary dark:text-slate-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredNotifications.map((notif) => {
              const isUrgent = notif.priority === 'Urgent' || notif.type === 'Alert';

              return (
                <GlassCard
                  key={notif._id}
                  padding="sm"
                  className={`transition-all text-xs space-y-1.5 ${
                    !notif.read
                      ? isUrgent
                        ? 'border-rose-400/60 bg-rose-500/5'
                        : 'border-brand-teal/40 bg-brand-teal/5'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-brand-navy dark:text-slate-100">
                        {notif.title}
                      </span>
                      {isUrgent && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-rose-500/10 text-rose-600">
                          URGENT
                        </span>
                      )}
                    </div>
                    {!notif.read && (
                      <button
                        onClick={() => handleMarkAsRead(notif._id)}
                        className="text-[10px] text-brand-teal font-semibold hover:underline shrink-0"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-brand-secondary dark:text-slate-300 leading-relaxed">
                    {notif.message}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-brand-secondary/70 dark:text-slate-500 pt-0.5">
                    <span>{new Date(notif.createdAt).toLocaleString()}</span>
                    <span className="capitalize px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-semibold">
                      {notif.type}
                    </span>
                  </div>
                </GlassCard>
              );
            })}

            {filteredNotifications.length === 0 && (
              <p className="text-xs text-slate-400 italic text-center py-6">
                No notifications in this category.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewsNotifications;
