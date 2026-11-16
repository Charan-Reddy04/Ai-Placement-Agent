import { AgentTask } from '../models/AgentTask.js';
import { Student } from '../models/Student.js';
import { Job } from '../models/Job.js';
import { Application } from '../models/Application.js';
import { Interview } from '../models/Interview.js';
import { Notification } from '../models/Notification.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { agentTools } from './agentTools.js';
import { callGroqChat, hasLiveGroqKey } from './groqService.js';

export const agentOrchestrator = {
  // 1. Admin Natural Language Orchestration Engine
  orchestrateAdminRequest: async ({ request, adminUser }) => {
    const trimmedReq = request.trim();
    const reqLower = trimmedReq.toLowerCase();

    // Context query: Load current open jobs and candidates count
    const [openJobs, totalStudents] = await Promise.all([
      Job.find({ status: 'Open' }).limit(5),
      Student.countDocuments(),
    ]);

    // Check if Groq LLM is available for natural language understanding
    let llmResponse = null;
    if (hasLiveGroqKey()) {
      const systemPrompt = `You are CampusPilot AI Placement Agent, an autonomous operations engine for university placement cells.
You assist placement administrators by coordinating recruitment drives, checking deterministic student eligibility, generating shortlist recommendations, and structuring interview timetables.
Available tools:
1. shortlist_candidates: For finding matching eligible candidates.
2. schedule_interviews: For assigning panels, venues, and conflict-free interview slots.
3. analyze_jd: For parsing unstructured job postings.
4. check_eligibility: For verifying student criteria.
5. draft_announcement: For composing placement notices.

Current Open Jobs: ${openJobs.map((j) => `${j.title} at ${j.companyName} (Min CGPA: ${j.minimumCGPA}, CTC: ${j.package})`).join('; ')}.
Total Registered Students: ${totalStudents}.

Respond in clear, professional markdown. If proposing state-changing operations (shortlisting, scheduling, publishing, broadcasting), clearly state that human admin approval is required before execution.`;

      llmResponse = await callGroqChat({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: trimmedReq },
        ],
        temperature: 0.2,
      });
    }

    // Determine intent and execute underlying controlled backend tools
    // INTENT A: Schedule Interviews / Panel Allocation (Prioritized so "schedule interview for shortlisted candidates" routes here)
    if (/schedule|interview\s*slot|timetable|panel\s*allocat/i.test(reqLower)) {
      let targetJob = openJobs[0];
      for (const j of openJobs) {
        if (
          reqLower.includes(j.companyName.toLowerCase()) ||
          reqLower.includes(j.title.toLowerCase())
        ) {
          targetJob = j;
          break;
        }
      }

      const toolResult = await agentTools.scheduleInterviews({
        jobId: targetJob?._id,
      });

      const agentTask = await AgentTask.create({
        requestedBy: adminUser._id,
        userRole: 'admin',
        request: trimmedReq,
        taskType: 'interview-coordination',
        executionStatus: 'Waiting for Approval',
        approvalStatus: 'Pending',
        progress: 80,
        workflowSteps: [
          { id: 1, name: 'Parse Timetable Request', status: 'Completed', detail: 'Identified interview scheduling intent' },
          { id: 2, name: 'Faculty Panel & Venue Verification', status: 'Completed', detail: `Assigned ${toolResult.panelName} at ${toolResult.venueName}` },
          { id: 3, name: 'Generate Non-conflicting Slots', status: 'Completed', detail: `Created ${toolResult.totalSlots} staggered 30-min interview slots` },
          { id: 4, name: 'Human Administrator Approval', status: 'Pending', detail: 'Awaiting admin confirmation to confirm bookings and notify candidates' },
        ],
        toolResults: toolResult,
        proposedSlots: toolResult.slots.map((s) => ({
          slot: `${s.candidateName} (${s.candidateRoll}) - ${s.slot}`,
          capacity: '1 on 1',
          panel: s.panel,
          venue: s.venue,
        })),
        proposedAction: {
          actionType: 'INTERVIEW_SCHEDULE_APPROVAL',
          title: `Confirm Interview Timetable: ${toolResult.companyName}`,
          summary: `Proposing ${toolResult.totalSlots} interview appointments for ${toolResult.date} with ${toolResult.panelName} at ${toolResult.venueName}. No timetable clashes detected.`,
          payload: {
            jobId: toolResult.jobId,
            companyId: toolResult.companyId,
            companyName: toolResult.companyName,
            date: toolResult.date,
            slots: toolResult.slots,
          },
        },
      });

      const messageContent =
        llmResponse?.content ||
        `### Interview Coordination Plan Generated\n\nI have generated conflict-free interview slots for **${toolResult.companyName}** on **${toolResult.date}**.\n\n- **Faculty Evaluation Panel:** ${toolResult.panelName}\n- **Venue:** ${toolResult.venueName}\n- **Total Slots Formatted:** ${toolResult.totalSlots} staggered appointments\n\n**Action Required:** Review the proposed schedule below and click **Approve & Execute** to book venues, assign panels, and send calendar invites.`;

      return {
        message: messageContent,
        task: agentTask,
        toolResult,
      };
    }

    // INTENT B: Shortlist / Find Candidates
    if (
      /shortlist|find\s*(eligible)?\s*candidates|match\s*students|filter\s*students/i.test(
        reqLower
      )
    ) {
      // Find referenced job
      let targetJob = openJobs[0];
      for (const j of openJobs) {
        if (
          reqLower.includes(j.companyName.toLowerCase()) ||
          reqLower.includes(j.title.toLowerCase())
        ) {
          targetJob = j;
          break;
        }
      }

      const toolResult = await agentTools.shortlistCandidates({
        jobId: targetJob?._id,
        limit: 8,
      });

      // Create an AgentTask requiring Human Approval
      const agentTask = await AgentTask.create({
        requestedBy: adminUser._id,
        userRole: 'admin',
        request: trimmedReq,
        taskType: 'candidate-shortlist',
        executionStatus: 'Waiting for Approval',
        approvalStatus: 'Pending',
        progress: 75,
        workflowSteps: [
          { id: 1, name: 'Parse Query Intent', status: 'Completed', detail: 'Identified candidate shortlisting requirement' },
          { id: 2, name: 'Deterministic Criteria Check', status: 'Completed', detail: `CGPA ≥ ${toolResult.criteriaApplied?.minimumCGPA || 7.0}, Backlogs ≤ ${toolResult.criteriaApplied?.maximumActiveBacklogs || 0}` },
          { id: 3, name: 'Candidate Scoring & Ranking', status: 'Completed', detail: `Ranked ${toolResult.count} matching candidate profiles` },
          { id: 4, name: 'Human Administrator Approval', status: 'Pending', detail: 'Awaiting placement officer authorization to execute status update' },
        ],
        toolResults: toolResult,
        proposedShortlist: toolResult.candidates.map((c) => ({
          studentId: c.studentId,
          name: c.name,
          roll: c.roll,
          cgpa: c.cgpa,
          match: c.match,
          skills: c.skills,
        })),
        proposedAction: {
          actionType: 'SHORTLIST_APPROVAL',
          title: `Approve Candidate Shortlist for ${toolResult.companyName}`,
          summary: `The AI Agent has verified ${toolResult.count} candidates who satisfy all academic criteria (CGPA ≥ ${toolResult.criteriaApplied?.minimumCGPA}) and align with required competencies. Approve to update applicant status to 'Shortlisted' and notify students.`,
          payload: {
            jobId: toolResult.jobId,
            companyName: toolResult.companyName,
            jobTitle: toolResult.jobTitle,
            candidateIds: toolResult.candidates.map((c) => c.studentId),
          },
        },
      });

      const messageContent =
        llmResponse?.content ||
        `### AI Placement Agent Analysis\n\nI have evaluated the student database against criteria for **${toolResult.companyName} (${toolResult.jobTitle})**.\n\n- **Deterministic Criteria Applied:** Minimum CGPA ${toolResult.criteriaApplied?.minimumCGPA}, Max ${toolResult.criteriaApplied?.maximumActiveBacklogs} backlogs, branch eligibility.\n- **Top Candidates Identified:** Found **${toolResult.count} verified candidates** satisfying all benchmarks.\n\n**Action Required:** Please review the proposed shortlist below and click **Approve & Execute** to advance candidates and dispatch alerts.`;

      return {
        message: messageContent,
        task: agentTask,
        toolResult,
      };
    }

    // INTENT C: Analyze Job Description Text
    const isJdIntent =
      /analyze.*(jd|job\s*description)|parse.*(jd|job|posting)|extract.*(criteria|requirements)|job\s*description|\bjd\b|hiring\s+for/i.test(
        reqLower
      ) ||
      ((reqLower.includes('package') ||
        reqLower.includes('lpa') ||
        reqLower.includes('ctc') ||
        reqLower.includes('cgpa')) &&
        (reqLower.includes('role') ||
          reqLower.includes('skills') ||
          reqLower.includes('hiring') ||
          reqLower.includes('eligible') ||
          reqLower.includes('position')));

    if (isJdIntent) {
      const toolResult = await agentTools.analyzeJobDescription({ jdText: trimmedReq });

      const agentTask = await AgentTask.create({
        requestedBy: adminUser._id,
        userRole: 'admin',
        request: trimmedReq,
        taskType: 'jd-analysis',
        executionStatus: 'Waiting for Approval',
        approvalStatus: 'Pending',
        progress: 90,
        workflowSteps: [
          {
            id: 1,
            name: 'Parse Unstructured Recruitment Text',
            status: 'Completed',
            detail: `Extracted role '${toolResult.title}' at '${toolResult.companyName}' (${toolResult.package})`,
          },
          {
            id: 2,
            name: 'Skill & Criteria Normalization',
            status: 'Completed',
            detail: `Mapped ${toolResult.requiredSkills?.length || 0} core competencies, CGPA ≥ ${toolResult.minimumCGPA}, backlogs ≤ ${toolResult.maximumActiveBacklogs}`,
          },
          {
            id: 3,
            name: 'Human Administrator Gate',
            status: 'Pending',
            detail: 'Awaiting placement officer authorization to publish recruitment drive',
          },
        ],
        toolResults: toolResult,
        proposedAction: {
          actionType: 'JOB_PUBLISH_APPROVAL',
          title: `Publish Extracted Drive: ${toolResult.companyName} (${toolResult.title})`,
          summary: `Extracted package ${toolResult.package}, min CGPA ${toolResult.minimumCGPA}, max backlogs ${toolResult.maximumActiveBacklogs}, branches: ${toolResult.eligibleBranches?.join(', ')}, and competencies: ${toolResult.requiredSkills?.join(', ')}. Approve to publish live drive.`,
          payload: toolResult,
        },
      });

      const messageContent = `### Job Description Analysis Complete (${toolResult.extractionEngine || 'AI Extraction Engine'})

I have analyzed your input and extracted structured recruitment specifications:

- **Role / Title:** ${toolResult.title}
- **Recruiter:** ${toolResult.companyName}
- **Compensation Package:** ${toolResult.package}
- **Academic Cutoffs:** Minimum CGPA ${toolResult.minimumCGPA} • Max Active Backlogs: ${toolResult.maximumActiveBacklogs}
- **Eligible Branches:** ${toolResult.eligibleBranches?.join(', ')}
- **Key Competencies:** ${toolResult.requiredSkills?.join(', ')}
${toolResult.preferredSkills?.length > 0 ? `- **Preferred Skills:** ${toolResult.preferredSkills.join(', ')}\n` : ''}- **Selection Process:** ${toolResult.rounds?.join(' → ')}

**Human-in-the-Loop Action Required:** Click **Approve & Execute to Database** below to officially publish this recruitment drive to CampusPilot and notify eligible candidates.`;

      return {
        message: messageContent,
        task: agentTask,
        toolResult,
      };
    }

    // INTENT D: General Information & Placement Assistance
    const agentTask = await AgentTask.create({
      requestedBy: adminUser._id,
      userRole: 'admin',
      request: trimmedReq,
      taskType: 'general-query',
      executionStatus: 'Completed',
      approvalStatus: 'Approved',
      progress: 100,
      workflowSteps: [
        { id: 1, name: 'Synthesize Database Context', status: 'Completed', detail: 'Queried placement statistics and live drives' },
      ],
      completedAt: new Date(),
    });

    const defaultMsg =
      llmResponse?.content ||
      `### CampusPilot AI Operations Engine\n\nI am connected to the campus placement database monitoring **${totalStudents} registered candidates** and **${openJobs.length} active recruitment drives**.\n\nYou can ask me to:\n1. *"Shortlist top candidates for ${openJobs[0]?.companyName || 'Microsoft'} SDE role"*\n2. *"Schedule interview rounds for tomorrow with faculty panels"*\n3. *"Analyze this JD text: Cisco hiring for 18 LPA with min 7.0 CGPA"*\n4. *"Broadcast placement reminders to batch 2026"*`;

    return {
      message: defaultMsg,
      task: agentTask,
      toolResult: { openJobsCount: openJobs.length, totalStudents },
    };
  },

  // 2. Approve and Execute Proposed Task Action (Human-In-The-Loop)
  approveTaskAction: async ({ taskId, adminUser }) => {
    const task = await AgentTask.findById(taskId);

    if (!task) {
      throw new Error('Agent task not found.');
    }

    if (task.approvalStatus === 'Approved') {
      return { success: true, message: 'This proposal was already approved and executed.', task };
    }

    const { actionType, payload } = task.proposedAction || {};
    let executionResult = {};

    if (actionType === 'SHORTLIST_APPROVAL') {
      // 1. Advance applications to 'Shortlisted'
      const { jobId, candidateIds = [] } = payload;

      let updatedCount = 0;
      for (const studentId of candidateIds) {
        let app = await Application.findOne({ studentId, jobId });
        if (!app) {
          app = await Application.create({
            studentId,
            jobId,
            eligibilityStatus: 'Eligible',
            status: 'Shortlisted',
            matchScore: 88,
            matchExplanation: 'Shortlisted via AI Placement Agent human-approved proposal.',
          });
        } else {
          app.status = 'Shortlisted';
          await app.save();
        }
        updatedCount++;

        // Notify each student
        const student = await Student.findById(studentId);
        if (student && student.userId) {
          await Notification.create({
            recipientId: student.userId,
            recipientRole: 'student',
            title: `Shortlist Confirmed: ${payload.companyName}`,
            message: `Congratulations! The Placement Cell has officially approved your shortlist nomination for '${payload.jobTitle}' at ${payload.companyName}.`,
            type: 'Application',
          });
        }
      }

      executionResult = {
        candidatesShortlisted: updatedCount,
        companyName: payload.companyName,
        jobTitle: payload.jobTitle,
      };

      await ActivityLog.create({
        actorId: adminUser._id,
        actorName: adminUser.name,
        action: `Approved AI Shortlist for ${payload.companyName}`,
        entityType: 'Application',
        details: { count: updatedCount },
      });
    } else if (actionType === 'INTERVIEW_SCHEDULE_APPROVAL') {
      // 2. Schedule concrete interviews
      const { slots = [], jobId, companyId: pCompanyId, companyName, date: pDate } = payload;
      let scheduledCount = 0;

      // Look up job and resolve companyId to satisfy schema requirements
      let resolvedJob = null;
      if (jobId) {
        resolvedJob = await Job.findById(jobId);
      }
      if (!resolvedJob) {
        resolvedJob = await Job.findOne({ status: 'Open' });
      }

      let resolvedCompanyId = pCompanyId || resolvedJob?.companyId;
      const targetCompanyName = companyName || resolvedJob?.companyName || 'Corporate Partner';

      if (!resolvedCompanyId) {
        let comp = await Company.findOne({
          name: { $regex: new RegExp(`^${targetCompanyName}$`, 'i') },
        });
        if (!comp) {
          comp = await Company.create({
            name: targetCompanyName,
            industry: 'Technology',
            location: 'Onsite / Hybrid',
            tier: 'Tier 1',
            status: 'Active',
          });
        }
        resolvedCompanyId = comp._id;
      }

      const interviewDate =
        pDate ||
        new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      for (const slot of slots) {
        const interview = await Interview.create({
          studentId: slot.studentId,
          jobId: resolvedJob?._id || jobId,
          companyId: resolvedCompanyId,
          panelId: slot.panelId || null,
          venueId: slot.venueId || null,
          round: slot.roundName || 'Technical Round 1',
          roundName: slot.roundName || 'Technical Round 1',
          roundNumber: slot.roundNumber || 1,
          date: interviewDate,
          scheduledDate: new Date(interviewDate),
          startTime: slot.startTime || '10:00 AM',
          endTime: slot.endTime || '10:45 AM',
          duration: '45 mins',
          status: 'Scheduled',
        });
        scheduledCount++;

        const student = await Student.findById(slot.studentId);
        if (student && student.userId) {
          await Notification.create({
            recipientId: student.userId,
            recipientRole: 'student',
            title: `Interview Appointment: ${targetCompanyName}`,
            message: `Your interview slot has been confirmed for ${slot.startTime || '10:00 AM'} on ${interviewDate} at ${slot.venue || 'Interview Lab'}. Evaluation Panel: ${slot.panel || 'Panel Alpha'}.`,
            type: 'Interview',
            metadata: { interviewId: interview._id.toString() },
          });
        }
      }

      executionResult = { interviewsScheduled: scheduledCount, companyName: targetCompanyName, date: interviewDate };

      await ActivityLog.create({
        actorId: adminUser._id,
        actorName: adminUser.name,
        action: `Approved AI Interview Schedule for ${targetCompanyName}`,
        entityType: 'Interview',
        details: { slotsCount: scheduledCount, date: interviewDate },
      });
    } else if (actionType === 'JOB_PUBLISH_APPROVAL') {
      // 3. Publish newly extracted job
      let company = await Company.findOne({
        name: { $regex: new RegExp(payload.companyName, 'i') },
      });
      if (!company) {
        company = await Company.create({
          name: payload.companyName,
          tier: 'Tier 1 (Dream)',
          industry: 'Software / Technology',
          status: 'Active',
        });
      }

      const job = await Job.create({
        companyId: company._id,
        companyName: company.name,
        title: payload.title,
        description: payload.description,
        location: payload.location || 'Pan India / Remote',
        package: payload.package,
        type: 'Full-Time',
        minimumCGPA: payload.minimumCGPA || 6.5,
        maximumActiveBacklogs: payload.maximumActiveBacklogs || 0,
        eligibleBranches: payload.eligibleBranches || ['Computer Science and Engineering'],
        graduationYear: payload.graduationYear || 2026,
        requiredSkills: payload.requiredSkills || ['Python', 'Data Structures'],
        preferredSkills: payload.preferredSkills || [],
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        rounds: payload.rounds || ['Online Assessment', 'Technical Round 1', 'HR Discussion'],
        status: 'Open',
      });

      // Broadcast announcement
      await Notification.create({
        recipientId: null,
        recipientRole: 'student',
        title: `New Placement Drive: ${company.name}`,
        message: `${company.name} is now hiring for '${job.title}' (${job.package}). Check eligibility on CampusPilot.`,
        type: 'Announcement',
      });

      executionResult = { jobCreated: job._id, title: job.title, company: company.name };

      await ActivityLog.create({
        actorId: adminUser._id,
        actorName: adminUser.name,
        action: `Approved & Published Job Opening: ${job.title}`,
        entityType: 'Job',
        entityId: job._id.toString(),
      });
    }

    // Update task
    task.executionStatus = 'Completed';
    task.approvalStatus = 'Approved';
    task.approvedBy = adminUser._id;
    task.completedAt = new Date();
    task.progress = 100;
    task.executionResult = executionResult;
    await task.save();

    return {
      success: true,
      message: 'Proposal successfully approved and applied to database.',
      task,
      executionResult,
    };
  },

  // 3. Reject Proposed Task Action
  rejectTaskAction: async ({ taskId, adminUser, reason = 'Administrative cancellation' }) => {
    const task = await AgentTask.findById(taskId);

    if (!task) {
      throw new Error('Agent task not found.');
    }

    task.executionStatus = 'Cancelled';
    task.approvalStatus = 'Rejected';
    task.completedAt = new Date();
    task.executionResult = { rejectionReason: reason };
    await task.save();

    await ActivityLog.create({
      actorId: adminUser._id,
      actorName: adminUser.name,
      action: 'Rejected AI Proposal',
      entityType: 'AgentTask',
      entityId: task._id.toString(),
      details: { reason },
    });

    return {
      success: true,
      message: 'Proposal rejected and cancelled.',
      task,
    };
  },

  // 4. Student AI Career Assistant Engine
  studentCareerAssistant: async ({ message, studentUser }) => {
    const student = await Student.findOne({ userId: studentUser._id });

    if (!student) {
      throw new Error('Student profile required for personalized career assistant.');
    }

    // Retrieve active jobs
    const activeJobs = await Job.find({ status: 'Open' }).limit(5);

    // Call Groq LLM with authenticated student context if available
    if (hasLiveGroqKey()) {
      const systemPrompt = `You are CampusPilot AI Career Coach, a personalized placement advisor assisting ${studentUser.name}.
Student Placement Profile:
- Branch: ${student.branch}
- CGPA: ${student.cgpa}
- Active Backlogs: ${student.activeBacklogs}
- Technical Skills: ${(student.skills || []).join(', ') || 'None listed yet'}
- Projects: ${(student.projects || []).map((p) => p.title).join(', ') || 'None listed'}
- Certifications: ${(student.certifications || []).map((c) => c.name).join(', ') || 'None'}
- Target Batch: ${student.graduationYear}

Active Placement Drives on Campus:
${activeJobs.map((j) => `- ${j.title} at ${j.companyName} (${j.package}, Min CGPA: ${j.minimumCGPA}, Required: ${(j.requiredSkills || []).join(', ')})`).join('\n')}

Guidelines:
- Provide actionable, encouraging, and highly technical guidance.
- Identify skill gaps between the student's profile and target job descriptions.
- Recommend concrete technical projects and coding topics (e.g., LeetCode patterns, system design, Docker, REST APIs).
- Strictly protect student confidentiality: only reference permitted context.`;

      const response = await callGroqChat({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.3,
      });

      if (response && response.content) {
        return {
          success: true,
          reply: response.content,
          skillGapsIdentified: ['System Design', 'Cloud Deployment (AWS/GCP)', 'Microservices'],
          studentProfile: {
            cgpa: student.cgpa,
            skillsCount: student.skills?.length || 0,
            profileCompletion: student.profileCompletion,
          },
        };
      }
    }

    return {
      success: false,
      message: 'AI Career Coach requires an active Real LLM connection. Please verify your Groq API key.',
    };
  },
};

export default agentOrchestrator;
