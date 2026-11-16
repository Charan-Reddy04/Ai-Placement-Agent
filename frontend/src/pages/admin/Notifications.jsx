import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  Loader2,
  Mail,
  Smartphone,
  Eye,
  Trash2,
  Filter,
  Search,
  RefreshCw,
  Clock,
  Users,
  ShieldAlert,
  Sparkles,
  Layers,
  ChevronRight,
  X
} from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';
import StatusBadge from '../../components/StatusBadge';
import notificationService from '../../services/notificationService';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('compose'); // 'compose' | 'history'
  const [loading, setLoading] = useState(true);

  // Form Data
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'Announcement',
    priority: 'Normal',
    recipientGroup: 'All Students',
    targetBranch: 'All',
    targetBatch: '2026',
    channels: ['in-app', 'email'],
  });

  // Filter & Search
  const [typeFilter, setTypeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [isSending, setIsSending] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getAllBroadcasts();
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error('Failed to load notifications history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChannelToggle = (channel) => {
    setFormData((prev) => {
      const exists = prev.channels.includes(channel);
      let updated;
      if (exists) {
        if (prev.channels.length === 1) return prev; // must keep at least one
        updated = prev.channels.filter((c) => c !== channel);
      } else {
        updated = [...prev.channels, channel];
      }
      return { ...prev, channels: updated };
    });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.message) return;

    setIsSending(true);
    setErrorMessage('');
    try {
      let recipientRole = 'all';
      if (formData.recipientGroup === 'All Students' || formData.recipientGroup === 'CSE & IT Only') {
        recipientRole = 'student';
      } else if (formData.recipientGroup === 'Admins Only') {
        recipientRole = 'admin';
      }

      const res = await notificationService.createNotification({
        title: formData.title.trim(),
        message: formData.message.trim(),
        type: formData.type,
        priority: formData.priority,
        recipientRole,
        targetBranch: formData.recipientGroup === 'CSE & IT Only' ? 'Computer Science and Engineering' : formData.targetBranch,
        targetBatch: formData.targetBatch,
        channels: formData.channels,
      });

      if (res.success) {
        setDispatchSuccess(
          res.message || `Notification broadcast successfully dispatched across [${formData.channels.join(', ')}]!`
        );
        setFormData({
          title: '',
          message: '',
          type: 'Announcement',
          priority: 'Normal',
          recipientGroup: 'All Students',
          targetBranch: 'All',
          targetBatch: '2026',
          channels: ['in-app', 'email'],
        });
        await loadNotifications();
        setTimeout(() => setDispatchSuccess(''), 5500);
      }
    } catch (err) {
      console.error('Broadcast failed:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to dispatch notification broadcast.');
      setTimeout(() => setErrorMessage(''), 5500);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteBroadcast = async (id) => {
    if (!window.confirm('Are you sure you want to retract and delete this announcement?')) return;
    try {
      const res = await notificationService.deleteNotification(id);
      if (res.success) {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
        setDispatchSuccess('Notification broadcast successfully retracted.');
        setTimeout(() => setDispatchSuccess(''), 4000);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to retract notice');
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  // Filtered broadcasts
  const filteredNotifications = notifications.filter((notif) => {
    if (typeFilter !== 'All' && notif.type !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const t = notif.title?.toLowerCase() || '';
      const m = notif.message?.toLowerCase() || '';
      return t.includes(q) || m.includes(q);
    }
    return true;
  });

  const totalDispatched = notifications.length;
  const announcementsCount = notifications.filter((n) => n.type === 'Announcement').length;
  const interviewNotifsCount = notifications.filter((n) => n.type === 'Interview').length;
  const urgentCount = notifications.filter((n) => n.priority === 'Urgent' || n.type === 'Alert').length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <GlassCard padding="md" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-brand-navy dark:text-slate-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-teal" />
            <span>Placement Notification & Broadcast Hub</span>
          </h1>
          <p className="text-xs text-brand-secondary dark:text-slate-400 mt-1">
            Dispatch announcements, interview reminders, and urgent alerts across portal, email, and SMS
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-white/60 dark:bg-slate-800/60 rounded-control border border-slate-200/80 dark:border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('compose')}
            className={`px-3.5 py-1.5 rounded-control font-semibold transition-all ${
              activeTab === 'compose'
                ? 'bg-gradient-primary text-white shadow-button'
                : 'text-brand-secondary dark:text-slate-300 hover:text-brand-teal'
            }`}
          >
            Compose Broadcast
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-control font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-gradient-primary text-white shadow-button'
                : 'text-brand-secondary dark:text-slate-300 hover:text-brand-teal'
            }`}
          >
            Broadcast Logs ({notifications.length})
          </button>
        </div>
      </GlassCard>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <GlassCard padding="sm" className="flex items-center gap-3">
          <div className="p-2.5 rounded-card bg-brand-teal/10 text-brand-teal">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-brand-secondary dark:text-slate-400">Total Notices</p>
            <p className="text-xl font-bold text-brand-navy dark:text-slate-100">{totalDispatched}</p>
          </div>
        </GlassCard>

        <GlassCard padding="sm" className="flex items-center gap-3">
          <div className="p-2.5 rounded-card bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-brand-secondary dark:text-slate-400">General Drives</p>
            <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400">{announcementsCount}</p>
          </div>
        </GlassCard>

        <GlassCard padding="sm" className="flex items-center gap-3">
          <div className="p-2.5 rounded-card bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-brand-secondary dark:text-slate-400">Interview Alerts</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{interviewNotifsCount}</p>
          </div>
        </GlassCard>

        <GlassCard padding="sm" className="flex items-center gap-3">
          <div className="p-2.5 rounded-card bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-brand-secondary dark:text-slate-400">Urgent Broadcasts</p>
            <p className="text-xl font-bold text-rose-600 dark:text-rose-400">{urgentCount}</p>
          </div>
        </GlassCard>
      </div>

      {/* Alert Banners */}
      {dispatchSuccess && (
        <div className="p-3.5 rounded-control bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{dispatchSuccess}</span>
          </div>
          <button onClick={() => setDispatchSuccess('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-control bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* TAB 1: COMPOSE BROADCAST */}
      {activeTab === 'compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Composer (2 Columns) */}
          <div className="lg:col-span-2 space-y-4">
            <GlassCard padding="lg">
              <form onSubmit={handleSend} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-brand-navy dark:text-slate-200">
                    Broadcast Title / Subject *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google Cloud Placement Drive: Assessment Window & Venue Instructions"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-brand-navy dark:text-slate-200">
                      Category
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100 font-semibold"
                    >
                      <option value="Announcement">Placement Drive Announcement</option>
                      <option value="Interview">Interview Slot Update</option>
                      <option value="Application">Application Status Alert</option>
                      <option value="Alert">Urgent Notice / Venue Change</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-brand-navy dark:text-slate-200">
                      Priority Level
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100 font-semibold"
                    >
                      <option value="Normal">Normal Priority</option>
                      <option value="High">High Priority</option>
                      <option value="Urgent">Urgent / Immediate Action</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-brand-navy dark:text-slate-200">
                      Target Audience
                    </label>
                    <select
                      value={formData.recipientGroup}
                      onChange={(e) => setFormData({ ...formData, recipientGroup: e.target.value })}
                      className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100 font-semibold"
                    >
                      <option value="All Students">All Registered Students</option>
                      <option value="CSE & IT Only">CSE & IT Candidates</option>
                      <option value="Admins Only">Placement Cell Coordinators</option>
                      <option value="Entire Campus">Entire Campus Community</option>
                    </select>
                  </div>
                </div>

                {/* Multi-Channel Dispatcher */}
                <div className="p-3.5 rounded-control bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-brand-navy dark:text-slate-100">
                      Communication Delivery Channels:
                    </span>
                    <span className="text-[10px] text-brand-secondary dark:text-slate-400">
                      Select delivery streams
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <label
                      onClick={() => handleChannelToggle('in-app')}
                      className={`flex items-center gap-2 p-2 rounded-control border cursor-pointer select-none transition-all ${
                        formData.channels.includes('in-app')
                          ? 'bg-brand-teal/10 border-brand-teal text-brand-navy dark:text-slate-100 font-bold'
                          : 'bg-white/40 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-400'
                      }`}
                    >
                      <Bell className="w-3.5 h-3.5 text-brand-teal" />
                      <span>In-App Portal Notice</span>
                    </label>

                    <label
                      onClick={() => handleChannelToggle('email')}
                      className={`flex items-center gap-2 p-2 rounded-control border cursor-pointer select-none transition-all ${
                        formData.channels.includes('email')
                          ? 'bg-brand-teal/10 border-brand-teal text-brand-navy dark:text-slate-100 font-bold'
                          : 'bg-white/40 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-400'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5 text-brand-teal" />
                      <span>Official Email Digest</span>
                    </label>

                    <label
                      onClick={() => handleChannelToggle('sms')}
                      className={`flex items-center gap-2 p-2 rounded-control border cursor-pointer select-none transition-all ${
                        formData.channels.includes('sms')
                          ? 'bg-brand-teal/10 border-brand-teal text-brand-navy dark:text-slate-100 font-bold'
                          : 'bg-white/40 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-400'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5 text-brand-teal" />
                      <span>Urgent SMS Alert</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-brand-navy dark:text-slate-200">
                    Message Body *
                  </label>
                  <textarea
                    rows={6}
                    required
                    placeholder="Enter full announcement details, test schedule, dress code, room numbers, or link instructions..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-3 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-teal/40 leading-relaxed"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <GradientButton type="submit" icon={Send} disabled={isSending} size="md">
                    {isSending ? 'Dispatching Broadcast...' : 'Dispatch Placement Broadcast'}
                  </GradientButton>
                </div>
              </form>
            </GlassCard>
          </div>

          {/* Live Preview Card (1 Column) */}
          <div className="space-y-4">
            <GlassCard padding="md" className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Eye className="w-4 h-4 text-brand-teal" />
                <h4 className="font-bold text-brand-navy dark:text-slate-100 text-xs">
                  Live Student View Preview
                </h4>
              </div>

              <div className="p-3.5 rounded-control bg-brand-teal/5 border border-brand-teal/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-teal">
                    {formData.type}
                  </span>
                  {formData.priority === 'Urgent' && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-rose-500/10 text-rose-600">
                      URGENT
                    </span>
                  )}
                </div>

                <h5 className="font-bold text-brand-navy dark:text-slate-100 text-xs">
                  {formData.title || 'Subject Headline will appear here...'}
                </h5>

                <p className="text-[11px] text-brand-secondary dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {formData.message || 'Notification body text will be formatted and displayed to students with instant delivery.'}
                </p>

                <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-[10px] text-brand-secondary dark:text-slate-400">
                  <span>To: {formData.recipientGroup}</span>
                  <div className="flex items-center gap-1.5">
                    {formData.channels.map((ch) => (
                      <span key={ch} className="px-1.5 py-0.2 rounded bg-white dark:bg-slate-700 font-semibold capitalize">
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard padding="md" className="space-y-2.5 text-xs">
              <h4 className="font-bold text-brand-navy dark:text-slate-100 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-teal" />
                <span>Delivery Policy & Telemetry</span>
              </h4>
              <p className="text-[11px] text-brand-secondary dark:text-slate-400 leading-relaxed">
                All notices are stamped with ISO timestamps, linked to administrative activity logs, and auto-synced across authenticated student web sockets.
              </p>
            </GlassCard>
          </div>
        </div>
      )}

      {/* TAB 2: BROADCAST LOGS */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search notices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-xs w-48 sm:w-64 focus:outline-none focus:border-brand-teal"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-1.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-xs font-semibold text-brand-navy dark:text-slate-200"
              >
                <option value="All">All Categories</option>
                <option value="Announcement">Announcements</option>
                <option value="Interview">Interview Alerts</option>
                <option value="Application">Application Status</option>
                <option value="Alert">Urgent Alerts</option>
              </select>
            </div>

            <button
              onClick={loadNotifications}
              className="p-2 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-secondary hover:text-brand-teal self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <GlassCard padding="md">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredNotifications.map((notif) => {
                const isUrgent = notif.priority === 'Urgent' || notif.type === 'Alert';
                const emailSent = notif.deliveryReceipts?.email?.delivered;
                const smsSent = notif.deliveryReceipts?.sms?.delivered;

                return (
                  <div key={notif._id} className="py-4 first:pt-0 last:pb-0 space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-brand-navy dark:text-slate-100 text-sm">
                            {notif.title}
                          </span>
                          {isUrgent && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-rose-500/10 text-rose-600">
                              URGENT
                            </span>
                          )}
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-brand-teal/10 text-brand-teal">
                            {notif.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-brand-secondary dark:text-slate-400">
                          Dispatched: {new Date(notif.createdAt).toLocaleString()} • Target: <strong>{notif.recipientRole || 'all'}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <StatusBadge status={notif.deliveryStatus || 'Delivered'} size="sm" />
                        <button
                          onClick={() => handleDeleteBroadcast(notif._id)}
                          title="Retract Notice"
                          className="p-1 rounded text-slate-400 hover:text-rose-600 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-brand-secondary dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-800/40 p-2.5 rounded-control">
                      {notif.message}
                    </p>

                    {/* Delivery Receipts Bar */}
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-brand-secondary dark:text-slate-400 pt-1">
                      <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        In-App Portal: Delivered
                      </span>

                      {emailSent && (
                        <span className="flex items-center gap-1 font-semibold text-cyan-600 dark:text-cyan-400">
                          <Mail className="w-3 h-3" />
                          Simulated Email: Sent ({notif.deliveryReceipts?.email?.recipientCount || 'Students'})
                        </span>
                      )}

                      {smsSent && (
                        <span className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                          <Smartphone className="w-3 h-3" />
                          Simulated SMS: Dispatched ({notif.deliveryReceipts?.sms?.recipientCount || 'Students'})
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredNotifications.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-xs italic">
                  No broadcast notifications match your search or filters.
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      )}

    </div>
  );
};

export default Notifications;
