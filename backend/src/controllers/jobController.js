import { Job } from '../models/Job.js';
import { Company } from '../models/Company.js';
import { Student } from '../models/Student.js';
import { Application } from '../models/Application.js';
import { Notification } from '../models/Notification.js';
import { ActivityLog } from '../models/ActivityLog.js';

// Helper: Normalize string for flexible matching
const normalizeStr = (str) => (str || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');

// Helper: Deterministic eligibility calculator
export const evaluateEligibility = (student, job) => {
  const reasons = [];
  let eligible = true;

  if (student.cgpa < job.minimumCGPA) {
    eligible = false;
    reasons.push(
      `CGPA requirement not met: minimum ${job.minimumCGPA} required, current is ${student.cgpa.toFixed(2)}.`
    );
  }

  if (student.activeBacklogs > job.maximumActiveBacklogs) {
    eligible = false;
    reasons.push(
      `Backlog threshold exceeded: max ${job.maximumActiveBacklogs} allowed, current has ${student.activeBacklogs} active backlog(s).`
    );
  }

  if (job.eligibleBranches && job.eligibleBranches.length > 0) {
    const sNorm = normalizeStr(student.branch);
    const isBranchAllowed = job.eligibleBranches.some((b) => {
      const bNorm = normalizeStr(b);
      return (
        bNorm === 'all' ||
        bNorm === sNorm ||
        sNorm.includes(bNorm) ||
        bNorm.includes(sNorm) ||
        (bNorm === 'cse' && sNorm.includes('computerscience')) ||
        (sNorm === 'cse' && bNorm.includes('computerscience')) ||
        (bNorm === 'it' && sNorm.includes('informationtechnology')) ||
        (sNorm === 'it' && bNorm.includes('informationtechnology')) ||
        (bNorm === 'ece' && sNorm.includes('electronics')) ||
        (sNorm === 'ece' && bNorm.includes('electronics'))
      );
    });

    if (!isBranchAllowed) {
      eligible = false;
      reasons.push(
        `Branch mismatch: allowed branches are ${job.eligibleBranches.join(', ')}, student is from ${student.branch}.`
      );
    }
  }

  if (job.graduationYear && student.graduationYear !== job.graduationYear) {
    eligible = false;
    reasons.push(
      `Batch year mismatch: target batch is ${job.graduationYear}, student is graduating in ${student.graduationYear}.`
    );
  }

  return { eligible, reasons };
};

// @desc    Get all jobs with search and filters
// @route   GET /api/jobs
// @access  Private (Authenticated)
export const getJobs = async (req, res, next) => {
  try {
    const { search, companyId, branch, minCgpa, type, status } = req.query;
    const query = {};

    if (req.user.role === 'student') {
      query.status = 'Open';
    } else if (status && status !== 'all') {
      query.status = status;
    }

    if (companyId) {
      query.companyId = companyId;
    }

    if (type && type !== 'all') {
      query.type = type;
    }

    if (minCgpa) {
      query.minimumCGPA = { $lte: Number(minCgpa) };
    }

    if (branch && branch !== 'all') {
      query.eligibleBranches = { $in: [new RegExp(branch, 'i'), 'All'] };
    }

    if (search) {
      query.$or = [
        { title: { $regex: new RegExp(search, 'i') } },
        { companyName: { $regex: new RegExp(search, 'i') } },
        { requiredSkills: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const jobs = await Job.find(query)
      .populate('companyId', 'name tier industry website contactEmail')
      .sort({ createdAt: -1 })
      .lean();

    // If user is a student, attach their specific eligibility and applied status
    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user._id });
      if (student) {
        const studentApplications = await Application.find({
          studentId: student._id,
        }).select('jobId status eligibilityStatus');

        const appliedJobMap = new Map();
        studentApplications.forEach((app) => {
          appliedJobMap.set(app.jobId.toString(), app);
        });

        const annotatedJobs = jobs.map((job) => {
          const evalResult = evaluateEligibility(student, job);
          const application = appliedJobMap.get(job._id.toString());

          return {
            ...job,
            isEligible: evalResult.eligible,
            ineligibilityReasons: evalResult.reasons,
            hasApplied: !!application,
            applicationStatus: application ? application.status : null,
          };
        });

        return res.status(200).json({
          success: true,
          count: annotatedJobs.length,
          data: annotatedJobs,
        });
      }
    }

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Private (Authenticated)
export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      'companyId',
      'name tier industry website description'
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job opening not found',
      });
    }

    let extraInfo = {};
    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user._id });
      if (student) {
        const evalResult = evaluateEligibility(student, job);
        const application = await Application.findOne({
          studentId: student._id,
          jobId: job._id,
        });

        extraInfo = {
          isEligible: evalResult.eligible,
          ineligibilityReasons: evalResult.reasons,
          hasApplied: !!application,
          applicationStatus: application ? application.status : null,
        };
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...job.toObject(),
        ...extraInfo,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Create new job opening
// @route   POST /api/jobs
// @access  Private (Admin)
export const createJob = async (req, res, next) => {
  try {
    const {
      companyId,
      title,
      description,
      location,
      package: ctcPackage,
      type,
      minimumCGPA,
      maximumActiveBacklogs,
      eligibleBranches,
      graduationYear,
      requiredSkills,
      preferredSkills,
      experienceRequirements,
      applicationDeadline,
      rounds,
      status,
    } = req.body;

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Associated recruiting company not found.',
      });
    }

    const job = await Job.create({
      companyId: company._id,
      companyName: company.name,
      title: title.trim(),
      description,
      location: location || 'Pan India / Remote',
      package: ctcPackage,
      type: type || 'Full-Time',
      minimumCGPA: minimumCGPA !== undefined ? minimumCGPA : 6.0,
      maximumActiveBacklogs: maximumActiveBacklogs !== undefined ? maximumActiveBacklogs : 0,
      eligibleBranches: eligibleBranches || [
        'Computer Science & Engineering',
        'Information Technology',
      ],
      graduationYear: graduationYear || 2026,
      requiredSkills: requiredSkills || [],
      preferredSkills: preferredSkills || [],
      experienceRequirements: experienceRequirements || 'Freshers (2026 Batch)',
      applicationDeadline: new Date(applicationDeadline),
      rounds: rounds || ['Online Assessment', 'Technical Round 1', 'HR Discussion'],
      status: status || 'Open',
    });

    // Create Activity Log
    await ActivityLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      action: 'Created Job Opening',
      entityType: 'Job',
      entityId: job._id.toString(),
      details: {
        title: job.title,
        companyName: company.name,
        package: job.package,
      },
    });

    // Broadcast Announcement Notification to all students
    if (job.status === 'Open') {
      await Notification.create({
        recipientId: null,
        recipientRole: 'student',
        title: `New Placement Drive: ${company.name}`,
        message: `${company.name} has opened recruitment for '${job.title}' (${job.package}). Check eligibility and apply before ${new Date(job.applicationDeadline).toLocaleDateString()}.`,
        type: 'Announcement',
        metadata: { jobId: job._id.toString(), companyName: company.name },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Job opening created successfully',
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update job details
// @route   PUT /api/jobs/:id
// @access  Private (Admin)
export const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job opening not found',
      });
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    await ActivityLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      action: 'Updated Job Details',
      entityType: 'Job',
      entityId: updatedJob._id.toString(),
      details: {
        title: updatedJob.title,
        companyName: updatedJob.companyName,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Job opening updated successfully',
      data: updatedJob,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Toggle or update job status (Draft/Open/Closed)
// @route   PATCH /api/jobs/:id/status
// @access  Private (Admin)
export const updateJobStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job opening not found',
      });
    }

    job.status = status;
    await job.save();

    await ActivityLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      action: `Changed Job Status to ${status}`,
      entityType: 'Job',
      entityId: job._id.toString(),
      details: { title: job.title, newStatus: status },
    });

    res.status(200).json({
      success: true,
      message: `Job status updated to ${status}`,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deterministic eligibility check for student against job
// @route   POST /api/jobs/:id/check-eligibility
// @access  Private (Authenticated)
export const checkJobEligibility = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job opening not found',
      });
    }

    let student;
    if (req.user.role === 'student') {
      student = await Student.findOne({ userId: req.user._id });
    } else if (req.body.studentId) {
      student = await Student.findById(req.body.studentId);
    }

    if (!student) {
      return res.status(400).json({
        success: false,
        message: 'Student profile required to verify eligibility',
      });
    }

    const { eligible, reasons } = evaluateEligibility(student, job);

    res.status(200).json({
      success: true,
      data: {
        jobId: job._id,
        jobTitle: job.title,
        companyName: job.companyName,
        eligible,
        reasons,
        studentMetrics: {
          cgpa: student.cgpa,
          activeBacklogs: student.activeBacklogs,
          branch: student.branch,
          graduationYear: student.graduationYear,
        },
        jobCriteria: {
          minimumCGPA: job.minimumCGPA,
          maximumActiveBacklogs: job.maximumActiveBacklogs,
          eligibleBranches: job.eligibleBranches,
          graduationYear: job.graduationYear,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
