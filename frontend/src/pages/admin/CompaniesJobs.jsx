import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Building2,
  Briefcase,
  Plus,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  FileText,
  MapPin,
  Calendar,
  Loader2,
  Trash2,
} from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';
import StatusBadge from '../../components/StatusBadge';
import companyService from '../../services/companyService';
import jobService from '../../services/jobService';
import agentService from '../../services/agentService';

export const CompaniesJobs = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'companies' | 'jd-analyzer'
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Job Form State
  const [newJob, setNewJob] = useState({
    companyId: '',
    title: '',
    location: 'Bengaluru / Hyderabad, India',
    package: '18.0 LPA',
    type: 'Full-Time',
    minimumCGPA: 7.0,
    maximumActiveBacklogs: 0,
    graduationYear: 2026,
    eligibleBranches: [
      'Computer Science and Engineering',
      'Information Technology',
    ],
    requiredSkills: 'Data Structures, Algorithms, Python, REST APIs',
    preferredSkills: 'Docker, AWS, Microservices',
    applicationDeadline: '2026-12-20',
    description: '',
    rounds: 'Online Assessment, Technical Round 1, System Design, HR Discussion',
  });

  // New Company Form State
  const [newCompany, setNewCompany] = useState({
    name: '',
    tier: 'Tier 1 (Dream)',
    industry: 'Technology / Cloud / Software',
    website: 'https://',
    contactPerson: '',
    contactEmail: '',
    description: '',
  });

  // JD Analyzer State
  const [rawJDText, setRawJDText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedResult, setAnalyzedResult] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  // Check URL query parameters for quick actions
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get('action');
    if (action === 'new-job') {
      setActiveTab('jobs');
      setShowAddJobModal(true);
    } else if (action === 'new-company') {
      setActiveTab('companies');
      setShowAddCompanyModal(true);
    }
  }, [location.search]);

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const [compRes, jobsRes] = await Promise.all([
        companyService.getCompanies({ status: 'all' }),
        jobService.getJobs({ status: 'all' }),
      ]);

      if (compRes.success) {
        setCompanies(compRes.data || []);
        if (compRes.data && compRes.data.length > 0 && !newJob.companyId) {
          setNewJob((prev) => ({ ...prev, companyId: compRes.data[0]._id }));
        }
      }
      if (jobsRes.success) {
        setJobs(jobsRes.data || []);
      }
    } catch (err) {
      console.error('Error fetching companies & jobs:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to load corporate directory.');
    } finally {
      setLoading(false);
    }
  };

  const branchesList = [
    'Computer Science and Engineering',
    'Information Technology',
    'Electronics and Communication',
    'Electrical and Electronics',
    'Mechanical Engineering',
    'Data Science & AI',
  ];

  const handleBranchToggle = (branch) => {
    setNewJob((prev) => {
      const exists = prev.eligibleBranches.includes(branch);
      if (exists) {
        return { ...prev, eligibleBranches: prev.eligibleBranches.filter((b) => b !== branch) };
      } else {
        return { ...prev, eligibleBranches: [...prev.eligibleBranches, branch] };
      }
    });
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!newJob.title || !newJob.companyId) return;

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const payload = {
        companyId: newJob.companyId,
        title: newJob.title.trim(),
        location: newJob.location.trim(),
        package: newJob.package.trim(),
        type: newJob.type,
        minimumCGPA: parseFloat(newJob.minimumCGPA) || 6.0,
        maximumActiveBacklogs: parseInt(newJob.maximumActiveBacklogs) || 0,
        graduationYear: parseInt(newJob.graduationYear) || 2026,
        eligibleBranches:
          newJob.eligibleBranches.length > 0
            ? newJob.eligibleBranches
            : ['Computer Science and Engineering'],
        requiredSkills: newJob.requiredSkills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        preferredSkills: newJob.preferredSkills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        applicationDeadline: new Date(newJob.applicationDeadline).toISOString(),
        description:
          newJob.description || `Exciting engineering recruitment opening for batch 2026.`,
        rounds: newJob.rounds
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        status: 'Open',
      };

      const res = await jobService.createJob(payload);
      if (res.success) {
        setShowAddJobModal(false);
        setToastMessage(`Job opening "${res.data.title}" created & announced successfully!`);
        await loadData();
        setTimeout(() => setToastMessage(''), 4500);

        setNewJob({
          companyId: companies[0]?._id || '',
          title: '',
          location: 'Bengaluru / Hyderabad, India',
          package: '18.0 LPA',
          type: 'Full-Time',
          minimumCGPA: 7.0,
          maximumActiveBacklogs: 0,
          graduationYear: 2026,
          eligibleBranches: ['Computer Science and Engineering', 'Information Technology'],
          requiredSkills: 'Data Structures, Algorithms, Python, REST APIs',
          preferredSkills: 'Docker, AWS, Microservices',
          applicationDeadline: '2026-12-20',
          description: '',
          rounds: 'Online Assessment, Technical Round 1, System Design, HR Discussion',
        });
      }
    } catch (err) {
      console.error('Job creation error:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to create job opening.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    if (!newCompany.name.trim()) return;

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const res = await companyService.createCompany({
        name: newCompany.name.trim(),
        tier: newCompany.tier,
        industry: newCompany.industry.trim(),
        website: newCompany.website.trim(),
        contactPerson: newCompany.contactPerson.trim(),
        contactEmail: newCompany.contactEmail.trim(),
        description: newCompany.description.trim(),
        status: 'Active',
      });

      if (res.success) {
        setShowAddCompanyModal(false);
        setToastMessage(`Company "${res.data.name}" added to recruiting partners successfully!`);
        await loadData();
        setTimeout(() => setToastMessage(''), 4500);

        setNewCompany({
          name: '',
          tier: 'Tier 1 (Dream)',
          industry: 'Technology / Cloud / Software',
          website: 'https://',
          contactPerson: '',
          contactEmail: '',
          description: '',
        });
      }
    } catch (err) {
      console.error('Company creation error:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to create recruiting company.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleJobStatus = async (job) => {
    const newStatus = job.status === 'Open' ? 'Closed' : 'Open';
    try {
      const res = await jobService.updateJobStatus(job._id, newStatus);
      if (res.success) {
        setToastMessage(`Job status updated to ${newStatus}.`);
        await loadData();
        setTimeout(() => setToastMessage(''), 3500);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.response?.data?.message || 'Status update failed.');
    }
  };

  const handleDeleteCompany = async (company) => {
    if (!window.confirm(`Are you sure you want to remove or deactivate ${company.name}?`)) return;
    try {
      const res = await companyService.deleteCompany(company._id);
      if (res.success) {
        setToastMessage(res.message);
        await loadData();
        setTimeout(() => setToastMessage(''), 3500);
      }
    } catch (err) {
      console.error('Error deleting company:', err);
      alert(err.response?.data?.message || 'Delete failed.');
    }
  };

  const sampleJD = `Infosys is hiring Specialist Programmers (Power Programmers) for 2026 Batch Graduates!
Role: Specialist Programmer
Eligible Streams: B.Tech in CSE, IT, ECE, EEE, Mechanical.
Minimum CGPA: 6.5 with at most 1 active backlog allowed.
Package: 9.5 LPA
Key Responsibilities: Design and develop high-throughput microservices, optimize distributed algorithms, and build enterprise cloud systems.
Required Skills: Strong problem solving in Java or Python, Data Structures & Algorithms, Database Management, and Object-Oriented Design.
Preferred Skills: Spring Boot, Docker, React, AWS.`;

  const handleAnalyzeJD = async () => {
    if (!rawJDText.trim()) return;
    setIsAnalyzing(true);
    setErrorMessage('');

    try {
      const res = await agentService.analyzeJD(rawJDText);
      if (res.success && res.data) {
        setAnalyzedResult(res.data);
      } else {
        alert(res.message || 'Failed to extract specifications from JD.');
      }
    } catch (err) {
      console.error('JD analysis error:', err);
      alert(err.response?.data?.message || 'Error occurred while analyzing Job Description.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePublishAnalyzedJob = async () => {
    if (!analyzedResult) return;
    try {
      setIsSubmitting(true);
      // Find matching company or auto-create it
      let targetCompany = companies.find(
        (c) => c.name.toLowerCase() === (analyzedResult.companyName || '').toLowerCase()
      );

      if (!targetCompany) {
        try {
          // Try to create the company
          const compRes = await companyService.createCompany({
            name: analyzedResult.companyName || 'Corporate Partner',
            tier: 'Tier 1 (Dream)',
            industry: 'Software / Technology',
            website: '',
            contactPerson: 'Campus Hiring Team',
            contactEmail: `campus@${(analyzedResult.companyName || 'company').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
            description: `Recruitment partner for ${analyzedResult.title || 'software engineering'}.`,
            status: 'Active',
          });
          if (compRes.success && compRes.data) {
            targetCompany = compRes.data;
            setCompanies((prev) => [compRes.data, ...prev]);
          }
        } catch (compErr) {
          // Company might already exist in DB or returned status 400/409
          const freshRes = await companyService.getCompanies();
          const freshList = freshRes?.data || [];
          targetCompany = freshList.find(
            (c) => c.name.toLowerCase() === (analyzedResult.companyName || '').toLowerCase()
          );
          if (targetCompany) {
            setCompanies(freshList); // sync local state
          } else {
            console.error('Company creation error:', compErr);
            throw new Error(`Failed to create or link company '${analyzedResult.companyName}': ${compErr.response?.data?.message || compErr.message}`);
          }
        }
      }

      if (!targetCompany) {
        throw new Error(`Could not find or register company '${analyzedResult.companyName}'. Please verify the company name.`);
      }

      const res = await jobService.createJob({
        companyId: targetCompany?._id,
        title: analyzedResult.title,
        description: analyzedResult.description,
        location: analyzedResult.location || 'Onsite / Hybrid',
        package: analyzedResult.package,
        type: 'Full-Time',
        minimumCGPA: analyzedResult.minimumCGPA,
        maximumActiveBacklogs: analyzedResult.maximumActiveBacklogs,
        eligibleBranches: analyzedResult.eligibleBranches,
        graduationYear: analyzedResult.graduationYear || 2026,
        requiredSkills: analyzedResult.requiredSkills,
        preferredSkills: analyzedResult.preferredSkills || [],
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        rounds: analyzedResult.rounds || ['Online Assessment', 'Technical Round 1', 'HR Discussion'],
        status: 'Open',
      });

      if (res.success) {
        setToastMessage(`Job "${res.data.title}" at ${targetCompany?.name} published successfully via AI JD Analyzer!`);
        setAnalyzedResult(null);
        setRawJDText('');
        setActiveTab('jobs');
        await loadData();
        setTimeout(() => setToastMessage(''), 4000);
      }
    } catch (err) {
      console.error('Error publishing analyzed job:', err);
      alert(err.response?.data?.message || 'Publishing analyzed job failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCompanies = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-teal" />
        <p className="text-xs font-semibold text-brand-secondary">
          Loading company directory and recruitment drives from database...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Header with Quick Action Buttons */}
      <GlassCard padding="md" className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-brand-navy dark:text-slate-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-teal" />
            <span>Recruiter & Job Openings Management</span>
          </h1>
          <p className="text-xs text-brand-secondary dark:text-slate-400 mt-1">
            Create companies, publish job openings, and extract structured criteria using AI
          </p>
        </div>

        {/* Primary Action Buttons: Add Job & Add Company */}
        <div className="flex flex-wrap items-center gap-2">
          <GradientButton icon={Plus} size="sm" onClick={() => setShowAddJobModal(true)}>
            + Add Job Opening
          </GradientButton>

          <GradientButton
            variant="secondary"
            icon={Building2}
            size="sm"
            onClick={() => setShowAddCompanyModal(true)}
          >
            + Add Company
          </GradientButton>
        </div>
      </GlassCard>

      {/* Tab Navigation Switches */}
      <div className="flex items-center gap-1.5 p-1 bg-white/60 dark:bg-slate-800/60 rounded-control border border-slate-200/80 dark:border-white/10 text-xs w-fit">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-3.5 py-1.5 rounded-control font-semibold transition-all ${
            activeTab === 'jobs'
              ? 'bg-gradient-primary text-white shadow-button'
              : 'text-brand-secondary dark:text-slate-300'
          }`}
        >
          Job Drives ({jobs.length})
        </button>
        <button
          onClick={() => setActiveTab('companies')}
          className={`px-3.5 py-1.5 rounded-control font-semibold transition-all ${
            activeTab === 'companies'
              ? 'bg-gradient-primary text-white shadow-button'
              : 'text-brand-secondary dark:text-slate-300'
          }`}
        >
          Partner Recruiters ({companies.length})
        </button>
        <button
          onClick={() => setActiveTab('jd-analyzer')}
          className={`px-3.5 py-1.5 rounded-control font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'jd-analyzer'
              ? 'bg-gradient-primary text-white shadow-button'
              : 'text-brand-secondary dark:text-slate-300'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
          <span>AI JD Analyzer</span>
        </button>
      </div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="p-3.5 rounded-control bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-control bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tab 1: Job Drives */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-brand-secondary dark:text-slate-400" />
              <input
                type="text"
                placeholder="Search jobs by title or recruiter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-control text-xs bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100"
              />
            </div>
            <span className="text-xs font-semibold text-brand-secondary dark:text-slate-400">
              Showing {filteredJobs.length} active and scheduled drives
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredJobs.map((job) => (
              <GlassCard key={job._id} padding="md" hoverEffect className="flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-brand-teal uppercase tracking-wider">
                        {job.companyName}
                      </span>
                      <h3 className="text-base font-bold text-brand-navy dark:text-slate-100 mt-0.5">
                        {job.title}
                      </h3>
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                        Package: {job.package}
                      </p>
                    </div>
                    <StatusBadge status={job.status} size="sm" />
                  </div>

                  <p className="text-xs text-brand-secondary dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="space-y-1 text-[11px] text-brand-secondary dark:text-slate-400 pt-1">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-teal" />
                      <span>{job.location}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-brand-teal" />
                      <span>Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}</span>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-brand-navy dark:text-slate-200">
                      Applicants: <strong>{job.applicantCount || 0}</strong>
                    </span>
                    <span className="text-brand-secondary dark:text-slate-400">
                      Min CGPA: <strong>{job.minimumCGPA}</strong>
                    </span>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleJobStatus(job)}
                    className="text-xs font-bold text-brand-teal dark:text-brand-cyan hover:underline"
                  >
                    {job.status === 'Open' ? 'Close Drive' : 'Publish / Reopen'}
                  </button>
                  <span className="text-[11px] text-brand-secondary">
                    Batch: {job.graduationYear}
                  </span>
                </div>
              </GlassCard>
            ))}
            {filteredJobs.length === 0 && (
              <div className="col-span-3 text-center py-12 text-sm text-brand-secondary">
                No jobs match your search query.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Partner Recruiters */}
      {activeTab === 'companies' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-brand-secondary dark:text-slate-400" />
              <input
                type="text"
                placeholder="Search corporate recruiters by name or sector..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-control text-xs bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100"
              />
            </div>
            <span className="text-xs font-semibold text-brand-secondary dark:text-slate-400">
              Showing {filteredCompanies.length} partner organizations
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCompanies.map((comp) => (
              <GlassCard key={comp._id} padding="md" hoverEffect className="flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-brand-navy dark:text-slate-100">
                        {comp.name}
                      </h3>
                      <p className="text-xs font-semibold text-brand-teal mt-0.5">{comp.tier}</p>
                    </div>
                    <StatusBadge status={comp.status} size="sm" />
                  </div>

                  <p className="text-xs text-brand-secondary dark:text-slate-400">
                    Industry: <strong>{comp.industry}</strong>
                  </p>
                  <p className="text-xs text-brand-secondary dark:text-slate-300 line-clamp-2">
                    {comp.description || 'Verified campus placement recruiter.'}
                  </p>

                  <div className="pt-2 text-[11px] text-brand-secondary dark:text-slate-400 space-y-0.5">
                    {comp.contactPerson && <p>Contact: {comp.contactPerson}</p>}
                    {comp.contactEmail && <p>Email: {comp.contactEmail}</p>}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  {comp.website ? (
                    <a
                      href={comp.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-brand-teal hover:underline"
                    >
                      <span>Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">No URL</span>
                  )}

                  <button
                    onClick={() => handleDeleteCompany(comp)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                    title="Remove or deactivate"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: AI JD Analyzer */}
      {activeTab === 'jd-analyzer' && (
        <div className="space-y-6">
          <GlassCard padding="lg" className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-brand-navy dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-teal" />
                <span>AI Job Description Parser & Criteria Extractor</span>
              </h3>
              <p className="text-xs text-brand-secondary dark:text-slate-400 mt-1">
                Paste any unstructured job posting text or PDF draft. The agent parses eligibility
                benchmarks, skills, rounds, and draft details.
              </p>
            </div>

            <textarea
              rows={8}
              placeholder="Paste raw corporate recruitment description text here..."
              value={rawJDText}
              onChange={(e) => setRawJDText(e.target.value)}
              className="w-full p-3.5 rounded-control text-xs font-mono bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-teal/40 leading-relaxed"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (!rawJDText.trim() || window.confirm('Replace your current text with the Infosys sample JD?')) {
                    setRawJDText(sampleJD);
                  }
                }}
                className="text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-brand-teal dark:hover:text-brand-cyan hover:underline transition-colors"
              >
                Load sample JD (demo only)
              </button>

              <GradientButton
                icon={Sparkles}
                disabled={isAnalyzing || !rawJDText.trim()}
                onClick={handleAnalyzeJD}
                size="md"
              >
                {isAnalyzing ? 'Extracting with Groq...' : 'Analyze JD with AI'}
              </GradientButton>
            </div>
          </GlassCard>

          {analyzedResult && (
            <GlassCard padding="lg" className="border-brand-teal/50 shadow-soft space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-brand-teal uppercase">
                      Extracted Specification
                    </span>
                    {analyzedResult.extractionEngine && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-teal/15 text-brand-teal border border-brand-teal/30">
                        {analyzedResult.extractionEngine}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-brand-navy dark:text-slate-100 mt-0.5">
                    {analyzedResult.companyName} — {analyzedResult.title}
                  </h3>
                  {analyzedResult.location && (
                    <p className="text-xs text-brand-secondary dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-teal" />
                      <span>{analyzedResult.location}</span>
                    </p>
                  )}
                </div>
                <GradientButton icon={CheckCircle2} size="sm" onClick={handlePublishAnalyzedJob}>
                  Publish Live Job Opening
                </GradientButton>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-control bg-slate-50 dark:bg-slate-800/60 space-y-1">
                  <p className="font-semibold text-brand-secondary dark:text-slate-400">Package / CTC</p>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {analyzedResult.package}
                  </p>
                </div>
                <div className="p-3 rounded-control bg-slate-50 dark:bg-slate-800/60 space-y-1">
                  <p className="font-semibold text-brand-secondary dark:text-slate-400">Min CGPA Required</p>
                  <p className="text-sm font-bold text-brand-navy dark:text-slate-100">
                    {analyzedResult.minimumCGPA}
                  </p>
                </div>
                <div className="p-3 rounded-control bg-slate-50 dark:bg-slate-800/60 space-y-1">
                  <p className="font-semibold text-brand-secondary dark:text-slate-400">Max Backlogs Allowed</p>
                  <p className="text-sm font-bold text-brand-navy dark:text-slate-100">
                    {analyzedResult.maximumActiveBacklogs}
                  </p>
                </div>
              </div>

              {/* Eligible Branches */}
              {analyzedResult.eligibleBranches && analyzedResult.eligibleBranches.length > 0 && (
                <div className="text-xs space-y-1.5">
                  <p className="font-bold text-brand-navy dark:text-slate-200">Eligible Streams / Branches:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {analyzedResult.eligibleBranches.map((b) => (
                      <span
                        key={b}
                        className="px-2.5 py-0.5 rounded-control text-[11px] font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Required & Preferred Skills */}
              <div className="text-xs space-y-2">
                <p className="font-bold text-brand-navy dark:text-slate-200">Required Competencies:</p>
                <div className="flex flex-wrap gap-1.5">
                  {analyzedResult.requiredSkills && analyzedResult.requiredSkills.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-control text-xs font-medium bg-brand-teal/10 text-brand-teal dark:text-brand-cyan border border-brand-teal/20"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {analyzedResult.preferredSkills && analyzedResult.preferredSkills.length > 0 && (
                <div className="text-xs space-y-1.5">
                  <p className="font-bold text-brand-navy dark:text-slate-200">Preferred / Desirable Skills:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {analyzedResult.preferredSkills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-control text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Selection Process */}
              {analyzedResult.rounds && analyzedResult.rounds.length > 0 && (
                <div className="text-xs space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <p className="font-bold text-brand-navy dark:text-slate-200">Selection Process:</p>
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-brand-secondary dark:text-slate-300">
                    {analyzedResult.rounds.map((round, idx) => (
                      <React.Fragment key={idx}>
                        <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-semibold">
                          {idx + 1}. {round}
                        </span>
                        {idx < analyzedResult.rounds.length - 1 && <span className="text-slate-400">→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </GlassCard>
          )}
        </div>
      )}

      {/* Modal 1: Add Job Opening */}
      {showAddJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <GlassCard padding="lg" className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-control bg-brand-teal/10 text-brand-teal">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-navy dark:text-slate-100">
                    Create New Job Opening
                  </h3>
                  <p className="text-xs text-brand-secondary dark:text-slate-400">
                    Publish placement drive with deterministic academic criteria
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddJobModal(false)}
                className="text-slate-400 hover:text-brand-navy dark:hover:text-slate-200 p-1 rounded-control text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-brand-navy dark:text-slate-200">
                    Recruiting Company *
                  </label>
                  <select
                    value={newJob.companyId}
                    onChange={(e) => setNewJob({ ...newJob, companyId: e.target.value })}
                    className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100 font-semibold"
                  >
                    {companies.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.tier})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-brand-navy dark:text-slate-200">
                    Job Title / Role *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Software Development Engineer"
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                    className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-teal/40 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-brand-navy dark:text-slate-200">
                    Package (CTC) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 18.5 LPA"
                    value={newJob.package}
                    onChange={(e) => setNewJob({ ...newJob, package: e.target.value })}
                    className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100 font-bold text-emerald-600 dark:text-emerald-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-brand-navy dark:text-slate-200">
                    Role Type
                  </label>
                  <select
                    value={newJob.type}
                    onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
                    className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Internship">Internship</option>
                    <option value="Full-Time + Internship">Full-Time + Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-brand-navy dark:text-slate-200">
                    Work Location
                  </label>
                  <input
                    type="text"
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-brand-navy dark:text-slate-200">
                    Minimum CGPA (0-10) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={newJob.minimumCGPA}
                    onChange={(e) =>
                      setNewJob({ ...newJob, minimumCGPA: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100 font-bold text-brand-teal"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-brand-navy dark:text-slate-200">
                    Max Active Backlogs *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newJob.maximumActiveBacklogs}
                    onChange={(e) =>
                      setNewJob({ ...newJob, maximumActiveBacklogs: parseInt(e.target.value) || 0 })
                    }
                    className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-brand-navy dark:text-slate-200">
                    Graduation Batch *
                  </label>
                  <input
                    type="number"
                    value={newJob.graduationYear}
                    onChange={(e) =>
                      setNewJob({ ...newJob, graduationYear: parseInt(e.target.value) || 2026 })
                    }
                    className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1.5 text-brand-navy dark:text-slate-200">
                  Eligible Academic Branches *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {branchesList.map((branch) => {
                    const isChecked = newJob.eligibleBranches.includes(branch);
                    return (
                      <label
                        key={branch}
                        className={`flex items-center gap-2 p-2 rounded-control border text-[11px] cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-brand-teal/10 border-brand-teal text-brand-teal dark:text-brand-cyan font-semibold'
                            : 'bg-white/50 dark:bg-slate-800/50 border-slate-200/80 dark:border-white/10 text-brand-secondary dark:text-slate-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleBranchToggle(branch)}
                          className="rounded text-brand-teal focus:ring-brand-teal"
                        />
                        <span>{branch}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-brand-navy dark:text-slate-200">
                    Required Technical Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newJob.requiredSkills}
                    onChange={(e) => setNewJob({ ...newJob, requiredSkills: e.target.value })}
                    className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-brand-navy dark:text-slate-200">
                    Application Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={newJob.applicationDeadline}
                    onChange={(e) => setNewJob({ ...newJob, applicationDeadline: e.target.value })}
                    className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-brand-navy dark:text-slate-200">
                  Selection Rounds (comma separated)
                </label>
                <input
                  type="text"
                  value={newJob.rounds}
                  onChange={(e) => setNewJob({ ...newJob, rounds: e.target.value })}
                  className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-brand-navy dark:text-slate-200">
                  Job Description & Roles
                </label>
                <textarea
                  rows={3}
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  placeholder="Outline core responsibilities, key deliverables, and team context..."
                  className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddJobModal(false)}
                  className="px-4 py-2 rounded-control text-xs font-semibold text-brand-secondary hover:text-brand-navy"
                >
                  Cancel
                </button>
                <GradientButton type="submit" size="md" disabled={isSubmitting}>
                  {isSubmitting ? 'Publishing...' : 'Publish Job Opening'}
                </GradientButton>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Modal 2: Add Company */}
      {showAddCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <GlassCard padding="lg" className="w-full max-w-lg shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-control bg-brand-turquoise/10 text-brand-turquoise">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-navy dark:text-slate-100">
                    Add Partner Recruiter
                  </h3>
                  <p className="text-xs text-brand-secondary dark:text-slate-400">
                    Onboard corporate organization to the placement portal
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCompanyModal(false)}
                className="text-slate-400 hover:text-brand-navy dark:hover:text-slate-200 p-1 rounded-control text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCompany} className="space-y-3.5 pt-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-brand-navy dark:text-slate-200">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cisco Systems, Atlassian, Adobe"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-teal/40 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-brand-navy dark:text-slate-200">
                    Recruitment Tier
                  </label>
                  <select
                    value={newCompany.tier}
                    onChange={(e) => setNewCompany({ ...newCompany, tier: e.target.value })}
                    className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100 font-semibold"
                  >
                    <option value="Tier 1 (Dream)">Tier 1 (Dream &gt; 15 LPA)</option>
                    <option value="Tier 2 (High Core)">Tier 2 (High Core 8 - 15 LPA)</option>
                    <option value="Core Recruiter">Core Recruiter (4 - 8 LPA)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-brand-navy dark:text-slate-200">
                    Industry Sector
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cybersecurity / Networking"
                    value={newCompany.industry}
                    onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
                    className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-brand-navy dark:text-slate-200">
                    Corporate Careers Website
                  </label>
                  <input
                    type="url"
                    placeholder="https://cisco.com/careers"
                    value={newCompany.website}
                    onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                    className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-brand-navy dark:text-slate-200">
                    Talent Lead Contact Person
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sandeep Varma"
                    value={newCompany.contactPerson}
                    onChange={(e) => setNewCompany({ ...newCompany, contactPerson: e.target.value })}
                    className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-brand-navy dark:text-slate-200">
                  Campus Recruitment Email
                </label>
                <input
                  type="email"
                  placeholder="campus-hiring@cisco.com"
                  value={newCompany.contactEmail}
                  onChange={(e) => setNewCompany({ ...newCompany, contactEmail: e.target.value })}
                  className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-brand-navy dark:text-slate-200">
                  Company Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Overview of company operations, technology stack, and placement background..."
                  value={newCompany.description}
                  onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
                  className="w-full p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCompanyModal(false)}
                  className="px-4 py-2 rounded-control text-xs font-semibold text-brand-secondary hover:text-brand-navy"
                >
                  Cancel
                </button>
                <GradientButton type="submit" size="md" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Recruiter'}
                </GradientButton>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default CompaniesJobs;
