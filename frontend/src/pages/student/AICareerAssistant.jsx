import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Loader2,
} from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';
import ProgressRing from '../../components/ProgressRing';
import studentService from '../../services/studentService';
import jobService from '../../services/jobService';
import agentService from '../../services/agentService';

export const AICareerAssistant = () => {
  const [student, setStudent] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedTargetJob, setSelectedTargetJob] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);

  const quickPrompts = [
    'What skills am I missing for the selected target role?',
    'How should I explain my technical projects in interviews?',
    'What are common System Design questions for freshers?',
    'Give me a 7-day preparation roadmap for technical rounds',
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileRes, jobsRes] = await Promise.all([
        studentService.getMyProfile(),
        jobService.getJobs({ status: 'all' }),
      ]);

      if (profileRes.success && profileRes.data) {
        const s = profileRes.data;
        setStudent(s);
        setMessages([
          {
            id: 1,
            sender: 'ai',
            text: `Hello ${
              s.userId?.name?.split(' ')[0] || 'Student'
            }! I am your AI Placement & Career Assistant. I have indexed your placement profile (CGPA: ${
              s.cgpa
            }, ${s.branch}, skills in ${(s.skills || []).slice(0, 4).join(', ')}) along with active campus recruitment descriptions. How can I help you prepare today?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }

      if (jobsRes.success && jobsRes.data && jobsRes.data.length > 0) {
        setJobs(jobsRes.data);
        setSelectedTargetJob(jobsRes.data[0]);
      }
    } catch (err) {
      console.error('Error loading AI Assistant profile context:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (textToSend = inputMessage) => {
    const text = textToSend.trim();
    if (!text) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const res = await agentService.sendStudentCareerMessage(text);
      if (res.success && res.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'ai',
            text: res.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      console.error('Career assistant error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: 'I encountered an error retrieving live coaching guidance. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Skill alignment with selected target role
  const getJobAlignment = () => {
    if (!selectedTargetJob || !student) {
      return { matchPercentage: 80, matched: [], missing: [] };
    }

    const sSkills = (student.skills || []).map((s) => s.toLowerCase().trim());
    const rSkills = selectedTargetJob.requiredSkills || [];

    const matched = [];
    const missing = [];

    rSkills.forEach((req) => {
      const reqLower = req.toLowerCase().trim();
      const hasMatch = sSkills.some((s) => s.includes(reqLower) || reqLower.includes(s));
      if (hasMatch) matched.push(req);
      else missing.push(req);
    });

    const ratio = rSkills.length > 0 ? matched.length / rSkills.length : 0.8;
    const matchPercentage = Math.round(ratio * 70 + (student.cgpa / 10) * 30);

    return {
      matchPercentage: Math.max(30, Math.min(98, matchPercentage)),
      matched,
      missing,
    };
  };

  const alignment = getJobAlignment();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-teal" />
        <p className="text-xs font-semibold text-brand-secondary">
          Initializing personalized AI career coach & skill matrices...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <GlassCard padding="md" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-control bg-gradient-primary flex items-center justify-center text-white shadow-soft">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-brand-navy dark:text-slate-100">
              AI Career & Skill Gap Assistant
            </h1>
            <p className="text-xs text-brand-secondary dark:text-slate-400">
              Personalized guidance, interview talking points, and tailored skill alignment
            </p>
          </div>
        </div>

        {/* Target Job Selector */}
        {jobs.length > 0 && selectedTargetJob && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-brand-secondary dark:text-slate-400 font-semibold">Target Drive:</span>
            <select
              value={selectedTargetJob._id}
              onChange={(e) => {
                const j = jobs.find((job) => job._id === e.target.value);
                if (j) setSelectedTargetJob(j);
              }}
              className="px-3 py-1.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
            >
              {jobs.map((j) => (
                <option key={j._id} value={j._id}>
                  {j.companyName} - {j.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface (2 Columns) */}
        <div className="lg:col-span-2">
          <GlassCard padding="none" className="flex flex-col h-[600px] overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/40 dark:bg-slate-800/40">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-brand-navy dark:text-slate-100">
                  CampusPilot AI Advisor • Live Session
                </span>
              </div>
              <span className="text-[11px] text-brand-secondary dark:text-slate-400">
                Grounded on {student?.userId?.name || 'Your'} Placement Profile
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-7 h-7 rounded-control bg-gradient-primary flex items-center justify-center text-white shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-card-sm p-3.5 space-y-1.5 shadow-soft leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-gradient-primary text-white font-medium'
                        : 'bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-white/10 text-brand-navy dark:text-slate-100'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <span
                      className={`text-[10px] block text-right ${
                        msg.sender === 'user' ? 'text-white/70' : 'text-brand-secondary/60'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 rounded-control bg-brand-navy dark:bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-brand-secondary dark:text-slate-400">
                  <div className="w-6 h-6 rounded-control bg-gradient-primary flex items-center justify-center text-white">
                    <Bot className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <span className="animate-pulse">Analyzing skill graph & requirements...</span>
                </div>
              )}
            </div>

            {/* Quick Prompts Bar */}
            <div className="p-3 bg-white/50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
              <span className="text-[10px] font-bold text-brand-secondary shrink-0 uppercase tracking-wider">
                Ask AI:
              </span>
              {quickPrompts.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal dark:text-brand-cyan border border-brand-teal/20 shrink-0 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white/70 dark:bg-slate-800/70 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask about your skill gaps, project talking points, or interview prep..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 px-3.5 py-2.5 rounded-control text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
              />
              <GradientButton
                size="md"
                onClick={() => handleSendMessage()}
                icon={Send}
                disabled={!inputMessage.trim() || isTyping}
              >
                Send
              </GradientButton>
            </div>
          </GlassCard>
        </div>

        {/* Live Target Job Analysis Card */}
        <div className="space-y-6">
          {selectedTargetJob && (
            <GlassCard padding="md" className="border-brand-teal/30">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-teal">
                    Target Role Alignment
                  </span>
                  <h3 className="text-sm font-bold text-brand-navy dark:text-slate-100">
                    {selectedTargetJob.companyName}
                  </h3>
                  <p className="text-xs text-brand-secondary dark:text-slate-400">
                    {selectedTargetJob.title}
                  </p>
                </div>
                <ProgressRing progress={alignment.matchPercentage} size={54} strokeWidth={5} />
              </div>

              <div className="py-3 space-y-3 text-xs">
                <div>
                  <p className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mb-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Matching Skills ({alignment.matched.length})</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {alignment.matched.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium text-[11px] border border-emerald-500/20"
                      >
                        ✓ {s}
                      </span>
                    ))}
                    {alignment.matched.length === 0 && (
                      <span className="text-[11px] text-slate-400 italic">None matched yet</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mb-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Skill Gaps to Address</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {alignment.missing.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 font-medium text-[11px] border border-amber-500/20"
                      >
                        ! {s}
                      </span>
                    ))}
                    {alignment.missing.length === 0 && (
                      <span className="text-[11px] text-emerald-600 font-semibold">
                        All core skills satisfied!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-control bg-brand-teal/10 border border-brand-teal/20 text-xs">
                <p className="font-semibold text-brand-teal flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>AI Preparation Recommendation:</span>
                </p>
                <p className="text-[11px] text-brand-secondary dark:text-slate-300 mt-1">
                  Review time complexity tradeoffs and multithreaded design. Practice explaining how your
                  top project architecture addresses scalability and backpressure.
                </p>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default AICareerAssistant;
