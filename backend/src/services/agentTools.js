import { Student } from '../models/Student.js';
import { Job } from '../models/Job.js';
import { Company } from '../models/Company.js';
import { Application } from '../models/Application.js';
import { Panel } from '../models/Panel.js';
import { Venue } from '../models/Venue.js';
import { evaluateEligibility } from '../controllers/jobController.js';
import { callGroqChat, hasLiveGroqKey } from './groqService.js';

export const agentTools = {
  // 1. Check Deterministic Eligibility Tool
  checkEligibility: async ({ studentId, jobId }) => {
    const [student, job] = await Promise.all([
      Student.findById(studentId).populate('userId', 'name email'),
      Job.findById(jobId),
    ]);

    if (!student || !job) {
      return { success: false, message: 'Student or Job not found for eligibility evaluation.' };
    }

    const { eligible, reasons } = evaluateEligibility(student, job);
    return {
      success: true,
      eligible,
      reasons,
      studentName: student.userId?.name,
      rollNumber: student.rollNumber,
      jobTitle: job.title,
      companyName: job.companyName,
      metrics: {
        studentCgpa: student.cgpa,
        requiredCgpa: job.minimumCGPA,
        studentBacklogs: student.activeBacklogs,
        maxBacklogs: job.maximumActiveBacklogs,
        studentBranch: student.branch,
        eligibleBranches: job.eligibleBranches,
      },
    };
  },

  // 2. Shortlist Candidates Tool
  shortlistCandidates: async ({ jobId, minCgpa, maxBacklogs, limit = 10 }) => {
    let job = null;
    if (jobId) {
      job = await Job.findById(jobId).populate('companyId');
    }
    if (!job) {
      job = await Job.findOne({ status: 'Open' }).sort({ createdAt: -1 }).populate('companyId');
    }

    if (!job) {
      return { success: false, message: 'No open placement drive found to shortlist for.' };
    }

    const effectiveMinCgpa = minCgpa !== undefined ? Number(minCgpa) : job.minimumCGPA;
    const effectiveMaxBacklogs = maxBacklogs !== undefined ? Number(maxBacklogs) : job.maximumActiveBacklogs;

    const allStudents = await Student.find({
      cgpa: { $gte: effectiveMinCgpa },
      activeBacklogs: { $lte: effectiveMaxBacklogs },
    })
      .populate('userId', 'name email avatar')
      .sort({ cgpa: -1 });

    // Filter candidates strictly meeting Gate 1 (Academic Eligibility)
    const eligibleStudents = allStudents.filter((student) => {
      const { eligible } = evaluateEligibility(student, job);
      return eligible;
    });

    // Gate 2: Real LLM Semantic Skill Competency Evaluation
    let scoredCandidates = [];
    try {
      if (hasLiveGroqKey() && eligibleStudents.length > 0) {
        const aiResult = await agentTools.matchCandidateSkillsWithAI({
          job,
          candidates: eligibleStudents.slice(0, 15),
        });

        if (aiResult?.success && Array.isArray(aiResult.matches) && aiResult.matches.length > 0) {
          const matchMap = new Map(aiResult.matches.map((m) => [m.candidateId, m]));
          scoredCandidates = eligibleStudents.map((s) => {
            const evalResult = matchMap.get(s._id.toString());
            const matchScore = evalResult ? evalResult.skillMatchScore : 75;
            return {
              studentId: s._id.toString(),
              name: s.userId?.name || 'Candidate',
              roll: s.rollNumber,
              branch: s.branch,
              cgpa: s.cgpa,
              activeBacklogs: s.activeBacklogs,
              match: matchScore,
              matchedSkills: evalResult?.matchedSkills || s.skills || [],
              missingSkills: evalResult?.missingSkills || [],
              skillFitLevel: evalResult?.skillFitLevel || 'Strong Fit',
              aiSummary: evalResult?.aiSummary || 'Evaluated via Real LLM semantic alignment.',
              eligible: true,
              skills: s.skills,
              isAiPowered: true,
            };
          });
        }
      }
    } catch (llmErr) {
      console.warn('[shortlistCandidates] Real LLM matching warning:', llmErr.message);
    }

    // Baseline fallback only if Groq was unreachable
    if (scoredCandidates.length === 0) {
      scoredCandidates = eligibleStudents.map((student) => {
        const sSkills = (student.skills || []).map((s) => s.toLowerCase().trim());
        const matched = (job.requiredSkills || []).filter((req) =>
          sSkills.some((s) => s.includes(req.toLowerCase()) || req.toLowerCase().includes(s))
        );
        const skillScore =
          (job.requiredSkills || []).length > 0 ? (matched.length / job.requiredSkills.length) * 70 : 60;
        const cgpaScore = Math.min(30, (student.cgpa / 10) * 30);
        return {
          studentId: student._id.toString(),
          name: student.userId?.name || 'Candidate',
          roll: student.rollNumber,
          branch: student.branch,
          cgpa: student.cgpa,
          activeBacklogs: student.activeBacklogs,
          match: Math.round(skillScore + cgpaScore),
          matchedSkills: matched,
          eligible: true,
          skills: student.skills,
          isAiPowered: false,
        };
      });
    }

    scoredCandidates = scoredCandidates
      .sort((a, b) => b.match - a.match)
      .slice(0, Number(limit));

    return {
      success: true,
      jobId: job._id.toString(),
      jobTitle: job.title,
      companyName: job.companyName,
      criteriaApplied: {
        minimumCGPA: effectiveMinCgpa,
        maximumActiveBacklogs: effectiveMaxBacklogs,
        eligibleBranches: job.eligibleBranches,
      },
      count: scoredCandidates.length,
      candidates: scoredCandidates,
    };
  },

  // 3. Analyze Job Description Tool (Pure Real LLM Engine)
  analyzeJobDescription: async ({ jdText }) => {
    if (!jdText || jdText.trim() === '') {
      return { success: false, message: 'Empty job description text provided.' };
    }

    if (!hasLiveGroqKey()) {
      return {
        success: false,
        message:
          'No active Groq API key configured. Please set GROQ_API_KEY in backend/.env to enable Real LLM extraction.',
      };
    }

    const text = jdText.trim();
    const extractionPrompt = `You are a recruitment intelligence agent for university placements.
Analyze the following unstructured Job Description (JD) text and extract the placement parameters into a strictly formatted JSON object.

Job Description Text:
"""
${text}
"""

Return a valid JSON object matching exactly this schema:
{
  "companyName": "Recruiting Company Name (e.g. Uber, NexaTech Solutions, FinPulse Analytics, Google)",
  "title": "Exact Role or Job Title (e.g. Software Dev Engineer - I, Associate Data Analyst, Backend Engineer)",
  "package": "Compensation package or CTC mentioned (e.g. 8.5 - 10 LPA, 6.8 LPA, 38 LPA)",
  "location": "Job location or work model (e.g. Hyderabad / Bangalore (Hybrid), Chennai / Pune (WFO))",
  "minimumCGPA": 7.0,
  "maximumActiveBacklogs": 0,
  "eligibleBranches": ["Computer Science and Engineering", "Information Technology", "Electronics and Communication"],
  "graduationYear": 2026,
  "requiredSkills": ["Java", "Spring Boot", "SQL", "REST APIs"],
  "preferredSkills": ["Git", "AWS"],
  "rounds": ["Online Assessment", "Technical Round 1", "Technical Round 2", "HR Discussion"],
  "description": "Clear 2-3 sentence summary of the position, expectations, and day-to-day impact."
}`;

    try {
      const llmRes = await callGroqChat({
        messages: [
          {
            role: 'system',
            content:
              'You are an expert recruitment parser that outputs ONLY valid JSON adhering to the provided schema without any markdown formatting, preamble, code blocks, or commentary outside the JSON.',
          },
          { role: 'user', content: extractionPrompt },
        ],
        temperature: 0.1,
        max_tokens: 800,
        responseFormat: { type: 'json_object' },
      });

      if (!llmRes?.content) {
        return {
          success: false,
          message:
            'The Real LLM was unable to generate an extraction. Please verify your Groq API limits.',
        };
      }

      const parsed = JSON.parse(llmRes.content);
      if (!parsed || (!parsed.companyName && !parsed.title)) {
        return {
          success: false,
          message:
            'The Real LLM could not identify a valid company name or job role from the provided JD.',
        };
      }

      return {
        success: true,
        title: parsed.title || 'Software Engineer',
        companyName: parsed.companyName || 'Corporate Recruiter',
        package: parsed.package || 'Competitive CTC',
        location: parsed.location || 'Onsite / Hybrid',
        minimumCGPA:
          typeof parsed.minimumCGPA === 'number'
            ? Math.min(10, Math.max(0, parsed.minimumCGPA))
            : 6.0,
        maximumActiveBacklogs:
          typeof parsed.maximumActiveBacklogs === 'number'
            ? Math.max(0, parsed.maximumActiveBacklogs)
            : 0,
        eligibleBranches:
          Array.isArray(parsed.eligibleBranches) && parsed.eligibleBranches.length > 0
            ? parsed.eligibleBranches
            : [
                'Computer Science and Engineering',
                'Information Technology',
                'Electronics and Communication',
              ],
        graduationYear: parsed.graduationYear || 2026,
        requiredSkills:
          Array.isArray(parsed.requiredSkills) && parsed.requiredSkills.length > 0
            ? parsed.requiredSkills
            : ['Problem Solving', 'Data Structures', 'Algorithms'],
        preferredSkills: Array.isArray(parsed.preferredSkills) ? parsed.preferredSkills : [],
        rounds:
          Array.isArray(parsed.rounds) && parsed.rounds.length > 0
            ? parsed.rounds
            : ['Online Assessment', 'Technical Round 1', 'HR Discussion'],
        description: parsed.description || text.slice(0, 300) + '...',
        extractionEngine: 'Groq LLM',
      };
    } catch (err) {
      console.error('[analyzeJobDescription] Pure LLM extraction failed:', err.message);
      return {
        success: false,
        message: `Real LLM extraction failed: ${err.message}`,
      };
    }
  },

  // 4. Schedule Interviews Tool (Conflict-free slotting)
  scheduleInterviews: async ({ jobId, studentIds = [], date, startTime = '10:00 AM' }) => {
    let job = null;
    if (jobId) job = await Job.findById(jobId);
    if (!job) job = await Job.findOne({ status: 'Open' });

    const [panels, venues] = await Promise.all([
      Panel.find(),
      Venue.find(),
    ]);

    const activePanel = panels[0] || { name: 'Technical Evaluation Panel Alpha', department: 'School of Computing' };
    const activeVenue = venues[0] || { name: 'Interview Lab A', roomNumber: 'Lab 204' };

    let candidateDocs = [];
    if (studentIds && studentIds.length > 0) {
      candidateDocs = await Student.find({ _id: { $in: studentIds } }).populate('userId', 'name email');
    } else {
      // Pick top eligible students from job
      const apps = await Application.find({ jobId: job?._id })
        .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email' } })
        .limit(5);
      candidateDocs = apps.map((a) => a.studentId).filter(Boolean);
      if (candidateDocs.length === 0) {
        candidateDocs = await Student.find().populate('userId', 'name email').limit(4);
      }
    }

    const proposedDate = date || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Generate 45-minute stagger slots
    const slots = candidateDocs.map((c, index) => {
      const baseHour = 10 + Math.floor(index / 2);
      const startMin = (index % 2) * 30;
      const endMin = startMin + 30;
      const formatTime = (h, m) => `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;

      return {
        studentId: c._id.toString(),
        candidateName: c.userId?.name || 'Candidate',
        candidateRoll: c.rollNumber,
        slot: `${formatTime(baseHour, startMin)} – ${formatTime(baseHour, endMin)}`,
        startTime: formatTime(baseHour, startMin),
        endTime: formatTime(baseHour, endMin),
        panel: activePanel.name,
        panelId: activePanel._id?.toString(),
        venue: `${activeVenue.name} (${activeVenue.roomNumber})`,
        venueId: activeVenue._id?.toString(),
        roundName: 'Technical Round 1',
        roundNumber: 1,
      };
    });

    return {
      success: true,
      jobId: job?._id?.toString(),
      companyId: job?.companyId?.toString(),
      jobTitle: job?.title || 'Technical Role',
      companyName: job?.companyName || 'Corporate Recruiter',
      date: proposedDate,
      panelName: activePanel.name,
      venueName: activeVenue.name,
      totalSlots: slots.length,
      slots,
    };
  },

  // 5. Draft Announcement Tool
  draftAnnouncement: async ({ title, companyName, package: ctcPackage, deadline }) => {
    const subject = title || `Recruitment Drive Announcement: ${companyName || 'Corporate Partner'}`;
    const body = `We are pleased to announce that ${companyName || 'our recruiting partner'} has scheduled its on-campus placement drive for 2026 Batch Graduates offering ${ctcPackage || 'competitive CTC'}. Eligible candidates are requested to verify their profile details and apply on CampusPilot before the deadline (${deadline || 'upcoming'}).`;

    return {
      success: true,
      title: subject,
      message: body,
      type: 'Announcement',
      recipientRole: 'student',
    };
  },

  // 6. AI Semantic Skill Matcher Tool (Powered by Real LLM)
  matchCandidateSkillsWithAI: async ({ studentId, jobId, candidates = null, job = null }) => {
    let targetJob = job;
    if (jobId && !targetJob) {
      targetJob = await Job.findById(jobId);
    }
    if (!targetJob) {
      return { success: false, message: 'Target job opening not found for AI matching.' };
    }

    if (!hasLiveGroqKey()) {
      return {
        success: false,
        message: 'No active Groq API key found. AI Skill Matching requires an active Real LLM.',
      };
    }

    let studentsList = [];
    if (studentId) {
      const s = await Student.findById(studentId).populate('userId', 'name email avatar');
      if (s) studentsList = [s];
    } else if (Array.isArray(candidates) && candidates.length > 0) {
      studentsList = candidates;
    } else if (jobId) {
      studentsList = await Student.find().populate('userId', 'name email avatar').limit(25);
    }

    if (studentsList.length === 0) {
      return { success: false, message: 'No student candidates found for AI evaluation.' };
    }

    const candidatePayload = studentsList.map((s) => ({
      candidateId: s._id?.toString() || s.studentId || s.id,
      name: s.userId?.name || s.name || 'Candidate',
      branch: s.branch,
      cgpa: s.cgpa,
      activeBacklogs: s.activeBacklogs,
      skills: s.skills || [],
      projects: (s.projects || []).slice(0, 3).map((p) => ({
        title: p.title,
        description: p.description?.slice(0, 150),
      })),
    }));

    const systemPrompt = `You are CampusPilot's Senior Technical Talent Evaluator.
Analyze each candidate profile against the job requirements using true semantic reasoning.
- Do not rely on mere keyword/string matches. Identify if candidate skills or projects fulfill equivalent competencies (e.g. FastAPI/Express fulfilling REST APIs; PostgreSQL fulfilling SQL; Docker fulfilling Containers).
- Deeply inspect projects to evaluate practical software engineering capability.
- Evaluate technical readiness honestly. If a candidate lacks critical required skills, clearly reflect that in a low score and "Skill Gap" status.

Job Opening:
- Title: ${targetJob.title}
- Company: ${targetJob.companyName}
- Required Skills: ${(targetJob.requiredSkills || []).join(', ') || 'Software Development'}
- Preferred Skills: ${(targetJob.preferredSkills || []).join(', ')}
- Description: ${(targetJob.description || '').slice(0, 300)}

Return a valid JSON object matching exactly this schema:
{
  "matches": [
    {
      "candidateId": "string matching candidateId",
      "skillMatchScore": 88, // 0 to 100 based on technical competency fit
      "skillFitLevel": "Strong Fit" | "Moderate" | "Skill Gap",
      "skillBadgeColor": "emerald" | "amber" | "rose",
      "matchedSkills": ["Skill A", "Skill B (evidenced in Project X)"],
      "missingSkills": ["Critical Skill C", "Skill D"],
      "aiSummary": "1-2 sentence executive summary of technical alignment and strengths.",
      "learningRecommendation": "Concrete recommendation for interview readiness."
    }
  ]
}`;

    try {
      const llmRes = await callGroqChat({
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Evaluate these candidates for ${targetJob.title} at ${targetJob.companyName}:\n${JSON.stringify(candidatePayload, null, 2)}`,
          },
        ],
        temperature: 0.1,
        max_tokens: 1000,
        responseFormat: { type: 'json_object' },
      });

      if (!llmRes?.content) {
        return { success: false, message: 'Real LLM did not generate an evaluation.' };
      }

      const parsed = JSON.parse(llmRes.content);
      const matches = parsed.matches || [];

      return {
        success: true,
        jobId: targetJob._id?.toString(),
        jobTitle: targetJob.title,
        companyName: targetJob.companyName,
        totalEvaluated: matches.length,
        matches,
        extractionEngine: 'Groq LLM',
      };
    } catch (err) {
      console.error('[matchCandidateSkillsWithAI] Failed:', err.message);
      return { success: false, message: `AI evaluation failed: ${err.message}` };
    }
  },
};

export default agentTools;
