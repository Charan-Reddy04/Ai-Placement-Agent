import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Eye,
  FileText,
  Award,
  ChevronRight,
  ExternalLink,
  Github,
  Mail,
  GraduationCap,
  Loader2,
  AlertCircle,
  Sparkles,
  Zap,
  BrainCircuit,
} from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';
import StatusBadge from '../../components/StatusBadge';
import studentService from '../../services/studentService';
import jobService from '../../services/jobService';
import applicationService from '../../services/applicationService';
import api from '../../services/api';

export const Candidates = () => {
  const [students, setStudents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('All');
  const [selectedStudentForDrawer, setSelectedStudentForDrawer] = useState(null);
  const [shortlistedIds, setShortlistedIds] = useState([]);
  const [shortlistActionMsg, setShortlistActionMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Real LLM AI Skill Matching state
  const [aiMatchesMap, setAiMatchesMap] = useState({});
  const [isAiMatching, setIsAiMatching] = useState(false);
  const [aiMatchActive, setAiMatchActive] = useState(false);
  const [drawerAiLoading, setDrawerAiLoading] = useState(false);

  useEffect(() => {
    loadCandidatesAndJobs();
  }, []);

  const loadCandidatesAndJobs = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const [studentsRes, jobsRes, appsRes] = await Promise.all([
        studentService.getAllStudents(),
        jobService.getJobs({ status: 'all' }),
        applicationService.getApplications(),
      ]);

      if (studentsRes.success) {
        setStudents(studentsRes.data || []);
      }

      if (jobsRes.success && jobsRes.data && jobsRes.data.length > 0) {
        setJobs(jobsRes.data);
        setSelectedJob(jobsRes.data[0]);
      }

      if (appsRes.success && appsRes.data) {
        // Collect shortlisted student IDs from real applications
        const shortlisted = appsRes.data
          .filter((a) => a.status === 'Shortlisted' || a.status === 'Interview Scheduled')
          .map((a) => a.studentId?._id);
        setShortlistedIds(shortlisted.filter(Boolean));
      }
    } catch (err) {
      console.error('Error loading candidates directory:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to load candidates directory.');
    } finally {
      setLoading(false);
    }
  };

  // Helper: Normalize string for flexible branch comparison
  const normalizeStr = (str) =>
    (str || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');

  // Real LLM AI Skill Matcher handler
  const handleRunAiSkillMatch = async (specificStudentId = null) => {
    if (!selectedJob) return;
    try {
      if (specificStudentId) {
        setDrawerAiLoading(true);
      } else {
        setIsAiMatching(true);
      }
      setErrorMessage('');

      const payload = {
        jobId: selectedJob._id,
      };

      if (specificStudentId) {
        payload.studentId = specificStudentId;
      } else {
        payload.candidates = students;
      }

      const res = await api.post('/agent/ai-skill-match', payload);
      if (res.data && res.data.success) {
        setAiMatchesMap((prev) => {
          const updated = { ...prev };
          (res.data.matches || []).forEach((m) => {
            updated[m.candidateId] = m;
          });
          return updated;
        });
        setAiMatchActive(true);
        setShortlistActionMsg(
          specificStudentId
            ? '✓ Real LLM evaluated candidate technical competencies and projects!'
            : `✓ Real LLM successfully evaluated ${res.data.matches?.length || 0} candidates with semantic reasoning!`
        );
        setTimeout(() => setShortlistActionMsg(''), 5000);
      } else {
        setErrorMessage(res.data?.message || 'AI matching did not return results.');
      }
    } catch (err) {
      console.error('AI matching error:', err);
      setErrorMessage(
        err.response?.data?.message || 'Failed to perform Real LLM matching. Ensure GROQ_API_KEY is configured.'
      );
    } finally {
      setIsAiMatching(false);
      setDrawerAiLoading(false);
    }
  };

  // Two clean, unambiguous evaluation gates:
  // Gate 1: Academic Eligibility (CGPA, Backlogs, Branch) -> Deterministic
  // Gate 2: Skill Competency -> Real LLM Semantic Analysis (Groq)
  const calculateCandidateMatch = (student, job) => {
    if (!job) {
      return {
        matchScore: null,
        matchedSkills: [],
        missingSkills: [],
        academicEligible: true,
        skillFitLevel: 'Select Job Drive',
        skillBadgeColor: 'slate',
        isEligible: true,
        explanation: 'No specific drive selected.',
        isAiPowered: false,
      };
    }

    const sNorm = normalizeStr(student.branch);
    const isBranchAllowed =
      !job.eligibleBranches ||
      job.eligibleBranches.length === 0 ||
      job.eligibleBranches.some((b) => {
        const bNorm = normalizeStr(b);
        return (
          bNorm === 'all' ||
          bNorm === sNorm ||
          sNorm.includes(bNorm) ||
          bNorm.includes(sNorm) ||
          (bNorm === 'cse' && sNorm.includes('computerscience')) ||
          (sNorm === 'cse' && bNorm.includes('computerscience'))
        );
      });

    const academicEligible =
      student.cgpa >= job.minimumCGPA &&
      student.activeBacklogs <= job.maximumActiveBacklogs &&
      isBranchAllowed;

    // Check if Real LLM evaluation exists for this candidate
    const studentIdStr = student._id?.toString() || student.id;
    const aiEval = aiMatchesMap[studentIdStr];

    if (aiEval) {
      return {
        matchScore: aiEval.skillMatchScore,
        matchedSkills: aiEval.matchedSkills || [],
        missingSkills: aiEval.missingSkills || [],
        academicEligible,
        skillFitLevel: aiEval.skillFitLevel,
        skillBadgeColor: aiEval.skillBadgeColor || 'emerald',
        isEligible: academicEligible,
        explanation: aiEval.aiSummary,
        aiEvaluation: aiEval,
        isAiPowered: true,
      };
    }

    // Clean, unambiguous status awaiting Real LLM evaluation
    return {
      matchScore: null,
      matchedSkills: [],
      missingSkills: job.requiredSkills || [],
      academicEligible,
      skillFitLevel: 'Awaiting AI Evaluation',
      skillBadgeColor: 'slate',
      isEligible: academicEligible,
      explanation: academicEligible
        ? `Academic Gate: PASS (CGPA ${student.cgpa} >= ${job.minimumCGPA}, ${student.activeBacklogs} backlogs). Skill Gate: Ready for Real LLM evaluation.`
        : `Academic Gate: CRITERIA NOT MET (${
            student.activeBacklogs > job.maximumActiveBacklogs
              ? `Backlogs (${student.activeBacklogs}) exceed max allowed (${job.maximumActiveBacklogs})`
              : `CGPA (${student.cgpa}) below cutoff (${job.minimumCGPA})`
          }).`,
      isAiPowered: false,
    };
  };

  const handleToggleShortlist = (id) => {
    if (shortlistedIds.includes(id)) {
      setShortlistedIds(shortlistedIds.filter((sId) => sId !== id));
      setShortlistActionMsg('Candidate removed from active shortlist proposal.');
    } else {
      setShortlistedIds([...shortlistedIds, id]);
      setShortlistActionMsg('Candidate approved and added to active shortlist proposal.');
    }
    setTimeout(() => setShortlistActionMsg(''), 3000);
  };

  const filteredStudents = students.filter((s) => {
    const studentName = s.userId?.name || s.name || '';
    const studentRoll = s.rollNumber || '';
    const studentSkills = s.skills || [];

    const matchesSearch =
      studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      studentRoll.toLowerCase().includes(searchQuery.toLowerCase()) ||
      studentSkills.some((sk) => sk.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesBranch =
      branchFilter === 'All' || s.branch.toLowerCase().includes(branchFilter.toLowerCase());

    return matchesSearch && matchesBranch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-teal" />
        <p className="text-xs font-semibold text-brand-secondary">
          Loading student candidate pool and scoring matrix...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Header */}
      <GlassCard padding="md" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-brand-navy dark:text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-teal" />
            <span>Student Candidates & Shortlist Approvals</span>
          </h1>
          <p className="text-xs text-brand-secondary dark:text-slate-400 mt-1">
            Directory of registered students with explainable candidate match scoring and human-in-the-loop shortlisting
          </p>
        </div>

        {/* Selected target job for candidate scoring */}
        {jobs.length > 0 && selectedJob && (
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-brand-secondary dark:text-slate-300 shrink-0">
                Rank for Drive:
              </span>
              <select
                value={selectedJob._id}
                onChange={(e) => {
                  const j = jobs.find((job) => job._id === e.target.value);
                  if (j) setSelectedJob(j);
                }}
                className="px-3 py-1.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
              >
                {jobs.map((j) => (
                  <option key={j._id} value={j._id}>
                    {j.companyName} — {j.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Real LLM AI Skill Matcher Button */}
            <button
              onClick={() => handleRunAiSkillMatch()}
              disabled={isAiMatching || !selectedJob}
              title="Evaluate all candidates against required skills and projects using Real LLM"
              className={`px-3.5 py-1.5 rounded-control text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                aiMatchActive
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                  : 'bg-brand-teal hover:bg-brand-teal/90 text-white shadow-brand-teal/20'
              }`}
            >
              {isAiMatching ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Real LLM Analyzing Candidates...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{aiMatchActive ? '✓ Re-Run Real LLM Evaluation' : '⚡ Run Real LLM Skill Evaluation'}</span>
                </>
              )}
            </button>
          </div>
        )}
      </GlassCard>

      {errorMessage && (
        <div className="p-3 rounded-control bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {shortlistActionMsg && (
        <div className="p-3 rounded-control bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{shortlistActionMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-brand-secondary" />
          <input
            type="text"
            placeholder="Search by student name, roll number, or skill (e.g. Python, Docker, C++)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-control text-xs sm:text-sm bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-secondary hidden sm:block" />
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-control text-xs sm:text-sm bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10"
          >
            <option value="All">All Branches</option>
            <option value="Computer Science">Computer Science (CSE)</option>
            <option value="Information Technology">Information Tech (IT)</option>
            <option value="Electronics">Electronics (ECE)</option>
          </select>
        </div>
      </div>

      {/* Candidates Table */}
      <GlassCard padding="md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-brand-navy dark:text-slate-100">
            Ranked Candidate Pool {selectedJob ? `for ${selectedJob.companyName}` : ''}
          </h3>
          <span className="text-xs font-semibold text-brand-teal">
            {shortlistedIds.length} Candidates Approved for Shortlist
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 text-brand-secondary dark:text-slate-400">
                <th className="pb-3 font-semibold">Shortlist</th>
                <th className="pb-3 font-semibold">Student Name & Roll</th>
                <th className="pb-3 font-semibold">Academics (CGPA / Backlogs)</th>
                <th className="pb-3 font-semibold">Academic Gate</th>
                <th className="pb-3 font-semibold">Real LLM Skill Fit</th>
                <th className="pb-3 font-semibold">AI Match Score</th>
                <th className="pb-3 font-semibold text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.map((student) => {
                const scoring = calculateCandidateMatch(student, selectedJob);
                const isShortlisted = shortlistedIds.includes(student._id);

                return (
                  <tr key={student._id} className="hover:bg-brand-teal/5 transition-colors">
                    <td className="py-3.5 pr-2">
                      <input
                        type="checkbox"
                        checked={isShortlisted}
                        onChange={() => handleToggleShortlist(student._id)}
                        className="w-4 h-4 rounded text-brand-teal focus:ring-brand-teal cursor-pointer"
                      />
                    </td>
                    <td className="py-3.5 pr-3">
                      <div className="font-bold text-brand-navy dark:text-slate-100">
                        {student.userId?.name || student.name || 'Candidate'}
                      </div>
                      <div className="text-[10px] text-brand-secondary dark:text-slate-400">
                        {student.rollNumber} • {student.branch.split(' ')[0]}
                      </div>
                    </td>
                    <td className="py-3.5 pr-3">
                      <div className="font-semibold text-brand-teal">CGPA: {student.cgpa}</div>
                      <div className="text-[10px] text-brand-secondary dark:text-slate-400">
                        Active Backlogs: {student.activeBacklogs}
                      </div>
                    </td>
                    {/* Gate 1: Academic Eligibility Badge */}
                    <td className="py-3.5 pr-3">
                      {scoring.academicEligible ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          Academic Pass
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 whitespace-nowrap">
                          <AlertCircle className="w-3 h-3 text-rose-500" />
                          Below Cutoff
                        </span>
                      )}
                    </td>
                    {/* Gate 2: Real LLM Skill Competency Badge */}
                    <td className="py-3.5 pr-3">
                      {scoring.isAiPowered && (
                        <div className="flex items-center gap-1 mb-1">
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase tracking-widest">
                            <Sparkles className="w-2.5 h-2.5" /> Real LLM
                          </span>
                        </div>
                      )}
                      {scoring.skillBadgeColor === 'emerald' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                          ✓ {scoring.skillFitLevel}
                        </span>
                      )}
                      {scoring.skillBadgeColor === 'amber' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 whitespace-nowrap">
                          ⚡ {scoring.skillFitLevel}
                        </span>
                      )}
                      {scoring.skillBadgeColor === 'rose' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 whitespace-nowrap">
                          ⚠️ {scoring.skillFitLevel}
                        </span>
                      )}
                      {scoring.skillBadgeColor === 'slate' && (
                        <button
                          type="button"
                          onClick={() => handleRunAiSkillMatch(student._id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal dark:text-brand-cyan border border-brand-teal/20 whitespace-nowrap cursor-pointer transition-all"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Evaluate with AI</span>
                        </button>
                      )}
                    </td>
                    <td className="py-3.5 pr-3">
                      {scoring.matchScore !== null ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-brand-navy dark:text-slate-100">
                            {scoring.matchScore}%
                          </span>
                          <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div
                              className="h-full bg-gradient-primary rounded-full"
                              style={{ width: `${scoring.matchScore}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium italic">
                          Awaiting Scan
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => setSelectedStudentForDrawer({ student, scoring })}
                        className="px-2.5 py-1 rounded-control text-xs font-semibold text-brand-teal bg-brand-teal/10 hover:bg-brand-teal/20 transition-all inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-xs text-slate-400 italic">
                    No student candidates match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Candidate Inspector Drawer */}
      {selectedStudentForDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full p-6 overflow-y-auto shadow-2xl space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-brand-teal uppercase">Candidate Dossier</span>
                <h3 className="text-xl font-bold text-brand-navy dark:text-slate-100">
                  {selectedStudentForDrawer.student.userId?.name || selectedStudentForDrawer.student.name}
                </h3>
                <p className="text-xs text-brand-secondary dark:text-slate-400">
                  {selectedStudentForDrawer.student.rollNumber} • {selectedStudentForDrawer.student.branch}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudentForDrawer(null)}
                className="text-slate-400 hover:text-brand-navy dark:hover:text-slate-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-control bg-slate-50 dark:bg-slate-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-brand-navy dark:text-slate-200">AI Placement Match Summary</h4>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-500">Overall Match:</span>
                    <span className="text-brand-teal font-extrabold text-sm">
                      {selectedStudentForDrawer.scoring.matchScore}%
                    </span>
                  </div>
                </div>

                {/* Two Distinct Evaluation Gates */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-control bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gate 1: Academic</span>
                    <div>
                      {selectedStudentForDrawer.scoring.academicEligible ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Academic Pass
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500">
                          <AlertCircle className="w-3.5 h-3.5" /> Below Cutoff
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-control bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gate 2: Skill Fit</span>
                    <div>
                      <span className="text-[11px] font-bold text-brand-navy dark:text-slate-100">
                        {selectedStudentForDrawer.scoring.skillFitLevel}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-brand-secondary dark:text-slate-300 leading-relaxed text-[11px]">
                  {selectedStudentForDrawer.scoring.explanation}
                </p>
              </div>

              {/* Real LLM Skill Intelligence Deep Dive Card */}
              <div className="p-3.5 rounded-control bg-gradient-to-br from-teal-500/10 via-brand-teal/5 to-cyan-500/10 border border-brand-teal/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-brand-teal" />
                    <span className="text-xs font-bold text-brand-navy dark:text-slate-100">
                      Real LLM Semantic Match
                    </span>
                  </div>
                  <button
                    onClick={() => handleRunAiSkillMatch(selectedStudentForDrawer.student._id)}
                    disabled={drawerAiLoading}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-teal/20 hover:bg-brand-teal/30 text-brand-teal dark:text-brand-cyan transition-all flex items-center gap-1 cursor-pointer"
                  >
                    {drawerAiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3 text-amber-500" />}
                    <span>{aiMatchesMap[selectedStudentForDrawer.student._id] ? 'Re-run AI' : 'Run AI Match'}</span>
                  </button>
                </div>

                {aiMatchesMap[selectedStudentForDrawer.student._id] ? (
                  <div className="space-y-2 text-[11px]">
                    <div className="flex items-center justify-between pt-0.5 pb-1 border-b border-brand-teal/20">
                      <span className="text-slate-500 font-medium">Competency Fit Level:</span>
                      <span className="font-extrabold text-brand-teal text-xs">
                        {aiMatchesMap[selectedStudentForDrawer.student._id].skillFitLevel} ({aiMatchesMap[selectedStudentForDrawer.student._id].skillMatchScore}%)
                      </span>
                    </div>

                    <p className="text-brand-secondary dark:text-slate-200 leading-relaxed italic">
                      "{aiMatchesMap[selectedStudentForDrawer.student._id].aiSummary}"
                    </p>

                    {/* Semantic Matches with Project Evidence */}
                    {aiMatchesMap[selectedStudentForDrawer.student._id].matchedSkills?.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                          Verified Competencies & Project Evidence:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {aiMatchesMap[selectedStudentForDrawer.student._id].matchedSkills.map((m, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                            >
                              ✓ {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Identified Gaps */}
                    {aiMatchesMap[selectedStudentForDrawer.student._id].missingSkills?.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">
                          Identified Technical Gaps:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {aiMatchesMap[selectedStudentForDrawer.student._id].missingSkills.map((m, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded text-[10px] font-medium bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20"
                            >
                              ✕ {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Learning Recommendation */}
                    {aiMatchesMap[selectedStudentForDrawer.student._id].learningRecommendation && (
                      <div className="pt-1 text-[11px] text-slate-600 dark:text-slate-300">
                        <span className="font-bold text-brand-teal">Recommendation: </span>
                        {aiMatchesMap[selectedStudentForDrawer.student._id].learningRecommendation}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 py-1">
                    Click <span className="font-semibold text-brand-teal">"Run AI Match"</span> to have the Real LLM evaluate this student's projects and skills against {selectedJob?.companyName}'s requirements.
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-brand-navy dark:text-slate-200 mb-1.5">Technical Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedStudentForDrawer.student.skills?.map((sk) => (
                    <span
                      key={sk}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-brand-teal/10 text-brand-teal dark:text-brand-cyan border border-brand-teal/20"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {selectedStudentForDrawer.student.projects &&
                selectedStudentForDrawer.student.projects.length > 0 && (
                  <div>
                    <h4 className="font-bold text-brand-navy dark:text-slate-200 mb-1.5">
                      Key Technical Projects
                    </h4>
                    <div className="space-y-2">
                      {selectedStudentForDrawer.student.projects.map((p, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-control bg-slate-50 dark:bg-slate-800/50 space-y-1"
                        >
                          <p className="font-semibold text-brand-navy dark:text-slate-100">{p.title}</p>
                          <p className="text-brand-secondary dark:text-slate-300">{p.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {selectedStudentForDrawer.student.resume && selectedStudentForDrawer.student.resume.url && (
                <div className="pt-2">
                  <a
                    href={`http://localhost:5000${selectedStudentForDrawer.student.resume.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 p-2.5 rounded-control text-xs font-semibold bg-brand-teal/10 text-brand-teal hover:bg-brand-teal/20 transition-all"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View Uploaded PDF Resume</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <GradientButton
                size="md"
                className="w-full"
                onClick={() => {
                  handleToggleShortlist(selectedStudentForDrawer.student._id);
                  setSelectedStudentForDrawer(null);
                }}
              >
                {shortlistedIds.includes(selectedStudentForDrawer.student._id)
                  ? 'Remove from Shortlist'
                  : 'Approve for Interview Shortlist'}
              </GradientButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Candidates;
