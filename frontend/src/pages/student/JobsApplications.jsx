import React, { useState, useEffect } from 'react';
import {
    Briefcase,
    Search,
    Filter,
    CheckCircle2,
    XCircle,
    MapPin,
    Calendar,
    Send,
    Loader2,
    AlertCircle,
} from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';
import StatusBadge from '../../components/StatusBadge';
import jobService from '../../services/jobService';
import studentService from '../../services/studentService';

export const JobsApplications = () => {
    const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'applications'
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCompany, setSelectedCompany] = useState('All');
    const [selectedJobForModal, setSelectedJobForModal] = useState(null);

    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applyingJobId, setApplyingJobId] = useState(null);
    const [applySuccessMessage, setApplySuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setErrorMessage('');
            const [jobsRes, appsRes] = await Promise.all([
                jobService.getJobs(),
                studentService.getMyApplications(),
            ]);

            if (jobsRes.success) {
                setJobs(jobsRes.data || []);
            }
            if (appsRes.success) {
                setApplications(appsRes.data || []);
            }
        } catch (err) {
            console.error('Error loading jobs & applications:', err);
            setErrorMessage(
                err.response?.data?.message || 'Failed to retrieve recruitment opportunities from backend.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (job) => {
        setApplyingJobId(job._id);
        setErrorMessage('');
        try {
            const res = await jobService.applyToJob(job._id);
            if (res.success) {
                setApplySuccessMessage(
                    `Application for ${job.companyName} (${job.title}) successfully submitted! ${res.message}`
                );
                setSelectedJobForModal(null);
                await loadData();
                setTimeout(() => setApplySuccessMessage(''), 5000);
            }
        } catch (err) {
            console.error('Application submission error:', err);
            setErrorMessage(
                err.response?.data?.message || 'Could not submit application. Please check eligibility requirements.'
            );
        } finally {
            setApplyingJobId(null);
        }
    };

    const filteredJobs = jobs.filter((job) => {
        const matchesSearch =
            job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (job.requiredSkills &&
                job.requiredSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())));
        const matchesCompany = selectedCompany === 'All' || job.companyName === selectedCompany;
        return matchesSearch && matchesCompany;
    });

    const companiesList = ['All', ...new Set(jobs.map((j) => j.companyName))];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-brand-teal" />
                <p className="text-xs font-semibold text-brand-secondary">
                    Loading placement opportunities & applications...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12 animate-in fade-in duration-300">
            {/* Top Banner */}
            <GlassCard padding="md" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-brand-navy dark:text-slate-100 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-brand-teal" />
                        <span>Campus Recruitment Opportunities</span>
                    </h1>
                    <p className="text-xs text-brand-secondary dark:text-slate-400 mt-1">
                        Browse verified job postings, inspect deterministic eligibility criteria, and track recruitment rounds
                    </p>
                </div>

                {/* Tab switch */}
                <div className="flex items-center gap-1.5 p-1 bg-white/60 dark:bg-slate-800/60 rounded-control border border-slate-200/80 dark:border-white/10 text-xs">
                    <button
                        onClick={() => setActiveTab('jobs')}
                        className={`px-3.5 py-1.5 rounded-control font-semibold transition-all ${activeTab === 'jobs'
                            ? 'bg-gradient-primary text-white shadow-button'
                            : 'text-brand-secondary dark:text-slate-300 hover:text-brand-navy dark:hover:text-white'
                            }`}
                    >
                        Available Jobs ({jobs.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('applications')}
                        className={`px-3.5 py-1.5 rounded-control font-semibold transition-all ${activeTab === 'applications'
                            ? 'bg-gradient-primary text-white shadow-button'
                            : 'text-brand-secondary dark:text-slate-300 hover:text-brand-navy dark:hover:text-white'
                            }`}
                    >
                        My Applications ({applications.length})
                    </button>
                </div>
            </GlassCard>

            {errorMessage && (
                <div className="p-3.5 rounded-control bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {applySuccessMessage && (
                <div className="p-3.5 rounded-control bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{applySuccessMessage}</span>
                </div>
            )}

            {/* Tab 1: Available Jobs */}
            {activeTab === 'jobs' && (
                <div className="space-y-6">
                    {/* Search & Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3.5 top-3 text-brand-secondary dark:text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by job title, recruiter, or skill (e.g. React, Python, Cloud)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-control text-xs sm:text-sm bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-brand-secondary dark:text-slate-400 hidden sm:block" />
                            <select
                                value={selectedCompany}
                                onChange={(e) => setSelectedCompany(e.target.value)}
                                className="px-3.5 py-2.5 rounded-control text-xs sm:text-sm bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
                            >
                                {companiesList.map((c) => (
                                    <option key={c} value={c}>
                                        {c === 'All' ? 'All Recruiters' : c}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Job Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {filteredJobs.map((job) => {
                            const alreadyApplied = job.hasApplied;
                            const isEligible = job.isEligible ?? true;

                            return (
                                <GlassCard key={job._id} padding="md" hoverEffect className="flex flex-col justify-between">
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <span className="text-xs font-bold text-brand-teal uppercase tracking-wider">
                                                    {job.companyName}
                                                </span>
                                                <h3 className="text-base font-bold text-brand-navy dark:text-slate-100 mt-0.5">
                                                    {job.title}
                                                </h3>
                                                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                                                    {job.package}
                                                </p>
                                            </div>

                                            {/* Eligibility Status Pill */}
                                            {isEligible ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 shrink-0">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                    <span>Eligible</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 shrink-0">
                                                    <XCircle className="w-3.5 h-3.5 text-rose-500" />
                                                    <span>Ineligible</span>
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-xs text-brand-secondary dark:text-slate-300 leading-relaxed line-clamp-2">
                                            {job.description}
                                        </p>

                                        {/* Metadata tags */}
                                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-brand-secondary dark:text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3 text-brand-teal" />
                                                {job.location}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3 text-brand-teal" />
                                                Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                                            </span>
                                        </div>

                                        {/* Required Skills */}
                                        {job.requiredSkills && job.requiredSkills.length > 0 && (
                                            <div className="pt-1">
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-secondary dark:text-slate-400 mb-1.5">
                                                    Required Skills:
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {job.requiredSkills.map((skill) => (
                                                        <span
                                                            key={skill}
                                                            className="text-[10px] px-2 py-0.5 rounded-control bg-brand-teal/10 text-brand-teal dark:text-brand-cyan font-medium border border-brand-teal/20"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Deterministic Eligibility Explanation */}
                                        <div
                                            className={`p-2.5 rounded-control text-[11px] ${isEligible
                                                ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300'
                                                : 'bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300'
                                                }`}
                                        >
                                            {isEligible ? (
                                                <p>✓ You satisfy all eligibility constraints: CGPA (≥ {job.minimumCGPA}), backlog threshold, and branch allowance.</p>
                                            ) : (
                                                <div>
                                                    <p className="font-semibold">Reason for ineligibility:</p>
                                                    <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                                                        {job.ineligibilityReasons && job.ineligibilityReasons.length > 0 ? (
                                                            job.ineligibilityReasons.map((r, i) => <li key={i}>{r}</li>)
                                                        ) : (
                                                            <li>Academic criteria do not match opening specification.</li>
                                                        )}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                                        <button
                                            onClick={() => setSelectedJobForModal(job)}
                                            className="text-xs font-semibold text-brand-teal dark:text-brand-cyan hover:underline"
                                        >
                                            View Details & Rounds
                                        </button>

                                        {alreadyApplied ? (
                                            <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-control">
                                                Applied ({job.applicationStatus || 'Submitted'})
                                            </span>
                                        ) : (
                                            <GradientButton
                                                size="sm"
                                                disabled={!isEligible || applyingJobId === job._id}
                                                onClick={() => handleApply(job)}
                                                icon={Send}
                                            >
                                                {applyingJobId === job._id ? 'Submitting...' : 'Apply Now'}
                                            </GradientButton>
                                        )}
                                    </div>
                                </GlassCard>
                            );
                        })}
                        {filteredJobs.length === 0 && (
                            <div className="col-span-2 text-center py-12 text-sm text-brand-secondary">
                                No job postings match your active search criteria.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Tab 2: Application History */}
            {activeTab === 'applications' && (
                <div className="space-y-4">
                    <GlassCard padding="md">
                        <h3 className="text-base font-bold text-brand-navy dark:text-slate-100 mb-1">
                            Application Tracking & Recruiter Status
                        </h3>
                        <p className="text-xs text-brand-secondary dark:text-slate-400 mb-4">
                            Real-time progress for your submitted applications recorded in database
                        </p>

                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {applications.map((app) => (
                                <div key={app._id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-brand-navy dark:text-slate-100">
                                                    {app.jobId?.companyName || 'Recruiting Partner'}
                                                </span>
                                                <span className="text-xs text-brand-teal font-semibold">
                                                    — {app.jobId?.title || 'Role'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-brand-secondary dark:text-slate-400">
                                                Applied on {new Date(app.applicationDate || app.createdAt).toLocaleDateString()} •
                                                Deterministic Status: <strong className="text-emerald-600">{app.eligibilityStatus}</strong>
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <span className="text-[11px] font-semibold text-brand-secondary dark:text-slate-400 block">
                                                    Compatibility Score
                                                </span>
                                                <span className="text-sm font-extrabold text-brand-teal">
                                                    {app.matchScore}%
                                                </span>
                                            </div>
                                            <StatusBadge status={app.status} size="md" />
                                        </div>
                                    </div>

                                    <div className="p-3 rounded-control bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5 text-xs text-brand-secondary dark:text-slate-300">
                                        <p>
                                            <strong className="text-brand-navy dark:text-slate-200">Matching Explanation:</strong>{' '}
                                            {app.matchExplanation}
                                        </p>
                                        {app.reviewNotes && (
                                            <p className="mt-1 text-[11px] text-brand-secondary/80 dark:text-slate-400">
                                                <strong className="text-brand-navy dark:text-slate-200">Latest Review Note:</strong>{' '}
                                                {app.reviewNotes}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {applications.length === 0 && (
                                <div className="text-center py-8 text-xs text-slate-400 italic">
                                    No applications submitted yet. Switch to "Available Jobs" to submit your application.
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* Job Details Modal */}
            {selectedJobForModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
                    <GlassCard padding="lg" className="w-full max-w-xl max-h-[85vh] overflow-y-auto relative shadow-card">
                        <div className="flex items-start justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
                            <div>
                                <span className="text-xs font-bold text-brand-teal uppercase">
                                    {selectedJobForModal.companyName}
                                </span>
                                <h3 className="text-lg font-bold text-brand-navy dark:text-slate-100">
                                    {selectedJobForModal.title}
                                </h3>
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                                    Package: {selectedJobForModal.package}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedJobForModal(null)}
                                className="text-slate-400 hover:text-brand-navy text-lg font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4 py-4 text-xs">
                            <div>
                                <h4 className="font-bold text-brand-navy dark:text-slate-200 mb-1">
                                    Job Description
                                </h4>
                                <p className="text-brand-secondary dark:text-slate-300 leading-relaxed">
                                    {selectedJobForModal.description}
                                </p>
                            </div>

                            {selectedJobForModal.rounds && selectedJobForModal.rounds.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-brand-navy dark:text-slate-200 mb-1">
                                        Selection Rounds
                                    </h4>
                                    <div className="space-y-1.5">
                                        {selectedJobForModal.rounds.map((r, i) => (
                                            <div key={i} className="flex items-center gap-2 text-brand-secondary dark:text-slate-300">
                                                <span className="w-4 h-4 rounded-full bg-brand-teal/20 text-brand-teal flex items-center justify-center text-[10px] font-bold">
                                                    {i + 1}
                                                </span>
                                                <span>{r}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <h4 className="font-bold text-brand-navy dark:text-slate-200 mb-1">
                                    Eligibility Specifications
                                </h4>
                                <div className="grid grid-cols-2 gap-2 p-3 rounded-control bg-slate-50 dark:bg-slate-800/60">
                                    <p>
                                        Min CGPA: <strong className="text-brand-navy dark:text-slate-100">{selectedJobForModal.minimumCGPA}</strong>
                                    </p>
                                    <p>
                                        Max Backlogs: <strong className="text-brand-navy dark:text-slate-100">{selectedJobForModal.maximumActiveBacklogs}</strong>
                                    </p>
                                    <p>
                                        Graduation: <strong className="text-brand-navy dark:text-slate-100">{selectedJobForModal.graduationYear}</strong>
                                    </p>
                                    <p>
                                        Type: <strong className="text-brand-navy dark:text-slate-100">{selectedJobForModal.type}</strong>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex justify-end gap-2">
                            <button
                                onClick={() => setSelectedJobForModal(null)}
                                className="px-4 py-2 rounded-control text-xs font-semibold text-brand-secondary hover:text-brand-navy"
                            >
                                Close
                            </button>
                            <GradientButton
                                size="sm"
                                disabled={!selectedJobForModal.isEligible || selectedJobForModal.hasApplied || applyingJobId === selectedJobForModal._id}
                                onClick={() => handleApply(selectedJobForModal)}
                                icon={Send}
                            >
                                {selectedJobForModal.hasApplied
                                    ? 'Already Applied'
                                    : applyingJobId === selectedJobForModal._id
                                        ? 'Submitting...'
                                        : 'Submit Application'}
                            </GradientButton>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};

export default JobsApplications;
