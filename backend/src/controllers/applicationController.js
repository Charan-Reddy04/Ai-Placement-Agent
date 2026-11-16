import { Application } from '../models/Application.js';
import { Job } from '../models/Job.js';
import { Student } from '../models/Student.js';
import { Notification } from '../models/Notification.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { evaluateEligibility } from './jobController.js';

// Helper: Calculate deterministic skill match score
const calculateSkillMatch = (studentSkills = [], requiredSkills = [], preferredSkills = []) => {
  if (!requiredSkills || requiredSkills.length === 0) {
    return {
      score: 85,
      matched: studentSkills,
      missing: [],
      explanation: 'General placement profile matches open criteria.',
    };
  }

  const sSkillsLower = studentSkills.map((s) => s.toLowerCase().trim());
  const matchedRequired = requiredSkills.filter((r) =>
    sSkillsLower.includes(r.toLowerCase().trim())
  );
  const missingRequired = requiredSkills.filter(
    (r) => !sSkillsLower.includes(r.toLowerCase().trim())
  );

  const matchedPreferred = preferredSkills.filter((p) =>
    sSkillsLower.includes(p.toLowerCase().trim())
  );

  // Score calculation: 75% weight on required, 25% on preferred
  const reqRatio = matchedRequired.length / requiredSkills.length;
  const prefRatio =
    preferredSkills.length > 0 ? matchedPreferred.length / preferredSkills.length : 1;
  const rawScore = Math.round(reqRatio * 75 + prefRatio * 25);
  const score = Math.max(20, Math.min(100, rawScore));

  const explanation = `Matched ${matchedRequired.length}/${requiredSkills.length} required competencies (${matchedRequired.join(
    ', '
  ) || 'None'}). ${missingRequired.length > 0 ? `Target areas for upskilling: ${missingRequired.join(', ')}.` : 'Strong alignment with tech stack requirements.'}`;

  return { score, matched: matchedRequired, missing: missingRequired, explanation };
};

// @desc    Student: Apply to an open job opportunity
// @route   POST /api/jobs/:id/apply
// @access  Private (Student)
export const applyToJob = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id }).populate('userId', 'name email');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile record not found. Please complete profile registration.',
      });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job opening not found.',
      });
    }

    if (job.status !== 'Open') {
      return res.status(400).json({
        success: false,
        message: `This job is currently '${job.status}' and is not accepting applications.`,
      });
    }

    // Check if application deadline passed
    if (new Date() > new Date(job.applicationDeadline)) {
      return res.status(400).json({
        success: false,
        message: `Application deadline for this role ended on ${new Date(job.applicationDeadline).toLocaleDateString()}.`,
      });
    }

    // Check if duplicate application
    const existingApplication = await Application.findOne({
      studentId: student._id,
      jobId: job._id,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: `You have already applied for this opening on ${new Date(existingApplication.applicationDate).toLocaleDateString()}. Status: ${existingApplication.status}.`,
        data: existingApplication,
      });
    }

    // Deterministic eligibility evaluation
    const { eligible, reasons } = evaluateEligibility(student, job);

    // Calculate skill match
    const skillMatch = calculateSkillMatch(
      student.skills,
      job.requiredSkills,
      job.preferredSkills
    );

    const applicationStatus = eligible ? 'Applied' : 'Ineligible';
    const eligibilityStatus = eligible ? 'Eligible' : 'Ineligible';

    const matchExplanation = eligible
      ? skillMatch.explanation
      : `Marked Ineligible due to: ${reasons.join('; ')}. ${skillMatch.explanation}`;

    const application = await Application.create({
      studentId: student._id,
      jobId: job._id,
      eligibilityStatus,
      status: applicationStatus,
      matchScore: skillMatch.score,
      matchExplanation,
      reviewNotes: eligible ? '' : reasons.join(' | '),
    });

    // Increment applicant count on job
    job.applicantCount += 1;
    await job.save();

    // Create confirmation notification for student
    await Notification.create({
      recipientId: req.user._id,
      recipientRole: 'student',
      title: `Application Confirmed: ${job.companyName}`,
      message: `Your application for '${job.title}' at ${job.companyName} has been received with status: '${applicationStatus}'. Initial skill compatibility score: ${skillMatch.score}%.`,
      type: 'Application',
      metadata: { applicationId: application._id.toString(), jobId: job._id.toString() },
    });

    // Create Activity Log
    await ActivityLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      action: 'Submitted Job Application',
      entityType: 'Application',
      entityId: application._id.toString(),
      details: {
        jobTitle: job.title,
        companyName: job.companyName,
        eligibilityStatus,
        matchScore: skillMatch.score,
      },
    });

    res.status(201).json({
      success: true,
      message: eligible
        ? 'Application successfully submitted!'
        : 'Application submitted, but flagged as ineligible based on academic criteria.',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all applications with search and filters
// @route   GET /api/applications
// @access  Private (Admin)
export const getApplications = async (req, res, next) => {
  try {
    const { jobId, companyId, status, eligibilityStatus, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (jobId && jobId !== 'all') {
      query.jobId = jobId;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (eligibilityStatus && eligibilityStatus !== 'all') {
      query.eligibilityStatus = eligibilityStatus;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const applications = await Application.find(query)
      .populate({
        path: 'studentId',
        select: 'rollNumber branch cgpa activeBacklogs skills profileCompletion userId resume',
        populate: {
          path: 'userId',
          select: 'name email avatar',
        },
      })
      .populate({
        path: 'jobId',
        select: 'title companyName location package type minimumCGPA eligibleBranches status',
        populate: {
          path: 'companyId',
          select: 'name tier',
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Optional client search filter across student name or rollNumber
    let filtered = applications;
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filtered = applications.filter((app) => {
        const studentName = app.studentId?.userId?.name || '';
        const rollNumber = app.studentId?.rollNumber || '';
        const jobTitle = app.jobId?.title || '';
        const companyName = app.jobId?.companyName || '';
        return (
          searchRegex.test(studentName) ||
          searchRegex.test(rollNumber) ||
          searchRegex.test(jobTitle) ||
          searchRegex.test(companyName)
        );
      });
    }

    const total = await Application.countDocuments(query);

    res.status(200).json({
      success: true,
      count: filtered.length,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: filtered,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single application by ID
// @route   GET /api/applications/:id
// @access  Private (Authenticated)
export const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email avatar' },
      })
      .populate({
        path: 'jobId',
        populate: { path: 'companyId' },
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Access check: Only the owning student or an admin may view
    if (
      req.user.role === 'student' &&
      application.studentId.userId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this application.',
      });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update candidate application status & review notes
// @route   PATCH /api/applications/:id/status
// @access  Private (Admin)
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, reviewNotes } = req.body;

    const application = await Application.findById(req.params.id)
      .populate('studentId')
      .populate('jobId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    const previousStatus = application.status;
    application.status = status;
    if (reviewNotes !== undefined) {
      application.reviewNotes = reviewNotes;
    }
    await application.save();

    // Log administrative action
    await ActivityLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      action: `Updated Application Status to ${status}`,
      entityType: 'Application',
      entityId: application._id.toString(),
      details: {
        previousStatus,
        newStatus: status,
        jobTitle: application.jobId.title,
        companyName: application.jobId.companyName,
      },
    });

    // Notify the student regarding status progress
    if (application.studentId && application.studentId.userId) {
      await Notification.create({
        recipientId: application.studentId.userId,
        recipientRole: 'student',
        title: `Placement Status Updated: ${application.jobId.companyName}`,
        message: `Your application status for '${application.jobId.title}' has been moved from '${previousStatus}' to '${status}'. ${reviewNotes ? `Note: "${reviewNotes}"` : ''}`,
        type: 'Application',
        metadata: {
          applicationId: application._id.toString(),
          jobId: application.jobId._id.toString(),
          status,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: `Application status updated to '${status}' successfully.`,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

