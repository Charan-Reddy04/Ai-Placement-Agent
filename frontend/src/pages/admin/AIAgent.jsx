import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  Play,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Check,
  ShieldCheck,
  Calendar,
  Users,
  Building2,
  Terminal,
  Loader2,
} from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';
import StatusBadge from '../../components/StatusBadge';
import agentService from '../../services/agentService';

export const AIAgent = () => {
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [chatPrompt, setChatPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionFeedback, setActionFeedback] = useState('');
  const [agentResponseMsg, setAgentResponseMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const samplePrompts = [
    'Shortlist top eligible candidates for Microsoft SDE drive with CGPA > 7.5',
    'Schedule interview slots for shortlisted candidates for tomorrow',
    'Analyze this JD: Cisco hiring Cloud Engineers for 18 LPA with minimum 7.0 CGPA',
    'Broadcast placement reminders to 2026 Batch Graduates',
  ];

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await agentService.getTasks();
      if (res.success && res.data) {
        setTasks(res.data);
        if (res.data.length > 0 && !activeTask) {
          setActiveTask(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load agent tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkflow = async (promptText = chatPrompt) => {
    const textToSend = promptText.trim();
    if (!textToSend) return;

    setIsProcessing(true);
    setActionFeedback('AI Agent initializing task coordination & backend tool orchestration...');
    setAgentResponseMsg('');

    try {
      const res = await agentService.sendAdminMessage(textToSend);
      if (res.success) {
        setAgentResponseMsg(res.message);
        if (res.task) {
          setActiveTask(res.task);
          setTasks((prev) => [res.task, ...prev.filter((t) => t._id !== res.task._id)]);
        }
        setActionFeedback('Workflow coordinated! Proposed actions are waiting for your approval.');
        setChatPrompt('');
      }
    } catch (err) {
      console.error('AI Agent execution error:', err);
      setActionFeedback(err.response?.data?.message || 'Agent failed to coordinate request.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveTask = async () => {
    if (!activeTask) return;
    try {
      setIsProcessing(true);
      const res = await agentService.approveTask(activeTask._id);
      if (res.success) {
        setActiveTask(res.task);
        setTasks((prev) => prev.map((t) => (t._id === activeTask._id ? res.task : t)));
        const isJobPub = activeTask.proposedAction?.actionType === 'JOB_PUBLISH_APPROVAL';
        setActionFeedback(
          isJobPub
            ? 'Recruitment drive APPROVED & published! Job opening is now live in the placement portal.'
            : 'Shortlist & interview slots APPROVED! Backend database records updated and student alerts dispatched.'
        );
        setTimeout(() => setActionFeedback(''), 5000);
      }
    } catch (err) {
      console.error('Approval failed:', err);
      alert(err.response?.data?.message || 'Approval execution failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectTask = async () => {
    if (!activeTask) return;
    try {
      setIsProcessing(true);
      const res = await agentService.rejectTask(activeTask._id, 'Administrative cancellation');
      if (res.success) {
        setActiveTask(res.task);
        setTasks((prev) => prev.map((t) => (t._id === activeTask._id ? res.task : t)));
        setActionFeedback('Workflow proposal rejected and cancelled by Admin. No reservations made.');
        setTimeout(() => setActionFeedback(''), 4000);
      }
    } catch (err) {
      console.error('Rejection failed:', err);
      alert(err.response?.data?.message || 'Rejection failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Banner */}
      <GlassCard padding="md" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-control bg-gradient-primary flex items-center justify-center text-white shadow-button shadow-brand-teal/25">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-brand-navy dark:text-slate-100">
                AI Placement Agent
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                Groq LLM & Tool Calling Active
              </span>
            </div>
            <p className="text-xs text-brand-secondary dark:text-slate-400 mt-0.5">
              Natural-language intent interpretation, deterministic engine coordination, and human-in-the-loop approvals
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-brand-secondary">Workflow Safety:</span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-control border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Approval Gate Enforced</span>
          </span>
        </div>
      </GlassCard>

      {actionFeedback && (
        <div className="p-3.5 rounded-control bg-brand-teal/10 border border-brand-teal/20 text-brand-teal dark:text-brand-cyan text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-brand-teal shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Main Agent Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Command & Orchestration Console (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prompt / Instruction Box */}
          <GlassCard padding="md">
            <h3 className="text-sm font-bold text-brand-navy dark:text-slate-100 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-teal" />
              <span>Instruct Placement Agent</span>
            </h3>
            <p className="text-xs text-brand-secondary dark:text-slate-400 mb-3">
              Describe the recruitment workflow. The agent will orchestrate eligibility verification, candidate ranking, and slot scheduling.
            </p>

            <div className="space-y-3">
              <div className="relative">
                <textarea
                  rows={3}
                  value={chatPrompt}
                  onChange={(e) => setChatPrompt(e.target.value)}
                  placeholder="e.g. Shortlist top eligible candidates for Microsoft SDE drive with CGPA > 7.5..."
                  className="w-full p-3 rounded-control text-xs sm:text-sm bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
                />
              </div>

              {/* Sample Prompts */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-brand-secondary uppercase">
                  Quick Examples:
                </span>
                {samplePrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleStartWorkflow(p)}
                    className="text-[11px] px-2.5 py-1 rounded-control bg-white/60 dark:bg-slate-800/60 hover:bg-brand-teal/10 hover:text-brand-teal text-brand-secondary border border-slate-200/60 dark:border-white/10 transition-all text-left"
                  >
                    {p.split(',')[0]}...
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-1">
                <GradientButton
                  loading={isProcessing}
                  disabled={!chatPrompt.trim()}
                  onClick={() => handleStartWorkflow()}
                  icon={Play}
                >
                  Execute Agentic Workflow
                </GradientButton>
              </div>
            </div>
          </GlassCard>

          {/* Agent Response Stream Card */}
          {agentResponseMsg && (
            <GlassCard padding="md" className="border-brand-teal/40 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-teal">
                <Bot className="w-4 h-4" />
                <span>AI Placement Agent Response:</span>
              </div>
              <div className="text-xs text-brand-navy dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                {agentResponseMsg}
              </div>
            </GlassCard>
          )}

          {/* Active Workflow Progress & Step Execution */}
          {activeTask && (
            <GlassCard padding="lg" className="border-brand-teal/30 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-teal">
                      Orchestrated Task
                    </span>
                    <StatusBadge status={activeTask.executionStatus || activeTask.status} size="sm" />
                  </div>
                  <h3 className="text-base font-bold text-brand-navy dark:text-slate-100 mt-0.5">
                    {activeTask.proposedAction?.title || activeTask.taskType}
                  </h3>
                  <p className="text-xs text-brand-secondary dark:text-slate-400">
                    Prompt: "{activeTask.request}" • {new Date(activeTask.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-brand-navy dark:text-slate-200 block">
                    Execution Progress
                  </span>
                  <span className="text-base font-extrabold text-brand-teal">
                    {activeTask.progress || 80}%
                  </span>
                </div>
              </div>

              {/* Step Sequence */}
              {activeTask.workflowSteps && activeTask.workflowSteps.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-brand-navy dark:text-slate-200 flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-brand-teal" />
                    <span>Controlled Backend Tool Invocations</span>
                  </h4>

                  <div className="space-y-2.5">
                    {activeTask.workflowSteps.map((step) => {
                      const isDone = step.status === 'Completed';
                      const isInProgress = step.status === 'In Progress';

                      return (
                        <div
                          key={step.id}
                          className={`p-3 rounded-control text-xs flex items-start gap-3 transition-all ${
                            isDone
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30 text-emerald-900 dark:text-emerald-300'
                              : isInProgress
                              ? 'bg-brand-teal/10 border border-brand-teal/30 text-brand-teal dark:text-brand-cyan'
                              : 'bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-white/5 text-slate-500'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : isInProgress ? (
                              <Clock className="w-4 h-4 text-brand-teal animate-spin" />
                            ) : (
                              <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-[10px] font-bold">
                                {step.id}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold">{step.name}</p>
                            <p className="text-[11px] opacity-80 mt-0.5">{step.detail}</p>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider">
                            {step.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Proposed Shortlist & Slots (If Waiting for Approval) */}
              {activeTask.proposedShortlist && activeTask.proposedShortlist.length > 0 && (
                <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-brand-navy dark:text-slate-100 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-brand-teal" />
                      <span>
                        Proposed Shortlist for Approval ({activeTask.proposedShortlist.length} Matching Candidates)
                      </span>
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {activeTask.proposedShortlist.map((cand, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-white/10 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-brand-navy dark:text-slate-100">{cand.name}</p>
                          <p className="text-[10px] text-brand-secondary dark:text-slate-400">
                            {cand.roll} • CGPA {cand.cgpa}
                          </p>
                        </div>
                        <span className="text-xs font-extrabold text-brand-teal">
                          {cand.match}% Match
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Proposed Interview Slots */}
              {activeTask.proposedSlots && activeTask.proposedSlots.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-brand-navy dark:text-slate-100 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-brand-turquoise" />
                    <span>Proposed Conflict-Free Interview Windows</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {activeTask.proposedSlots.map((slot, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-control bg-brand-turquoise/5 border border-brand-turquoise/20"
                      >
                        <p className="font-bold text-brand-navy dark:text-slate-200">{slot.slot}</p>
                        <p className="text-[10px] text-brand-secondary dark:text-slate-400 mt-0.5">
                          Panel: {slot.panel} • Venue: {slot.venue}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Proposed Job Publish Action Details */}
              {activeTask.proposedAction?.actionType === 'JOB_PUBLISH_APPROVAL' && activeTask.proposedAction?.payload && (
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-brand-navy dark:text-slate-100 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-brand-teal" />
                      <span>
                        Extracted Recruitment Drive Specification ({activeTask.proposedAction.payload.companyName})
                      </span>
                    </h4>
                  </div>

                  <div className="p-3.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-white/10 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-brand-navy dark:text-slate-100 text-sm">
                        {activeTask.proposedAction.payload.title}
                      </p>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                        {activeTask.proposedAction.payload.package}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                      <div>
                        <span className="text-brand-secondary">Min CGPA:</span>{' '}
                        <span className="font-bold text-brand-navy dark:text-slate-200">
                          {activeTask.proposedAction.payload.minimumCGPA}
                        </span>
                      </div>
                      <div>
                        <span className="text-brand-secondary">Max Backlogs:</span>{' '}
                        <span className="font-bold text-brand-navy dark:text-slate-200">
                          {activeTask.proposedAction.payload.maximumActiveBacklogs}
                        </span>
                      </div>
                      <div>
                        <span className="text-brand-secondary">Target Batch:</span>{' '}
                        <span className="font-bold text-brand-navy dark:text-slate-200">
                          {activeTask.proposedAction.payload.graduationYear || 2026}
                        </span>
                      </div>
                    </div>

                    {activeTask.proposedAction.payload.eligibleBranches && (
                      <div className="text-[11px]">
                        <span className="text-brand-secondary block mb-1">Eligible Branches:</span>
                        <div className="flex flex-wrap gap-1">
                          {activeTask.proposedAction.payload.eligibleBranches.map((b) => (
                            <span key={b} className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium text-[10px]">
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTask.proposedAction.payload.requiredSkills && (
                      <div className="text-[11px]">
                        <span className="text-brand-secondary block mb-1">Core Competencies:</span>
                        <div className="flex flex-wrap gap-1">
                          {activeTask.proposedAction.payload.requiredSkills.map((s) => (
                            <span key={s} className="px-2 py-0.5 rounded bg-brand-teal/10 text-brand-teal dark:text-brand-cyan font-medium text-[10px]">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Human Administrator Approval Controls */}
              {activeTask.approvalStatus === 'Pending' && (
                <div className="p-4 rounded-card-sm bg-amber-500/10 border border-amber-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs font-bold">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      {activeTask.proposedAction?.actionType === 'JOB_PUBLISH_APPROVAL'
                        ? 'Human-in-the-Loop Confirmation Required: Do you approve publishing this recruitment drive to the campus portal?'
                        : 'Human-in-the-Loop Confirmation Required: Do you approve this candidate shortlist & allocation plan?'}
                    </span>
                  </div>
                  <div className="flex justify-end gap-2.5">
                    <button
                      onClick={handleRejectTask}
                      disabled={isProcessing}
                      className="px-4 py-2 rounded-control text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200"
                    >
                      Reject Proposal
                    </button>
                    <GradientButton onClick={handleApproveTask} icon={Check} size="md" disabled={isProcessing}>
                      {isProcessing ? 'Applying...' : 'Approve & Execute to Database'}
                    </GradientButton>
                  </div>
                </div>
              )}

              {activeTask.approvalStatus === 'Approved' && (
                <div className="p-3 rounded-control bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Proposal was approved and state changes applied to MongoDB.</span>
                </div>
              )}
            </GlassCard>
          )}
        </div>

        {/* Right Column: Task History & Live Agent Tools Status */}
        <div className="space-y-6">
          {/* Active Tasks List */}
          <GlassCard padding="md">
            <h3 className="text-sm font-bold text-brand-navy dark:text-slate-100 mb-3 flex items-center justify-between">
              <span>Task Orchestration History</span>
              <span className="text-[10px] bg-brand-teal/10 text-brand-teal font-bold px-2 py-0.5 rounded-full">
                {tasks.length} Workflows
              </span>
            </h3>

            <div className="space-y-2.5">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  onClick={() => setActiveTask(task)}
                  className={`p-3 rounded-control text-xs cursor-pointer transition-all ${
                    activeTask?._id === task._id
                      ? 'bg-brand-teal/15 border border-brand-teal/40 shadow-soft'
                      : 'bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 border border-slate-200/60 dark:border-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-brand-navy dark:text-slate-100 line-clamp-1">
                      {task.proposedAction?.title || task.taskType}
                    </span>
                    <StatusBadge status={task.executionStatus || task.approvalStatus} size="sm" showDot={false} />
                  </div>
                  <p className="text-[11px] text-brand-secondary dark:text-slate-400 mt-1 line-clamp-2">
                    {task.request}
                  </p>
                  <div className="flex items-center justify-between mt-2 text-[10px] text-brand-secondary/70">
                    <span>{new Date(task.createdAt).toLocaleTimeString()}</span>
                    <span>{task.progress || 100}% done</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Controlled Backend Tools Inventory */}
          <GlassCard padding="md">
            <h3 className="text-sm font-bold text-brand-navy dark:text-slate-100 mb-2">
              Registered Backend Tools
            </h3>
            <p className="text-[11px] text-brand-secondary dark:text-slate-400 mb-3">
              Predefined deterministic functions invoked by the Groq Agent:
            </p>

            <div className="space-y-1.5 text-xs font-mono">
              {[
                { name: 'checkEligibility', desc: 'Deterministic filter' },
                { name: 'shortlistCandidates', desc: 'Skill alignment scoring' },
                { name: 'scheduleInterviews', desc: 'Conflict-free slotting' },
                { name: 'analyzeJobDescription', desc: 'Unstructured JD parser' },
                { name: 'draftAnnouncement', desc: 'Broadcast notices' },
              ].map((tool, i) => (
                <div
                  key={i}
                  className="p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5 flex items-center justify-between text-[11px]"
                >
                  <span className="text-brand-teal font-semibold">tool:{tool.name}</span>
                  <span className="text-brand-secondary dark:text-slate-400 text-[10px]">
                    {tool.desc}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default AIAgent;
