import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  Wrench,
  FolderGit2,
  Award,
  FileText,
  Upload,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  ExternalLink,
  Mail,
  Phone,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';
import ProgressRing from '../../components/ProgressRing';
import studentService from '../../services/studentService';

export const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resumeSuccess, setResumeSuccess] = useState(false);

  const [student, setStudent] = useState({
    name: '',
    email: '',
    rollNumber: '',
    phone: '',
    branch: '',
    department: 'School of Computing',
    cgpa: 8.0,
    activeBacklogs: 0,
    graduationYear: 2026,
    skills: [],
    softSkills: [],
    projects: [],
    certifications: [],
    resume: null,
    github: '',
    linkedin: '',
    profileCompletion: 60,
  });

  const [activeTab, setActiveTab] = useState('personal');
  const [newSkill, setNewSkill] = useState('');
  const [newSoftSkill, setNewSoftSkill] = useState('');

  // New project state
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    techStack: '',
    github: '',
    liveUrl: '',
  });
  const [showAddProject, setShowAddProject] = useState(false);

  // New certification state
  const [newCert, setNewCert] = useState({
    name: '',
    issuer: '',
    date: '',
    url: '',
  });
  const [showAddCert, setShowAddCert] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await studentService.getMyProfile();
      if (res.success && res.data) {
        const d = res.data;
        setStudent({
          _id: d._id,
          name: d.userId?.name || '',
          email: d.userId?.email || '',
          rollNumber: d.rollNumber || '',
          phone: d.phone || '',
          branch: d.branch || '',
          department: d.department || 'School of Computing',
          cgpa: d.cgpa ?? 8.0,
          activeBacklogs: d.activeBacklogs ?? 0,
          graduationYear: d.graduationYear ?? 2026,
          skills: d.skills || [],
          softSkills: d.softSkills || [],
          projects: d.projects || [],
          certifications: d.certifications || [],
          resume: d.resume || null,
          github: d.github || '',
          linkedin: d.linkedin || '',
          profileCompletion: d.profileCompletion ?? 70,
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to load profile from database.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setStudent((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !student.skills.includes(newSkill.trim())) {
      setStudent((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setStudent((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleAddSoftSkill = () => {
    if (newSoftSkill.trim() && !student.softSkills.includes(newSoftSkill.trim())) {
      setStudent((prev) => ({
        ...prev,
        softSkills: [...prev.softSkills, newSoftSkill.trim()],
      }));
      setNewSoftSkill('');
    }
  };

  const handleRemoveSoftSkill = (skillToRemove) => {
    setStudent((prev) => ({
      ...prev,
      softSkills: prev.softSkills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newProject.title.trim()) return;
    const project = {
      title: newProject.title.trim(),
      description: newProject.description.trim(),
      techStack: newProject.techStack
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      github: newProject.github || '',
      liveUrl: newProject.liveUrl || '',
    };
    setStudent((prev) => ({
      ...prev,
      projects: [...prev.projects, project],
    }));
    setNewProject({ title: '', description: '', techStack: '', github: '', liveUrl: '' });
    setShowAddProject(false);
  };

  const handleRemoveProject = (indexToRemove) => {
    setStudent((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleAddCert = (e) => {
    e.preventDefault();
    if (!newCert.name.trim()) return;
    const cert = {
      name: newCert.name.trim(),
      issuer: newCert.issuer.trim(),
      date: newCert.date.trim(),
      url: newCert.url.trim(),
    };
    setStudent((prev) => ({
      ...prev,
      certifications: [...prev.certifications, cert],
    }));
    setNewCert({ name: '', issuer: '', date: '', url: '' });
    setShowAddCert(false);
  };

  const handleRemoveCert = (indexToRemove) => {
    setStudent((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setErrorMsg('');
    try {
      const payload = {
        phone: student.phone,
        department: student.department,
        branch: student.branch,
        cgpa: Number(student.cgpa),
        activeBacklogs: Number(student.activeBacklogs),
        graduationYear: Number(student.graduationYear),
        skills: student.skills,
        softSkills: student.softSkills,
        github: student.github,
        linkedin: student.linkedin,
        projects: student.projects,
        certifications: student.certifications,
      };

      const res = await studentService.updateMyProfile(payload);
      if (res.success && res.data) {
        setStudent((prev) => ({
          ...prev,
          profileCompletion: res.data.profileCompletion,
        }));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Save profile error:', err);
      setErrorMsg(err.response?.data?.message || 'Error updating profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingResume(true);
    setErrorMsg('');
    try {
      const res = await studentService.uploadResume(file);
      if (res.success && res.data) {
        setStudent((prev) => ({
          ...prev,
          resume: res.data.resume,
          profileCompletion: res.data.profileCompletion,
        }));
        setResumeSuccess(true);
        setTimeout(() => setResumeSuccess(false), 3500);
      }
    } catch (err) {
      console.error('Resume upload error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to upload resume document.');
    } finally {
      setUploadingResume(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal & Academics', icon: User },
    { id: 'skills', label: 'Technical & Soft Skills', icon: Wrench },
    { id: 'projects', label: 'Projects & Work', icon: FolderGit2 },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'resume', label: 'Resume & Documents', icon: FileText },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-teal" />
        <p className="text-xs font-semibold text-brand-secondary">
          Loading student placement profile from database...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Profile Header Bar */}
      <GlassCard padding="md" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-control-lg bg-gradient-primary flex items-center justify-center text-white text-2xl font-bold shadow-soft">
            {student.name ? student.name.charAt(0) : 'S'}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-brand-navy dark:text-slate-100">
              {student.name || 'Student Profile'}
            </h1>
            <p className="text-xs text-brand-secondary dark:text-slate-400">
              {student.rollNumber} • {student.branch} ({student.graduationYear})
            </p>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-brand-secondary dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-brand-teal" />
                {student.email}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-brand-teal" />
                {student.phone || 'No phone set'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 rounded-control bg-white/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/10">
            <ProgressRing progress={student.profileCompletion} size={48} strokeWidth={4} />
            <div className="text-left">
              <p className="text-xs font-bold text-brand-navy dark:text-slate-100">
                Profile Completeness
              </p>
              <p className="text-[11px] text-brand-teal font-semibold">
                High placement match
              </p>
            </div>
          </div>
          <GradientButton icon={Save} onClick={handleSaveProfile} disabled={saving} size="md">
            {saving ? 'Saving...' : 'Save Profile'}
          </GradientButton>
        </div>
      </GlassCard>

      {errorMsg && (
        <div className="p-3 rounded-control bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-3 rounded-control bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Profile changes successfully updated in database. Deterministic eligibility synced.</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200/80 dark:border-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-control text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                isActive
                  ? 'bg-gradient-primary text-white shadow-button'
                  : 'text-brand-secondary dark:text-slate-400 hover:text-brand-navy dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Personal & Academics */}
      {activeTab === 'personal' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
          <GlassCard padding="lg">
            <h3 className="text-base font-bold text-brand-navy dark:text-slate-100 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-teal" />
              <span>Personal Details</span>
            </h3>
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={student.name}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-control bg-slate-100 dark:bg-slate-800/40 border border-slate-200/80 dark:border-white/5 text-brand-secondary dark:text-slate-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={student.email}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-control bg-slate-100 dark:bg-slate-800/40 border border-slate-200/80 dark:border-white/5 text-brand-secondary dark:text-slate-400 cursor-not-allowed"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={student.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-1">
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    value={student.graduationYear}
                    onChange={(e) => handleInputChange('graduationYear', parseInt(e.target.value) || 2026)}
                    className="w-full px-3.5 py-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-1">
                    GitHub Profile URL
                  </label>
                  <input
                    type="text"
                    value={student.github}
                    onChange={(e) => handleInputChange('github', e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-3.5 py-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-1">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="text"
                    value={student.linkedin}
                    onChange={(e) => handleInputChange('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-3.5 py-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard padding="lg">
            <h3 className="text-base font-bold text-brand-navy dark:text-slate-100 mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-brand-teal" />
              <span>Academic Records</span>
            </h3>
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-1">
                  Roll / University ID
                </label>
                <input
                  type="text"
                  value={student.rollNumber}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-control bg-slate-100 dark:bg-slate-800/40 border border-slate-200/80 dark:border-white/5 text-brand-secondary dark:text-slate-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-1">
                  Branch / Major
                </label>
                <input
                  type="text"
                  value={student.branch}
                  onChange={(e) => handleInputChange('branch', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={student.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-1">
                    Cumulative CGPA (0-10)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={student.cgpa}
                    onChange={(e) => handleInputChange('cgpa', parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100 font-bold text-brand-teal"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-brand-navy dark:text-slate-200 mb-1">
                    Active Backlogs
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={student.activeBacklogs}
                    onChange={(e) => handleInputChange('activeBacklogs', parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100 font-bold"
                  />
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Tab 2: Skills */}
      {activeTab === 'skills' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
          {/* Technical Skills */}
          <GlassCard padding="lg">
            <h3 className="text-base font-bold text-brand-navy dark:text-slate-100 mb-2 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-brand-teal" />
              <span>Technical Skills</span>
            </h3>
            <p className="text-xs text-brand-secondary dark:text-slate-400 mb-4">
              These skills are evaluated by the AI Matching Engine against job descriptions.
            </p>

            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                placeholder="e.g. Next.js, Kubernetes, PostgreSQL"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                className="flex-1 px-3.5 py-2 rounded-control text-xs bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100"
              />
              <GradientButton size="sm" icon={Plus} onClick={handleAddSkill}>
                Add Skill
              </GradientButton>
            </div>

            <div className="flex flex-wrap gap-2">
              {student.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-semibold bg-brand-teal/10 text-brand-teal dark:text-brand-cyan border border-brand-teal/25"
                >
                  <span>{skill}</span>
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-rose-500 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
              {student.skills.length === 0 && (
                <p className="text-xs text-slate-400 italic">No technical skills added yet.</p>
              )}
            </div>
          </GlassCard>

          {/* Soft Skills */}
          <GlassCard padding="lg">
            <h3 className="text-base font-bold text-brand-navy dark:text-slate-100 mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-turquoise" />
              <span>Soft Skills & Competencies</span>
            </h3>
            <p className="text-xs text-brand-secondary dark:text-slate-400 mb-4">
              Evaluated during HR fitment rounds and behavioral interviews.
            </p>

            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                placeholder="e.g. Leadership, Public Speaking"
                value={newSoftSkill}
                onChange={(e) => setNewSoftSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSoftSkill()}
                className="flex-1 px-3.5 py-2 rounded-control text-xs bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 text-brand-navy dark:text-slate-100"
              />
              <GradientButton size="sm" icon={Plus} onClick={handleAddSoftSkill}>
                Add
              </GradientButton>
            </div>

            <div className="flex flex-wrap gap-2">
              {student.softSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-300 border border-sky-400/20"
                >
                  <span>{skill}</span>
                  <button
                    onClick={() => handleRemoveSoftSkill(skill)}
                    className="hover:text-rose-500 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
              {student.softSkills.length === 0 && (
                <p className="text-xs text-slate-400 italic">No soft skills added yet.</p>
              )}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Tab 3: Projects */}
      {activeTab === 'projects' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-brand-navy dark:text-slate-100">
                Key Technical Projects
              </h3>
              <p className="text-xs text-brand-secondary dark:text-slate-400">
                Showcase your production projects, microservices, or hackathon prototypes
              </p>
            </div>
            <GradientButton icon={Plus} size="sm" onClick={() => setShowAddProject(!showAddProject)}>
              {showAddProject ? 'Cancel' : 'Add Project'}
            </GradientButton>
          </div>

          {showAddProject && (
            <GlassCard padding="md" className="border-brand-teal/40 animate-in fade-in">
              <form onSubmit={handleAddProject} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Project Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Distributed Task Queue"
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Description *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe architecture, scalability, impact..."
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Tech Stack (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="React, Node.js, Redis, Docker"
                      value={newProject.techStack}
                      onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })}
                      className="w-full px-3 py-2 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">GitHub / Code URL</label>
                    <input
                      type="url"
                      placeholder="https://github.com/..."
                      value={newProject.github}
                      onChange={(e) => setNewProject({ ...newProject, github: e.target.value })}
                      className="w-full px-3 py-2 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10"
                    />
                  </div>
                </div>
                <GradientButton type="submit" size="sm">
                  Save Project
                </GradientButton>
              </form>
            </GlassCard>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {student.projects.map((p, idx) => (
              <GlassCard key={idx} padding="md" hoverEffect className="space-y-3">
                <div className="flex items-start justify-between">
                  <h4 className="text-sm font-bold text-brand-navy dark:text-slate-100">{p.title}</h4>
                  <button
                    onClick={() => handleRemoveProject(idx)}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-brand-secondary dark:text-slate-400 leading-relaxed">
                  {p.description}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {p.techStack &&
                    p.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200/70 dark:bg-slate-700/60 text-brand-navy dark:text-slate-200"
                      >
                        {tech}
                      </span>
                    ))}
                </div>
                {p.github && (
                  <a
                    href={p.github}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-brand-teal hover:underline font-semibold pt-1"
                  >
                    <span>View Repository</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </GlassCard>
            ))}
            {student.projects.length === 0 && (
              <div className="col-span-2 text-center py-8 text-xs text-slate-400 italic">
                No projects listed. Click "Add Project" to enhance your placement profile match score!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Certifications */}
      {activeTab === 'certifications' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-brand-navy dark:text-slate-100">
                Industry Certifications
              </h3>
              <p className="text-xs text-brand-secondary dark:text-slate-400">
                Verified credentials from AWS, Google, Oracle, Microsoft, Coursera
              </p>
            </div>
            <GradientButton icon={Plus} size="sm" onClick={() => setShowAddCert(!showAddCert)}>
              {showAddCert ? 'Cancel' : 'Add Certification'}
            </GradientButton>
          </div>

          {showAddCert && (
            <GlassCard padding="md" className="border-brand-teal/40 animate-in fade-in">
              <form onSubmit={handleAddCert} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Certification Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AWS Certified Solutions Architect"
                      value={newCert.name}
                      onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Issuing Organization *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Amazon Web Services"
                      value={newCert.issuer}
                      onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                      className="w-full px-3 py-2 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Issue Date</label>
                    <input
                      type="text"
                      placeholder="e.g. Aug 2025"
                      value={newCert.date}
                      onChange={(e) => setNewCert({ ...newCert, date: e.target.value })}
                      className="w-full px-3 py-2 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Credential Verification URL</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={newCert.url}
                      onChange={(e) => setNewCert({ ...newCert, url: e.target.value })}
                      className="w-full px-3 py-2 rounded-control bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10"
                    />
                  </div>
                </div>
                <GradientButton type="submit" size="sm">
                  Add Credential
                </GradientButton>
              </form>
            </GlassCard>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {student.certifications.map((c, idx) => (
              <GlassCard key={idx} padding="md" hoverEffect>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-brand-navy dark:text-slate-100">{c.name}</h4>
                    <p className="text-xs text-brand-teal font-medium mt-0.5">
                      {c.issuer} • <span className="text-brand-secondary dark:text-slate-400">{c.date}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveCert(idx)}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {c.url && (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-brand-secondary dark:text-slate-400 hover:text-brand-teal mt-3"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Verify Credential</span>
                  </a>
                )}
              </GlassCard>
            ))}
            {student.certifications.length === 0 && (
              <div className="col-span-2 text-center py-8 text-xs text-slate-400 italic">
                No certifications registered.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Resume & Documents */}
      {activeTab === 'resume' && (
        <GlassCard padding="lg" className="max-w-2xl mx-auto space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-base font-bold text-brand-navy dark:text-slate-100">
              Placement Resume Management
            </h3>
            <p className="text-xs text-brand-secondary dark:text-slate-400 mt-1">
              Upload your latest PDF resume. Recruiters and the AI matching service parse this for skill alignments.
            </p>
          </div>

          {resumeSuccess && (
            <div className="p-3 rounded-control bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Resume uploaded successfully! File saved to server and profile completion updated.</span>
            </div>
          )}

          {/* Upload Area */}
          <div className="border-2 border-dashed border-brand-teal/30 rounded-card p-8 text-center hover:bg-brand-teal/5 transition-all cursor-pointer relative">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeUpload}
              disabled={uploadingResume}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="w-12 h-12 rounded-full bg-brand-teal/10 text-brand-teal mx-auto flex items-center justify-center mb-3">
              {uploadingResume ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>
            <p className="text-xs font-semibold text-brand-navy dark:text-slate-100">
              {uploadingResume
                ? 'Uploading and processing resume...'
                : 'Click to browse or drag and drop your resume'}
            </p>
            <p className="text-[11px] text-brand-secondary dark:text-slate-400 mt-1">
              PDF, DOC, or DOCX (Max size: 5MB)
            </p>
          </div>

          {/* Uploaded File Card */}
          {student.resume && student.resume.url && (
            <div className="p-4 rounded-control-lg bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-control bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-navy dark:text-slate-100">
                    {student.resume.originalName || student.resume.url.split('/').pop()}
                  </p>
                  <p className="text-[10px] text-brand-secondary dark:text-slate-400">
                    Verified Document • Uploaded{' '}
                    {student.resume.uploadedAt
                      ? new Date(student.resume.uploadedAt).toLocaleDateString()
                      : 'Recently'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
                  Active Resume
                </span>
                <a
                  href={`http://localhost:5000${student.resume.url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-xs text-brand-teal hover:underline flex items-center gap-1 font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View</span>
                </a>
              </div>
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
};

export default Profile;
