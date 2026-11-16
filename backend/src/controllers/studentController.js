import { Student } from '../models/Student.js';
import { Application } from '../models/Application.js';
import { Interview } from '../models/Interview.js';
import { ActivityLog } from '../models/ActivityLog.js';

// @desc    Get currently logged-in student's profile
// @route   GET /api/students/me
// @access  Private (Student)
export const getMyProfile = async (req, res, next) => {
  try {
    let student = await Student.findOne({ userId: req.user._id }).populate(
      'userId',
      'name email avatar role isEmailVerified'
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found. Please contact administration.',
      });
    }

    student.calculateCompletion();
    await student.save();

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update logged-in student's profile details
// @route   PUT /api/students/me
// @access  Private (Student)
export const updateMyProfile = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    const {
      phone,
      department,
      branch,
      cgpa,
      activeBacklogs,
      graduationYear,
      skills,
      softSkills,
      github,
      linkedin,
      projects,
      certifications,
    } = req.body;

    if (phone !== undefined) student.phone = phone;
    if (department !== undefined) student.department = department;
    if (branch !== undefined) student.branch = branch;
    if (cgpa !== undefined) student.cgpa = cgpa;
    if (activeBacklogs !== undefined) student.activeBacklogs = activeBacklogs;
    if (graduationYear !== undefined) student.graduationYear = graduationYear;
    if (skills !== undefined) student.skills = skills;
    if (softSkills !== undefined) student.softSkills = softSkills;
    if (github !== undefined) student.github = github;
    if (linkedin !== undefined) student.linkedin = linkedin;
    if (projects !== undefined) student.projects = projects;
    if (certifications !== undefined) student.certifications = certifications;

    student.calculateCompletion();
    await student.save();

    await ActivityLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      action: 'Updated Profile Details',
      entityType: 'Student',
      entityId: student._id.toString(),
      details: { completion: student.profileCompletion },
    });

    const populatedStudent = await Student.findById(student._id).populate(
      'userId',
      'name email avatar role'
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: populatedStudent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload student resume document (PDF, DOC, DOCX)
// @route   POST /api/students/me/resume
// @access  Private (Student)
export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid resume file (PDF, DOC, DOCX up to 5MB)',
      });
    }

    const student = await Student.findOne({ userId: req.user._id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    student.resume = {
      url: `/uploads/resumes/${req.file.filename}`,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      uploadedAt: new Date(),
    };

    student.calculateCompletion();
    await student.save();

    await ActivityLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      action: 'Uploaded Resume Document',
      entityType: 'Student',
      entityId: student._id.toString(),
      details: {
        fileName: req.file.originalname,
        fileSize: req.file.size,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Resume uploaded and verified successfully',
      data: {
        resume: student.resume,
        profileCompletion: student.profileCompletion,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's submitted applications
// @route   GET /api/students/me/applications
// @access  Private (Student)
export const getMyApplications = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found',
      });
    }

    const applications = await Application.find({ studentId: student._id })
      .populate({
        path: 'jobId',
        select:
          'title companyName location package type minimumCGPA maximumActiveBacklogs eligibleBranches applicationDeadline status rounds',
        populate: {
          path: 'companyId',
          select: 'name tier industry website',
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's scheduled interviews
// @route   GET /api/students/me/interviews
// @access  Private (Student)
export const getMyInterviews = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found',
      });
    }

    const interviews = await Interview.find({ studentId: student._id })
      .populate('jobId', 'title companyName package rounds')
      .populate('companyId', 'name tier website')
      .populate('panelId', 'name members department')
      .populate('venueId', 'name building roomNumber type meetingLink')
      .sort({ scheduledDate: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: interviews.length,
      data: interviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all students with filtering & candidate search
// @route   GET /api/students
// @access  Private (Admin)
export const getAllStudents = async (req, res, next) => {
  try {
    const { branch, minCgpa, maxBacklogs, skill, search, page = 1, limit = 50 } = req.query;

    const query = {};

    if (branch && branch !== 'all') {
      query.branch = branch;
    }

    if (minCgpa) {
      query.cgpa = { $gte: Number(minCgpa) };
    }

    if (maxBacklogs !== undefined && maxBacklogs !== '') {
      query.activeBacklogs = { $lte: Number(maxBacklogs) };
    }

    if (skill) {
      query.skills = { $regex: new RegExp(skill, 'i') };
    }

    if (search) {
      query.$or = [
        { rollNumber: { $regex: new RegExp(search, 'i') } },
        { department: { $regex: new RegExp(search, 'i') } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const students = await Student.find(query)
      .populate('userId', 'name email avatar role')
      .sort({ cgpa: -1, rollNumber: 1 })
      .skip(skip)
      .limit(Number(limit));

    // If search also matches student name or email in User model, filter/expand
    let filteredStudents = students;
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filteredStudents = students.filter(
        (s) =>
          searchRegex.test(s.rollNumber) ||
          searchRegex.test(s.userId?.name || '') ||
          searchRegex.test(s.userId?.email || '')
      );
    }

    const total = await Student.countDocuments(query);

    res.status(200).json({
      success: true,
      count: filteredStudents.length,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: filteredStudents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get single student by ID
// @route   GET /api/students/:id
// @access  Private (Admin)
export const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate(
      'userId',
      'name email avatar role'
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const applications = await Application.find({ studentId: student._id })
      .populate('jobId', 'title companyName package status')
      .sort({ createdAt: -1 });

    const interviews = await Interview.find({ studentId: student._id })
      .populate('jobId', 'title companyName')
      .populate('panelId', 'name')
      .populate('venueId', 'name roomNumber')
      .sort({ scheduledDate: 1 });

    res.status(200).json({
      success: true,
      data: {
        student,
        applications,
        interviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

