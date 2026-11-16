import { Interview } from '../models/Interview.js';
import { Panel } from '../models/Panel.js';
import { Venue } from '../models/Venue.js';
import { Student } from '../models/Student.js';
import { Job } from '../models/Job.js';
import { Notification } from '../models/Notification.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { checkInterviewConflict, normalizeDateString } from '../utils/conflictUtils.js';

// @desc    Get interviews list (role-aware, with filters)
// @route   GET /api/interviews
// @access  Private (Authenticated)
export const getInterviews = async (req, res, next) => {
  try {
    const query = {};

    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user._id });
      if (!student) {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }
      query.studentId = student._id;
    } else {
      const { status, companyId, panelId, venueId, date, search } = req.query;
      if (status && status !== 'all' && status !== 'All') {
        query.status = status;
      }
      if (companyId) query.companyId = companyId;
      if (panelId) query.panelId = panelId;
      if (venueId) query.venueId = venueId;

      if (date && date !== 'All') {
        const normDate = normalizeDateString(date);
        query.$or = [{ date: normDate }, { date: date }];
      }
    }

    let interviews = await Interview.find(query)
      .populate({
        path: 'studentId',
        select: 'rollNumber branch cgpa userId',
        populate: { path: 'userId', select: 'name email avatar' },
      })
      .populate('companyId', 'name tier website logo')
      .populate('jobId', 'title package rounds companyName')
      .populate('panelId', 'name lead department members specialization availability status activeSlots')
      .populate('venueId', 'name location building roomNumber type capacity facilities meetingLink status')
      .sort({ date: 1, scheduledDate: 1, startTime: 1 });

    // Optional in-memory text search filter if admin queried search
    if (req.query.search) {
      const q = req.query.search.toLowerCase();
      interviews = interviews.filter((item) => {
        const candidateName = item.studentId?.userId?.name?.toLowerCase() || '';
        const roll = item.studentId?.rollNumber?.toLowerCase() || '';
        const comp = item.companyId?.name?.toLowerCase() || '';
        const jobTitle = item.jobId?.title?.toLowerCase() || '';
        const round = item.round?.toLowerCase() || '';
        return (
          candidateName.includes(q) ||
          roll.includes(q) ||
          comp.includes(q) ||
          jobTitle.includes(q) ||
          round.includes(q)
        );
      });
    }

    res.status(200).json({
      success: true,
      count: interviews.length,
      data: interviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deterministic conflict checking endpoint
// @route   POST /api/interviews/check-conflict
// @access  Private (Admin)
export const checkConflict = async (req, res, next) => {
  try {
    const { studentId, panelId, venueId, date, startTime, endTime, excludeInterviewId } = req.body;

    const result = await checkInterviewConflict({
      studentId,
      panelId,
      venueId,
      date,
      startTime,
      endTime,
      excludeInterviewId,
    });

    res.status(200).json({
      success: true,
      hasConflict: result.hasConflict,
      conflicts: result.conflicts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single interview details
// @route   GET /api/interviews/:id
// @access  Private (Authenticated)
export const getInterviewById = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate({
        path: 'studentId',
        select: 'rollNumber branch cgpa userId',
        populate: { path: 'userId', select: 'name email avatar' },
      })
      .populate('companyId', 'name tier website logo')
      .populate('jobId', 'title package rounds companyName')
      .populate('panelId', 'name lead department members specialization availability')
      .populate('venueId', 'name location building roomNumber type capacity facilities meetingLink');

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview slot not found' });
    }

    // Role check: students can only see their own interview
    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user._id });
      if (!student || interview.studentId._id.toString() !== student._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied to this interview slot' });
      }
    }

    res.status(200).json({ success: true, data: interview });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Schedule a new interview session
// @route   POST /api/interviews
// @access  Private (Admin)
export const createInterview = async (req, res, next) => {
  try {
    const {
      studentId,
      companyId,
      jobId,
      panelId,
      venueId,
      round,
      roundName,
      date,
      scheduledDate,
      startTime,
      endTime,
      duration,
      meetingLink,
      notes,
    } = req.body;

    const student = await Student.findById(studentId).populate('userId', 'name email');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student candidate record not found' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job record not found' });
    }

    const resolvedCompanyId = companyId || job.companyId;
    const finalRound = round || roundName || 'Technical Round 1';
    const finalDate = date || normalizeDateString(scheduledDate);
    const finalDuration = duration || '45 mins';

    // Conflict Check
    const conflictResult = await checkInterviewConflict({
      studentId,
      panelId,
      venueId,
      date: finalDate,
      startTime,
      endTime,
    });

    if (conflictResult.hasConflict) {
      return res.status(409).json({
        success: false,
        message: 'Scheduling conflict detected for candidate, panel, or venue.',
        conflicts: conflictResult.conflicts,
      });
    }

    // Get venue virtual link if virtual
    let finalMeetingLink = meetingLink || '';
    if (venueId && !finalMeetingLink) {
      const venueDoc = await Venue.findById(venueId);
      if (venueDoc && venueDoc.meetingLink) {
        finalMeetingLink = venueDoc.meetingLink;
      }
    }

    const interview = await Interview.create({
      studentId,
      companyId: resolvedCompanyId,
      jobId,
      panelId: panelId || null,
      venueId: venueId || null,
      round: finalRound,
      roundName: finalRound,
      date: finalDate,
      scheduledDate: new Date(finalDate),
      startTime,
      endTime: endTime || '',
      duration: finalDuration,
      meetingLink: finalMeetingLink,
      notes: notes || '',
      status: 'Confirmed',
      outcome: 'Pending',
    });

    // Increment active slots on Panel if assigned
    if (panelId) {
      await Panel.findByIdAndUpdate(panelId, { $inc: { activeSlots: 1 } });
    }

    // Notify the student about the scheduled interview
    await Notification.create({
      recipientId: student.userId._id,
      recipientRole: 'student',
      title: `Interview Scheduled: ${job.companyName} (${finalRound})`,
      message: `Your interview for ${job.title} at ${job.companyName} has been confirmed for ${finalDate} at ${startTime}${endTime ? ` - ${endTime}` : ''}.`,
      type: 'Interview',
      deliveryStatus: 'Delivered',
      metadata: { interviewId: interview._id.toString(), jobId: job._id.toString() },
    });

    // Log Activity
    await ActivityLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      action: 'Scheduled Interview',
      entityType: 'Interview',
      entityId: interview._id.toString(),
      details: {
        candidateName: student.userId.name,
        companyName: job.companyName,
        round: finalRound,
        date: finalDate,
        startTime,
      },
    });

    const populated = await Interview.findById(interview._id)
      .populate({
        path: 'studentId',
        select: 'rollNumber branch cgpa userId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('companyId', 'name tier')
      .populate('jobId', 'title')
      .populate('panelId', 'name lead')
      .populate('venueId', 'name location roomNumber type meetingLink');

    res.status(201).json({
      success: true,
      message: 'Interview successfully scheduled and candidate notified',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Reschedule or update interview slot
// @route   PUT /api/interviews/:id
// @access  Private (Admin)
export const updateInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('jobId', 'title companyName');

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    const {
      round,
      roundName,
      date,
      scheduledDate,
      startTime,
      endTime,
      duration,
      panelId,
      venueId,
      meetingLink,
      notes,
      status,
    } = req.body;

    const targetDate = date || (scheduledDate ? normalizeDateString(scheduledDate) : interview.date);
    const targetStartTime = startTime || interview.startTime;
    const targetEndTime = endTime || interview.endTime;
    const targetPanelId = panelId !== undefined ? panelId : interview.panelId;
    const targetVenueId = venueId !== undefined ? venueId : interview.venueId;

    // Run conflict check if time, date, panel, or venue changed
    const conflictResult = await checkInterviewConflict({
      studentId: interview.studentId._id,
      panelId: targetPanelId,
      venueId: targetVenueId,
      date: targetDate,
      startTime: targetStartTime,
      endTime: targetEndTime,
      excludeInterviewId: interview._id.toString(),
    });

    if (conflictResult.hasConflict) {
      return res.status(409).json({
        success: false,
        message: 'Conflict detected during reschedule.',
        conflicts: conflictResult.conflicts,
      });
    }

    // Update panel activeSlots count if panel changed
    if (panelId && interview.panelId && panelId.toString() !== interview.panelId.toString()) {
      await Panel.findByIdAndUpdate(interview.panelId, { $inc: { activeSlots: -1 } });
      await Panel.findByIdAndUpdate(panelId, { $inc: { activeSlots: 1 } });
    }

    if (round || roundName) {
      interview.round = round || roundName;
      interview.roundName = round || roundName;
    }
    if (targetDate) {
      interview.date = targetDate;
      interview.scheduledDate = new Date(targetDate);
    }
    if (startTime) interview.startTime = startTime;
    if (endTime !== undefined) interview.endTime = endTime;
    if (duration) interview.duration = duration;
    if (panelId !== undefined) interview.panelId = panelId || null;
    if (venueId !== undefined) interview.venueId = venueId || null;
    if (meetingLink !== undefined) interview.meetingLink = meetingLink;
    if (notes !== undefined) interview.notes = notes;
    if (status) interview.status = status;

    await interview.save();

    // Notify student about reschedule
    await Notification.create({
      recipientId: interview.studentId.userId._id,
      recipientRole: 'student',
      title: `Interview Updated: ${interview.jobId?.companyName || 'Recruiter'}`,
      message: `Your interview has been updated to ${targetDate} at ${targetStartTime}.`,
      type: 'Interview',
      deliveryStatus: 'Delivered',
      metadata: { interviewId: interview._id.toString() },
    });

    // Log Activity
    await ActivityLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      action: 'Rescheduled Interview',
      entityType: 'Interview',
      entityId: interview._id.toString(),
      details: {
        candidateName: interview.studentId.userId.name,
        companyName: interview.jobId?.companyName,
        date: targetDate,
        startTime: targetStartTime,
      },
    });

    const populated = await Interview.findById(interview._id)
      .populate({
        path: 'studentId',
        select: 'rollNumber branch cgpa userId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('companyId', 'name')
      .populate('jobId', 'title')
      .populate('panelId', 'name lead')
      .populate('venueId', 'name location roomNumber');

    res.status(200).json({
      success: true,
      message: 'Interview slot successfully updated',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update interview status, outcome, rating, and feedback
// @route   PATCH /api/interviews/:id/status
// @access  Private (Admin)
export const updateInterviewStatus = async (req, res, next) => {
  try {
    const { status, outcome, rating, feedback, notes } = req.body;

    const interview = await Interview.findById(req.params.id)
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('jobId', 'title companyName')
      .populate('panelId', 'name');

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    const previousStatus = interview.status;

    if (status) interview.status = status;
    if (outcome) interview.outcome = outcome;
    if (rating !== undefined) interview.rating = Number(rating);
    if (feedback !== undefined) interview.feedback = feedback;
    if (notes !== undefined) interview.notes = notes;

    // Decrement activeSlots if moved to Completed or Cancelled
    if (
      interview.panelId &&
      (status === 'Completed' || status === 'Cancelled') &&
      previousStatus !== 'Completed' &&
      previousStatus !== 'Cancelled'
    ) {
      await Panel.findByIdAndUpdate(interview.panelId._id, {
        $inc: { activeSlots: -1 },
      });
    }

    await interview.save();

    // If evaluated with outcome, notify candidate
    if (outcome && outcome !== 'Pending') {
      await Notification.create({
        recipientId: interview.studentId.userId._id,
        recipientRole: 'student',
        title: `Interview Result Published: ${interview.jobId?.companyName}`,
        message: `Your interview outcome for ${interview.round} at ${interview.jobId?.companyName} is: ${outcome}. Feedback: "${feedback || 'No comments'}"`,
        type: 'Interview',
        deliveryStatus: 'Delivered',
        metadata: { interviewId: interview._id.toString() },
      });
    }

    // Log Activity
    await ActivityLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      action: `Updated Interview Status to ${interview.status}`,
      entityType: 'Interview',
      entityId: interview._id.toString(),
      details: {
        candidateName: interview.studentId.userId.name,
        companyName: interview.jobId?.companyName,
        status: interview.status,
        outcome: interview.outcome,
        rating: interview.rating,
      },
    });

    res.status(200).json({
      success: true,
      message: `Interview status successfully updated to ${interview.status}`,
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Delete or cancel interview
// @route   DELETE /api/interviews/:id
// @access  Private (Admin)
export const deleteInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('jobId', 'companyName');

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    if (interview.panelId && interview.status !== 'Cancelled' && interview.status !== 'Completed') {
      await Panel.findByIdAndUpdate(interview.panelId, { $inc: { activeSlots: -1 } });
    }

    await Interview.findByIdAndDelete(req.params.id);

    // Notify student
    if (interview.studentId?.userId) {
      await Notification.create({
        recipientId: interview.studentId.userId._id,
        recipientRole: 'student',
        title: `Interview Cancelled: ${interview.jobId?.companyName || 'Recruiter'}`,
        message: `Your interview scheduled for ${interview.date} at ${interview.startTime} has been cancelled.`,
        type: 'Alert',
        deliveryStatus: 'Delivered',
      });
    }

    // Log Activity
    await ActivityLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      action: 'Cancelled Interview Slot',
      entityType: 'Interview',
      entityId: req.params.id,
      details: {
        candidateName: interview.studentId?.userId?.name,
        companyName: interview.jobId?.companyName,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Interview slot successfully removed',
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// FACULTY PANEL MANAGEMENT CONTROLLERS
// ==========================================

// @desc    Get all faculty evaluation panels
// @route   GET /api/interviews/panels
// @access  Private (Authenticated)
export const getPanels = async (req, res, next) => {
  try {
    const panels = await Panel.find().sort({ department: 1, name: 1 });
    res.status(200).json({ success: true, count: panels.length, data: panels });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single faculty evaluation panel
// @route   GET /api/interviews/panels/:id
// @access  Private (Authenticated)
export const getPanelById = async (req, res, next) => {
  try {
    const panel = await Panel.findById(req.params.id);
    if (!panel) {
      return res.status(404).json({ success: false, message: 'Panel not found' });
    }
    res.status(200).json({ success: true, data: panel });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Create evaluation panel
// @route   POST /api/interviews/panels
// @access  Private (Admin)
export const createPanel = async (req, res, next) => {
  try {
    const { name, lead, department, members, specialization, availability, maxCapacity } = req.body;

    const panel = await Panel.create({
      name,
      lead: lead || (members && members[0]?.name) || 'Faculty Lead',
      department: department || 'School of Computing',
      members: members && members.length > 0 ? members : [{ name: lead || 'Lead Faculty' }],
      specialization: specialization || 'General Technical & HR Evaluation',
      availability: availability || 'Mon - Fri (10:00 AM - 04:00 PM)',
      maxCapacity: maxCapacity || 15,
      status: 'Available',
    });

    // Log Activity
    await ActivityLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      action: 'Created Faculty Panel',
      entityType: 'Panel',
      entityId: panel._id.toString(),
      details: { panelName: panel.name, lead: panel.lead },
    });

    res.status(201).json({ success: true, message: 'Panel created successfully', data: panel });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update evaluation panel
// @route   PUT /api/interviews/panels/:id
// @access  Private (Admin)
export const updatePanel = async (req, res, next) => {
  try {
    const panel = await Panel.findById(req.params.id);
    if (!panel) {
      return res.status(404).json({ success: false, message: 'Panel not found' });
    }

    const { name, lead, department, members, specialization, availability, status, maxCapacity } = req.body;
    if (name) panel.name = name;
    if (lead) panel.lead = lead;
    if (department) panel.department = department;
    if (members) panel.members = members;
    if (specialization) panel.specialization = specialization;
    if (availability) panel.availability = availability;
    if (status) panel.status = status;
    if (maxCapacity !== undefined) panel.maxCapacity = maxCapacity;

    await panel.save();

    res.status(200).json({ success: true, message: 'Panel updated successfully', data: panel });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Delete evaluation panel
// @route   DELETE /api/interviews/panels/:id
// @access  Private (Admin)
export const deletePanel = async (req, res, next) => {
  try {
    const panel = await Panel.findById(req.params.id);
    if (!panel) {
      return res.status(404).json({ success: false, message: 'Panel not found' });
    }

    // Check if panel has active interviews
    const activeInterviews = await Interview.countDocuments({
      panelId: panel._id,
      status: { $in: ['Scheduled', 'Confirmed'] },
    });

    if (activeInterviews > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete panel with ${activeInterviews} active interview sessions. Reassign or cancel slots first.`,
      });
    }

    await Panel.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Panel deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// VENUE & ROOM MANAGEMENT CONTROLLERS
// ==========================================

// @desc    Get all interview venues & rooms
// @route   GET /api/interviews/venues
// @access  Private (Authenticated)
export const getVenues = async (req, res, next) => {
  try {
    const venues = await Venue.find().sort({ building: 1, name: 1 });
    res.status(200).json({ success: true, count: venues.length, data: venues });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single venue details
// @route   GET /api/interviews/venues/:id
// @access  Private (Authenticated)
export const getVenueById = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }
    res.status(200).json({ success: true, data: venue });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Create interview venue
// @route   POST /api/interviews/venues
// @access  Private (Admin)
export const createVenue = async (req, res, next) => {
  try {
    const { name, location, building, roomNumber, capacity, type, facilities, meetingLink } = req.body;

    const venue = await Venue.create({
      name,
      location: location || `${building || 'Main Block'} - Room ${roomNumber || '101'}`,
      building: building || 'Academic Block A',
      roomNumber: roomNumber || '',
      capacity: capacity || 1,
      type: type || 'Physical Lab',
      facilities: facilities || ['High-speed LAN', 'Audio-Visual System'],
      meetingLink: meetingLink || '',
      status: 'Available',
    });

    // Log Activity
    await ActivityLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      action: 'Created Interview Venue',
      entityType: 'Venue',
      entityId: venue._id.toString(),
      details: { venueName: venue.name, type: venue.type },
    });

    res.status(201).json({ success: true, message: 'Venue created successfully', data: venue });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update interview venue
// @route   PUT /api/interviews/venues/:id
// @access  Private (Admin)
export const updateVenue = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }

    const { name, location, building, roomNumber, capacity, type, facilities, meetingLink, status } = req.body;
    if (name) venue.name = name;
    if (location) venue.location = location;
    if (building !== undefined) venue.building = building;
    if (roomNumber !== undefined) venue.roomNumber = roomNumber;
    if (capacity !== undefined) venue.capacity = capacity;
    if (type) venue.type = type;
    if (facilities) venue.facilities = facilities;
    if (meetingLink !== undefined) venue.meetingLink = meetingLink;
    if (status) venue.status = status;

    await venue.save();

    res.status(200).json({ success: true, message: 'Venue updated successfully', data: venue });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Delete interview venue
// @route   DELETE /api/interviews/venues/:id
// @access  Private (Admin)
export const deleteVenue = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }

    const activeInterviews = await Interview.countDocuments({
      venueId: venue._id,
      status: { $in: ['Scheduled', 'Confirmed'] },
    });

    if (activeInterviews > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete venue with ${activeInterviews} active interview sessions. Reassign or cancel slots first.`,
      });
    }

    await Venue.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Venue deleted successfully' });
  } catch (error) {
    next(error);
  }
};
