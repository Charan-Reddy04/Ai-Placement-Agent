import React, { useState, useEffect } from 'react';
import {
  CalendarCheck2,
  Calendar,
  Clock,
  MapPin,
  Users,
  Building2,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Video,
  UserCheck,
  ShieldCheck,
  Filter,
  Search,
  Star,
  RefreshCw,
  Edit2,
  Trash2,
  ExternalLink,
  Layers,
  Award,
  Loader2,
  X,
  FileText
} from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';
import StatusBadge from '../../components/StatusBadge';
import interviewService from '../../services/interviewService';
import studentService from '../../services/studentService';
import jobService from '../../services/jobService';

export const InterviewCoordination = () => {
  const [activeTab, setActiveTab] = useState('schedules'); // 'schedules' | 'panels' | 'venues'
  const [interviews, setInterviews] = useState([]);
  const [panels, setPanels] = useState([]);
  const [venues, setVenues] = useState([]);
  const [students, setStudents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [dateFilter, setDateFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPanelModal, setShowPanelModal] = useState(false);
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);

  // Scheduling Form State
  const [newInterview, setNewInterview] = useState({
    studentId: '',
    jobId: '',
    companyId: '',
    round: 'Technical Round 1',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00 AM',
    endTime: '10:45 AM',
    duration: '45 mins',
    panelId: '',
    venueId: '',
    meetingLink: '',
    notes: '',
  });

  // Conflict Checking State
  const [conflictWarning, setConflictWarning] = useState('');
  const [conflictDetails, setConflictDetails] = useState([]);
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [actionErrorMsg, setActionErrorMsg] = useState('');

  // Status & Evaluation Modal State
  const [evaluationData, setEvaluationData] = useState({
    status: 'Completed',
    outcome: 'Selected',
    rating: 8,
    feedback: 'Demonstrated solid algorithm fundamentals and clear communication.',
    notes: '',
  });

  // Panel Form State
  const [panelForm, setPanelForm] = useState({
    name: '',
    lead: '',
    department: 'School of Computing',
    specialization: 'Distributed Systems, Backend & Core Java',
    availability: 'Mon - Fri (10:00 AM - 04:00 PM)',
    memberNames: '',
  });

  // Venue Form State
  const [venueForm, setVenueForm] = useState({
    name: '',
    location: '',
    building: 'Academic Block A',
    roomNumber: '',
    type: 'Physical Lab',
    capacity: 20,
    facilitiesStr: 'High-speed LAN, Soundproof Partition, Multi-monitor Desktops',
    meetingLink: '',
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [intvsRes, panelsRes, venuesRes, studentsRes, jobsRes] = await Promise.all([
        interviewService.getInterviews(),
        interviewService.getPanels(),
        interviewService.getVenues(),
        studentService.getAllStudents().catch(() => ({ data: [] })),
        jobService.getJobs().catch(() => ({ data: [] })),
      ]);

      if (intvsRes.success) setInterviews(intvsRes.data || []);
      if (panelsRes.success) setPanels(panelsRes.data || []);
      if (venuesRes.success) setVenues(venuesRes.data || []);
      if (studentsRes?.data) setStudents(studentsRes.data || []);
      if (jobsRes?.data) setJobs(jobsRes.data || []);

      // Preselect default dropdown values if available
      if (studentsRes?.data?.length > 0 && !newInterview.studentId) {
        setNewInterview((prev) => ({
          ...prev,
          studentId: studentsRes.data[0]._id,
        }));
      }
      if (jobsRes?.data?.length > 0 && !newInterview.jobId) {
        setNewInterview((prev) => ({
          ...prev,
          jobId: jobsRes.data[0]._id,
          companyId: jobsRes.data[0].companyId?._id || jobsRes.data[0].companyId,
        }));
      }
      if (panelsRes?.data?.length > 0 && !newInterview.panelId) {
        setNewInterview((prev) => ({
          ...prev,
          panelId: panelsRes.data[0]._id,
        }));
      }
      if (venuesRes?.data?.length > 0 && !newInterview.venueId) {
        setNewInterview((prev) => ({
          ...prev,
          venueId: venuesRes.data[0]._id,
        }));
      }
    } catch (err) {
      console.error('Error loading coordination data:', err);
      setActionErrorMsg('Failed to load coordination data.');
    } finally {
      setLoading(false);
    }
  };

  // Real-time conflict validation
  const triggerConflictCheck = async (formData) => {
    if (!formData.date || !formData.startTime) return;
    try {
      setIsCheckingConflict(true);
      const res = await interviewService.checkConflict({
        studentId: formData.studentId,
        panelId: formData.panelId,
        venueId: formData.venueId,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
      });

      if (res.hasConflict) {
        setConflictWarning('Scheduling conflict detected!');
        setConflictDetails(res.conflicts || []);
      } else {
        setConflictWarning('');
        setConflictDetails([]);
      }
    } catch (err) {
      console.error('Conflict check failed:', err);
    } finally {
      setIsCheckingConflict(false);
    }
  };

  const handleInputChange = (field, value) => {
    const updated = { ...newInterview, [field]: value };
    if (field === 'jobId') {
      const selectedJob = jobs.find((j) => j._id === value);
      if (selectedJob) {
        updated.companyId = selectedJob.companyId?._id || selectedJob.companyId;
      }
    }
    setNewInterview(updated);
    triggerConflictCheck(updated);
  };

  // Submit New Interview Slot
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (conflictWarning) {
      setActionErrorMsg('Please resolve slot conflicts before confirming.');
      return;
    }

    try {
      const res = await interviewService.createInterview(newInterview);
      if (res.success) {
        setInterviews((prev) => [res.data, ...prev]);
        setShowScheduleModal(false);
        setConflictWarning('');
        setConflictDetails([]);
        setActionSuccessMsg(`Interview scheduled successfully for candidate! Notification sent.`);
        setTimeout(() => setActionSuccessMsg(''), 4500);
        // Refresh panels to update activeSlots count
        const panelsRes = await interviewService.getPanels();
        if (panelsRes.success) setPanels(panelsRes.data || []);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error scheduling interview';
      setActionErrorMsg(msg);
      if (err.response?.data?.conflicts) {
        setConflictDetails(err.response.data.conflicts);
        setConflictWarning(msg);
      }
      setTimeout(() => setActionErrorMsg(''), 4500);
    }
  };

  // Open Status & Outcome Evaluation modal
  const handleOpenEvaluate = (interview) => {
    setSelectedInterview(interview);
    setEvaluationData({
      status: interview.status || 'Completed',
      outcome: interview.outcome || 'Selected',
      rating: interview.rating || 8,
      feedback: interview.feedback || '',
      notes: interview.notes || '',
    });
    setShowStatusModal(true);
  };

  // Submit Status / Evaluation update
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInterview) return;

    try {
      const res = await interviewService.updateInterviewStatus(
        selectedInterview._id,
        evaluationData
      );
      if (res.success) {
        setInterviews((prev) =>
          prev.map((i) =>
            i._id === selectedInterview._id
              ? {
                  ...i,
                  status: evaluationData.status,
                  outcome: evaluationData.outcome,
                  rating: evaluationData.rating,
                  feedback: evaluationData.feedback,
                  notes: evaluationData.notes,
                }
              : i
          )
        );
        setShowStatusModal(false);
        setSelectedInterview(null);
        setActionSuccessMsg('Interview evaluated and candidate notified of outcome.');
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
    } catch (err) {
      setActionErrorMsg(err.response?.data?.message || 'Failed to update interview evaluation');
      setTimeout(() => setActionErrorMsg(''), 4000);
    }
  };

  // Cancel Interview
  const handleCancelInterview = async (id) => {
    if (!window.confirm('Are you sure you want to cancel and remove this scheduled interview slot?')) return;
    try {
      const res = await interviewService.deleteInterview(id);
      if (res.success) {
        setInterviews((prev) => prev.filter((i) => i._id !== id));
        setActionSuccessMsg('Interview slot removed and candidate alerted.');
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
    } catch (err) {
      setActionErrorMsg(err.response?.data?.message || 'Failed to cancel interview');
      setTimeout(() => setActionErrorMsg(''), 4000);
    }
  };

  // Create Faculty Panel
  const handleCreatePanel = async (e) => {
    e.preventDefault();
    try {
      const members = panelForm.memberNames
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean)
        .map((name) => ({ name, designation: 'Faculty Member' }));

      const res = await interviewService.createPanel({
        name: panelForm.name,
        lead: panelForm.lead,
        department: panelForm.department,
        specialization: panelForm.specialization,
        availability: panelForm.availability,
        members: members.length > 0 ? members : [{ name: panelForm.lead }],
      });

      if (res.success) {
        setPanels((prev) => [...prev, res.data]);
        setShowPanelModal(false);
        setPanelForm({
          name: '',
          lead: '',
          department: 'School of Computing',
          specialization: 'Distributed Systems, Backend & Core Java',
          availability: 'Mon - Fri (10:00 AM - 04:00 PM)',
          memberNames: '',
        });
        setActionSuccessMsg(`Faculty Panel "${res.data.name}" created successfully.`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
    } catch (err) {
      setActionErrorMsg(err.response?.data?.message || 'Failed to create panel');
      setTimeout(() => setActionErrorMsg(''), 4000);
    }
  };

  // Create Venue
  const handleCreateVenue = async (e) => {
    e.preventDefault();
    try {
      const facilities = venueForm.facilitiesStr
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean);

      const res = await interviewService.createVenue({
        name: venueForm.name,
        location: venueForm.location,
        building: venueForm.building,
        roomNumber: venueForm.roomNumber,
        type: venueForm.type,
        capacity: Number(venueForm.capacity) || 20,
        facilities,
        meetingLink: venueForm.meetingLink,
      });

      if (res.success) {
        setVenues((prev) => [...prev, res.data]);
        setShowVenueModal(false);
        setVenueForm({
          name: '',
          location: '',
          building: 'Academic Block A',
          roomNumber: '',
          type: 'Physical Lab',
          capacity: 20,
          facilitiesStr: 'High-speed LAN, Soundproof Partition, Multi-monitor Desktops',
          meetingLink: '',
        });
        setActionSuccessMsg(`Venue "${res.data.name}" added to coordination pool.`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
    } catch (err) {
      setActionErrorMsg(err.response?.data?.message || 'Failed to create venue');
      setTimeout(() => setActionErrorMsg(''), 4000);
    }
  };

  // Filter interviews
  const filteredInterviews = interviews.filter((intv) => {
    if (statusFilter !== 'All' && intv.status !== statusFilter) return false;
    if (dateFilter !== 'All' && intv.date !== dateFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const candName = intv.studentId?.userId?.name?.toLowerCase() || '';
      const candRoll = intv.studentId?.rollNumber?.toLowerCase() || '';
      const compName = intv.companyId?.name?.toLowerCase() || '';
      const roundName = intv.round?.toLowerCase() || '';
      return candName.includes(q) || candRoll.includes(q) || compName.includes(q) || roundName.includes(q);
    }
    return true;
  });

  // Calculate top statistics
  const totalScheduled = interviews.length;
  const confirmedCount = interviews.filter((i) => i.status === 'Confirmed' || i.status === 'Scheduled').length;
  const completedCount = interviews.filter((i) => i.status === 'Completed').length;
  const selectedCount = interviews.filter((i) => i.outcome === 'Selected').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-teal" />
        <p className="text-xs font-semibold text-brand-secondary">
          Initializing coordination engine, faculty panels, and venue matrix...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <GlassCard padding="md" className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-brand-navy dark:text-slate-100 flex items-center gap-2">
            <CalendarCheck2 className="w-6 h-6 text-brand-teal" />
            <span>Interview Scheduling & Panel Coordination</span>
          </h1>
          <p className="text-xs text-brand-secondary dark:text-slate-400 mt-1">
            Deterministic conflict checking across students, faculty panels, physical venues, and virtual meeting rooms
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-white/60 dark:bg-slate-800/60 rounded-control border border-slate-200/80 dark:border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('schedules')}
            className={`px-3.5 py-1.5 rounded-control font-semibold transition-all ${
              activeTab === 'schedules'
                ? 'bg-gradient-primary text-white shadow-button'
                : 'text-brand-secondary dark:text-slate-300 hover:text-brand-teal'
            }`}
          >
            Schedules ({interviews.length})
          </button>
          <button
            onClick={() => setActiveTab('panels')}
            className={`px-3.5 py-1.5 rounded-control font-semibold transition-all ${
              activeTab === 'panels'
                ? 'bg-gradient-primary text-white shadow-button'
                : 'text-brand-secondary dark:text-slate-300 hover:text-brand-teal'
            }`}
          >
            Faculty Panels ({panels.length})
          </button>
          <button
            onClick={() => setActiveTab('venues')}
            className={`px-3.5 py-1.5 rounded-control font-semibold transition-all ${
              activeTab === 'venues'
                ? 'bg-gradient-primary text-white shadow-button'
                : 'text-brand-secondary dark:text-slate-300 hover:text-brand-teal'
            }`}
          >
            Venues & Labs ({venues.length})
          </button>
        </div>
      </GlassCard>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <GlassCard padding="sm" className="flex items-center gap-3">
          <div className="p-2.5 rounded-card bg-brand-teal/10 text-brand-teal">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-brand-secondary dark:text-slate-400">Total Rounds</p>
            <p className="text-xl font-bold text-brand-navy dark:text-slate-100">{totalScheduled}</p>
          </div>
        </GlassCard>

        <GlassCard padding="sm" className="flex items-center gap-3">
          <div className="p-2.5 rounded-card bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-brand-secondary dark:text-slate-400">Active / Confirmed</p>
            <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400">{confirmedCount}</p>
          </div>
        </GlassCard>

        <GlassCard padding="sm" className="flex items-center gap-3">
          <div className="p-2.5 rounded-card bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-brand-secondary dark:text-slate-400">Completed Sessions</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{completedCount}</p>
          </div>
        </GlassCard>

        <GlassCard padding="sm" className="flex items-center gap-3">
          <div className="p-2.5 rounded-card bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-brand-secondary dark:text-slate-400">Selected Offers</p>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{selectedCount}</p>
          </div>
        </GlassCard>
      </div>

      {/* Alert Toasts */}
      {actionSuccessMsg && (
        <div className="p-3.5 rounded-control bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {actionErrorMsg && (
        <div className="p-3.5 rounded-control bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{actionErrorMsg}</span>
          </div>
          <button onClick={() => setActionErrorMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* TAB 1: SCHEDULES TABLE */}
      {activeTab === 'schedules' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search candidate, company, round..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-xs w-48 sm:w-64 focus:outline-none focus:border-brand-teal"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-xs font-semibold text-brand-navy dark:text-slate-200"
              >
                <option value="All">All Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-1.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-xs font-semibold text-brand-navy dark:text-slate-200"
              >
                <option value="All">All Dates</option>
                {Array.from(new Set(interviews.map((i) => i.date).filter(Boolean))).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadAllData}
                title="Refresh Matrix"
                className="p-2 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-secondary hover:text-brand-teal transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <GradientButton
                size="sm"
                icon={Plus}
                onClick={() => {
                  setShowScheduleModal(true);
                  triggerConflictCheck(newInterview);
                }}
              >
                Schedule Interview Slot
              </GradientButton>
            </div>
          </div>

          {/* Table */}
          <GlassCard padding="md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-slate-800 text-brand-secondary dark:text-slate-400">
                    <th className="pb-3 font-semibold">Candidate</th>
                    <th className="pb-3 font-semibold">Company & Opening</th>
                    <th className="pb-3 font-semibold">Round & Timing</th>
                    <th className="pb-3 font-semibold">Assigned Panel</th>
                    <th className="pb-3 font-semibold">Venue / Meeting</th>
                    <th className="pb-3 font-semibold">Status / Outcome</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredInterviews.map((intv) => {
                    const studentName = intv.studentId?.userId?.name || 'Candidate';
                    const studentRoll = intv.studentId?.rollNumber || 'N/A';
                    const compName = intv.companyId?.name || intv.jobId?.companyName || 'Recruiter';
                    const jobTitle = intv.jobId?.title || 'Open Position';
                    const panelName = intv.panelId?.name || 'Academic Committee';
                    const panelLead = intv.panelId?.lead ? `(${intv.panelId.lead})` : '';
                    const venueText = intv.venueId ? `${intv.venueId.name} ${intv.venueId.roomNumber ? `[${intv.venueId.roomNumber}]` : ''}` : 'Online';

                    return (
                      <tr key={intv._id} className="hover:bg-brand-teal/5 transition-colors">
                        <td className="py-3.5 pr-2">
                          <div className="font-bold text-brand-navy dark:text-slate-100">
                            {studentName}
                          </div>
                          <div className="text-[10px] text-brand-secondary dark:text-slate-400">
                            {studentRoll} • {intv.studentId?.branch || ''}
                          </div>
                        </td>

                        <td className="py-3.5 pr-2">
                          <div className="font-semibold text-brand-navy dark:text-slate-200">
                            {compName}
                          </div>
                          <div className="text-[10px] text-brand-secondary dark:text-slate-400">
                            {jobTitle}
                          </div>
                        </td>

                        <td className="py-3.5 pr-2">
                          <div className="font-semibold text-brand-teal dark:text-brand-cyan flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{intv.date} ({intv.startTime} - {intv.endTime || '45m'})</span>
                          </div>
                          <div className="text-[10px] text-brand-secondary dark:text-slate-400">
                            {intv.round || intv.roundName}
                          </div>
                        </td>

                        <td className="py-3.5 pr-2">
                          <div className="text-brand-navy dark:text-slate-200 font-medium">
                            {panelName}
                          </div>
                          <div className="text-[10px] text-brand-secondary dark:text-slate-400">
                            {panelLead}
                          </div>
                        </td>

                        <td className="py-3.5 pr-2">
                          <div className="text-brand-secondary dark:text-slate-300 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-brand-teal shrink-0" />
                            <span>{venueText}</span>
                          </div>
                          {intv.meetingLink && (
                            <a
                              href={intv.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-brand-teal hover:underline inline-flex items-center gap-0.5 mt-0.5"
                            >
                              <span>Join Link</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </td>

                        <td className="py-3.5 pr-2">
                          <div className="flex flex-col gap-1 items-start">
                            <StatusBadge status={intv.status} size="sm" />
                            {intv.outcome && intv.outcome !== 'Pending' && (
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                  intv.outcome === 'Selected'
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                    : intv.outcome === 'Next Round'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                                    : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                }`}
                              >
                                {intv.outcome} {intv.rating ? `(${intv.rating}/10)` : ''}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEvaluate(intv)}
                              title="Evaluate / Set Outcome"
                              className="px-2 py-1 rounded bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal dark:text-brand-cyan text-[11px] font-semibold transition-all inline-flex items-center gap-1"
                            >
                              <Star className="w-3 h-3" />
                              <span>Evaluate</span>
                            </button>
                            <button
                              onClick={() => handleCancelInterview(intv._id)}
                              title="Cancel Slot"
                              className="p-1 rounded text-slate-400 hover:text-rose-600 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredInterviews.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs italic">
                  No interview sessions match the selected query and filters.
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 2: FACULTY PANELS */}
      {activeTab === 'panels' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-brand-secondary dark:text-slate-400">
              Department academic committees and industry external evaluators
            </p>
            <GradientButton size="sm" icon={Plus} onClick={() => setShowPanelModal(true)}>
              Add Faculty Panel
            </GradientButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {panels.map((p) => (
              <GlassCard key={p._id || p.id} padding="md" hoverEffect className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-brand-navy dark:text-slate-100">
                      {p.name}
                    </h3>
                    <p className="text-xs font-semibold text-brand-teal mt-0.5">
                      Lead: {p.lead} ({p.department})
                    </p>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      p.status === 'Available'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-amber-500/10 text-amber-600'
                    }`}
                  >
                    {p.status || 'Available'}
                  </span>
                </div>

                <div className="p-3 rounded-control bg-slate-50 dark:bg-slate-800/60 text-xs space-y-2">
                  <p className="text-brand-secondary dark:text-slate-300">
                    <strong className="text-brand-navy dark:text-slate-200">Domain Specialization:</strong>{' '}
                    {p.specialization}
                  </p>
                  <p className="text-brand-secondary dark:text-slate-300">
                    <strong className="text-brand-navy dark:text-slate-200">Working Availability:</strong>{' '}
                    {p.availability}
                  </p>
                  
                  {p.members && p.members.length > 0 && (
                    <div>
                      <span className="font-semibold text-brand-navy dark:text-slate-200 block mb-1">
                        Active Members ({p.members.length}):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {p.members.map((m, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-slate-700 text-brand-secondary dark:text-slate-300 border border-slate-200/60 dark:border-white/5"
                          >
                            {m.name} {m.designation ? `(${m.designation})` : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                    <span className="text-brand-secondary dark:text-slate-400">Current Load:</span>
                    <span className="font-bold text-brand-teal dark:text-brand-cyan">
                      {p.activeSlots || 0} Scheduled Sessions
                    </span>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: VENUES & VIRTUAL PLATFORMS */}
      {activeTab === 'venues' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-brand-secondary dark:text-slate-400">
              Campus computing labs, interview cabins, and encrypted Webex/Meet virtual bridges
            </p>
            <GradientButton size="sm" icon={Plus} onClick={() => setShowVenueModal(true)}>
              Add Venue / Lab
            </GradientButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {venues.map((v) => (
              <GlassCard key={v._id || v.id} padding="md" hoverEffect className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-brand-navy dark:text-slate-100">
                      {v.name}
                    </h3>
                    <p className="text-xs text-brand-secondary dark:text-slate-400 mt-0.5">
                      {v.location} • Type: <strong className="text-brand-teal">{v.type}</strong>
                    </p>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      v.status === 'Available'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-rose-500/10 text-rose-600'
                    }`}
                  >
                    {v.status || 'Available'}
                  </span>
                </div>

                <div className="p-3 rounded-control bg-slate-50 dark:bg-slate-800/60 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-brand-secondary dark:text-slate-400">Max Capacity:</span>
                    <strong className="text-brand-navy dark:text-slate-200">{v.capacity || 1} Candidates</strong>
                  </div>

                  {v.facilities && v.facilities.length > 0 && (
                    <div>
                      <p className="font-semibold text-brand-secondary dark:text-slate-400 mb-1">
                        Equipped Facilities:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {v.facilities.map((fac, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-slate-700 text-brand-secondary dark:text-slate-300 border border-slate-200/60 dark:border-white/5"
                          >
                            {fac}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {v.meetingLink && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700 flex items-center justify-between">
                      <span className="text-[11px] text-brand-secondary">Virtual Room URL:</span>
                      <a
                        href={v.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-brand-teal font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        <span>Open Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: SCHEDULE INTERVIEW SLOT (WITH LIVE CONFLICT CHECK) */}
      {/* ========================================================= */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <GlassCard padding="lg" className="w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-brand-navy dark:text-slate-100 flex items-center gap-2">
                <CalendarCheck2 className="w-5 h-5 text-brand-teal" />
                <span>Schedule Candidate Interview</span>
              </h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-brand-secondary dark:text-slate-400 mb-4">
              Select student candidate, job opening, panel, and venue. The coordination engine verifies availability in real-time.
            </p>

            {/* Conflict Warning Card */}
            {conflictWarning && (
              <div className="p-3 mb-4 rounded-control bg-rose-50 dark:bg-rose-950/40 border border-rose-300 text-rose-700 dark:text-rose-300 text-xs font-semibold space-y-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{conflictWarning}</span>
                </div>
                {conflictDetails.map((c, i) => (
                  <p key={i} className="text-[11px] pl-6 font-normal">
                    • {c.message}
                  </p>
                ))}
              </div>
            )}

            <form onSubmit={handleScheduleSubmit} className="space-y-3.5 text-xs">
              {/* Student Candidate */}
              <div>
                <label className="block font-semibold mb-1 text-brand-navy dark:text-slate-200">
                  Student Candidate *
                </label>
                <select
                  value={newInterview.studentId}
                  onChange={(e) => handleInputChange('studentId', e.target.value)}
                  required
                  className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10"
                >
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.userId?.name || 'Student'} ({s.rollNumber}) — {s.branch} (CGPA: {s.cgpa})
                    </option>
                  ))}
                </select>
              </div>

              {/* Job & Round */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-brand-navy dark:text-slate-200">
                    Company & Job *
                  </label>
                  <select
                    value={newInterview.jobId}
                    onChange={(e) => handleInputChange('jobId', e.target.value)}
                    required
                    className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10"
                  >
                    {jobs.map((j) => (
                      <option key={j._id} value={j._id}>
                        {j.companyName} — {j.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-brand-navy dark:text-slate-200">
                    Interview Round *
                  </label>
                  <input
                    type="text"
                    required
                    value={newInterview.round}
                    onChange={(e) => handleInputChange('round', e.target.value)}
                    placeholder="e.g. Technical Round 1, System Design"
                    className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10"
                  />
                </div>
              </div>

              {/* Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-brand-navy dark:text-slate-200">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newInterview.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-brand-navy dark:text-slate-200">
                    Start Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={newInterview.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    placeholder="e.g. 10:00 AM"
                    className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-brand-navy dark:text-slate-200">
                    End Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={newInterview.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    placeholder="e.g. 10:45 AM"
                    className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10"
                  />
                </div>
              </div>

              {/* Panel & Venue */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-brand-navy dark:text-slate-200">
                    Faculty Evaluation Panel *
                  </label>
                  <select
                    value={newInterview.panelId}
                    onChange={(e) => handleInputChange('panelId', e.target.value)}
                    required
                    className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10"
                  >
                    {panels.map((p) => (
                      <option key={p._id || p.id} value={p._id || p.id}>
                        {p.name} ({p.lead})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-brand-navy dark:text-slate-200">
                    Venue / Meeting Room *
                  </label>
                  <select
                    value={newInterview.venueId}
                    onChange={(e) => handleInputChange('venueId', e.target.value)}
                    required
                    className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10"
                  >
                    {venues.map((v) => (
                      <option key={v._id || v.id} value={v._id || v.id}>
                        {v.name} ({v.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Virtual Meeting Link */}
              <div>
                <label className="block font-semibold mb-1 text-brand-navy dark:text-slate-200">
                  Custom Meeting Link (Optional)
                </label>
                <input
                  type="url"
                  value={newInterview.meetingLink}
                  onChange={(e) => handleInputChange('meetingLink', e.target.value)}
                  placeholder="https://meet.google.com/... or https://webex.com/..."
                  className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10"
                />
              </div>

              {/* Conflict Status Tag */}
              <div className="py-1">
                {isCheckingConflict ? (
                  <span className="text-[11px] text-brand-teal flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Checking slot matrix...
                  </span>
                ) : !conflictWarning ? (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Slot verified: Candidate, Panel, and Venue are completely free
                  </span>
                ) : null}
              </div>

              <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-control text-xs font-semibold text-brand-secondary hover:text-brand-navy"
                >
                  Cancel
                </button>
                <GradientButton
                  type="submit"
                  size="sm"
                  disabled={Boolean(conflictWarning) || isCheckingConflict}
                >
                  Confirm & Reserve Slot
                </GradientButton>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: INTERVIEW STATUS & EVALUATION OUTCOME */}
      {/* ========================================================= */}
      {showStatusModal && selectedInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <GlassCard padding="lg" className="w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-brand-navy dark:text-slate-100 flex items-center gap-2">
                <Award className="w-5 h-5 text-brand-teal" />
                <span>Evaluate & Update Status</span>
              </h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-brand-secondary dark:text-slate-400 mb-4">
              Recording interview outcome for {selectedInterview.studentId?.userId?.name || 'Candidate'} (
              {selectedInterview.companyId?.name || 'Company'} — {selectedInterview.round})
            </p>

            <form onSubmit={handleStatusSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Session Status *</label>
                  <select
                    value={evaluationData.status}
                    onChange={(e) => setEvaluationData({ ...evaluationData, status: e.target.value })}
                    className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Rescheduled">Rescheduled</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Round Outcome *</label>
                  <select
                    value={evaluationData.outcome}
                    onChange={(e) => setEvaluationData({ ...evaluationData, outcome: e.target.value })}
                    className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Selected">Selected / Passed</option>
                    <option value="Next Round">Advanced to Next Round</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Rating Scale (1 - 10) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold">Candidate Performance Rating</label>
                  <span className="font-bold text-brand-teal">{evaluationData.rating} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={evaluationData.rating}
                  onChange={(e) => setEvaluationData({ ...evaluationData, rating: Number(e.target.value) })}
                  className="w-full accent-brand-teal"
                />
              </div>

              {/* Feedback to Student */}
              <div>
                <label className="block font-semibold mb-1">Official Evaluation Feedback</label>
                <textarea
                  rows="3"
                  value={evaluationData.feedback}
                  onChange={(e) => setEvaluationData({ ...evaluationData, feedback: e.target.value })}
                  placeholder="Detail candidate problem-solving speed, technical depth, and communication skills..."
                  className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 rounded-control text-xs font-semibold text-brand-secondary hover:text-brand-navy"
                >
                  Cancel
                </button>
                <GradientButton type="submit" size="sm">
                  Save & Notify Candidate
                </GradientButton>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: ADD FACULTY PANEL */}
      {/* ========================================================= */}
      {showPanelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <GlassCard padding="lg" className="w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-brand-navy dark:text-slate-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-teal" />
                <span>Create Faculty Evaluation Panel</span>
              </h3>
              <button onClick={() => setShowPanelModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreatePanel} className="space-y-3 text-xs mt-3">
              <div>
                <label className="block font-semibold mb-1">Panel Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Panel Gamma - AI & Data Systems"
                  value={panelForm.name}
                  onChange={(e) => setPanelForm({ ...panelForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Lead Evaluator *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Sharma"
                    value={panelForm.lead}
                    onChange={(e) => setPanelForm({ ...panelForm, lead: e.target.value })}
                    className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Department *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. School of Computing"
                    value={panelForm.department}
                    onChange={(e) => setPanelForm({ ...panelForm, department: e.target.value })}
                    className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Specialization Focus</label>
                <input
                  type="text"
                  placeholder="e.g. Machine Learning, Cloud Architecture, Core Java"
                  value={panelForm.specialization}
                  onChange={(e) => setPanelForm({ ...panelForm, specialization: e.target.value })}
                  className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Panel Members (comma-separated)</label>
                <input
                  type="text"
                  placeholder="Dr. Sharma, Prof. Mehra, Er. Ananya"
                  value={panelForm.memberNames}
                  onChange={(e) => setPanelForm({ ...panelForm, memberNames: e.target.value })}
                  className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10"
                />
              </div>

              <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPanelModal(false)}
                  className="px-4 py-2 rounded-control text-xs font-semibold text-brand-secondary"
                >
                  Cancel
                </button>
                <GradientButton type="submit" size="sm">
                  Create Panel
                </GradientButton>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: ADD VENUE / LAB */}
      {/* ========================================================= */}
      {showVenueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <GlassCard padding="lg" className="w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-brand-navy dark:text-slate-100 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-brand-teal" />
                <span>Add Interview Venue or Virtual Link</span>
              </h3>
              <button onClick={() => setShowVenueModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateVenue} className="space-y-3 text-xs mt-3">
              <div>
                <label className="block font-semibold mb-1">Venue Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lab Block C - 401"
                  value={venueForm.name}
                  onChange={(e) => setVenueForm({ ...venueForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Building *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Academic Block C"
                    value={venueForm.building}
                    onChange={(e) => setVenueForm({ ...venueForm, building: e.target.value })}
                    className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Room Number</label>
                  <input
                    type="text"
                    placeholder="e.g. Room 401"
                    value={venueForm.roomNumber}
                    onChange={(e) => setVenueForm({ ...venueForm, roomNumber: e.target.value })}
                    className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Venue Type *</label>
                  <select
                    value={venueForm.type}
                    onChange={(e) => setVenueForm({ ...venueForm, type: e.target.value })}
                    className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10"
                  >
                    <option value="Physical Lab">Physical Lab</option>
                    <option value="Virtual Bridge">Virtual Bridge (Webex/Meet)</option>
                    <option value="Executive Boardroom">Executive Boardroom</option>
                    <option value="Auditorium">Auditorium</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={venueForm.capacity}
                    onChange={(e) => setVenueForm({ ...venueForm, capacity: e.target.value })}
                    className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Equipped Facilities (comma-separated)</label>
                <input
                  type="text"
                  placeholder="Dual Monitors, HD Webcam, Soundproof Cabins"
                  value={venueForm.facilitiesStr}
                  onChange={(e) => setVenueForm({ ...venueForm, facilitiesStr: e.target.value })}
                  className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Virtual Meeting Room URL</label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={venueForm.meetingLink}
                  onChange={(e) => setVenueForm({ ...venueForm, meetingLink: e.target.value })}
                  className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10"
                />
              </div>

              <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowVenueModal(false)}
                  className="px-4 py-2 rounded-control text-xs font-semibold text-brand-secondary"
                >
                  Cancel
                </button>
                <GradientButton type="submit" size="sm">
                  Add Venue
                </GradientButton>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

    </div>
  );
};

export default InterviewCoordination;
