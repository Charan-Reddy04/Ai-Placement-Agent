import { Interview } from '../models/Interview.js';
import { Venue } from '../models/Venue.js';

/**
 * Parses a time string (e.g., "10:30 AM", "02:15 PM", "14:00") into minutes from midnight.
 * @param {string} timeStr
 * @returns {number} minutes from midnight (0 - 1439)
 */
export function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const cleaned = timeStr.trim();
  const match = cleaned.match(/^(\d{1,2}):(\d{2})(?:\s*([AP]M))?/i);
  if (!match) return 0;

  let [_, hoursStr, minsStr, meridiem] = match;
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minsStr, 10);

  if (meridiem) {
    const period = meridiem.toUpperCase();
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
  }

  return hours * 60 + minutes;
}

/**
 * Checks if two open intervals [startA, endA) and [startB, endB) overlap.
 * @param {number} startA
 * @param {number} endA
 * @param {number} startB
 * @param {number} endB
 * @returns {boolean}
 */
export function areIntervalsOverlapping(startA, endA, startB, endB) {
  return Math.max(startA, startB) < Math.min(endA, endB);
}

/**
 * Normalizes date string into YYYY-MM-DD
 * @param {string|Date} dateVal
 * @returns {string} YYYY-MM-DD
 */
export function normalizeDateString(dateVal) {
  if (!dateVal) return '';
  if (typeof dateVal === 'string') {
    // If ISO date or already YYYY-MM-DD
    const match = dateVal.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

/**
 * Deterministically checks for scheduling conflicts across candidate, panel, and venue.
 * 
 * @param {Object} params
 * @param {string} params.studentId
 * @param {string} [params.panelId]
 * @param {string} [params.venueId]
 * @param {string|Date} params.date
 * @param {string} params.startTime
 * @param {string} [params.endTime]
 * @param {string} [params.excludeInterviewId]
 * @returns {Promise<{ hasConflict: boolean, conflicts: Array<{ type: string, message: string }> }>}
 */
export async function checkInterviewConflict({
  studentId,
  panelId,
  venueId,
  date,
  startTime,
  endTime,
  excludeInterviewId = null,
}) {
  const normDate = normalizeDateString(date);
  if (!normDate || !startTime) {
    return { hasConflict: false, conflicts: [] };
  }

  const newStartMin = parseTimeToMinutes(startTime);
  // Default duration 45 mins if endTime not explicitly provided
  const newEndMin = endTime ? parseTimeToMinutes(endTime) : newStartMin + 45;

  const conflicts = [];

  // Query all active (non-cancelled) interviews for this date
  const query = {
    date: normDate,
    status: { $nin: ['Cancelled'] },
  };

  if (excludeInterviewId) {
    query._id = { $ne: excludeInterviewId };
  }

  const existingInterviews = await Interview.find(query)
    .populate('studentId', 'rollNumber')
    .populate('panelId', 'name')
    .populate('venueId', 'name type capacity')
    .populate('jobId', 'title')
    .populate('companyId', 'name');

  // Check venue capacity details if venueId provided
  let selectedVenue = null;
  if (venueId) {
    selectedVenue = await Venue.findById(venueId);
  }

  for (const item of existingInterviews) {
    const itemStartMin = parseTimeToMinutes(item.startTime);
    const itemEndMin = item.endTime
      ? parseTimeToMinutes(item.endTime)
      : itemStartMin + 45;

    const isOverlapping = areIntervalsOverlapping(newStartMin, newEndMin, itemStartMin, itemEndMin);
    if (!isOverlapping) continue;

    // 1. Candidate Conflict check
    if (studentId && item.studentId && item.studentId._id.toString() === studentId.toString()) {
      conflicts.push({
        type: 'candidate',
        message: `Candidate already has an interview with ${item.companyId?.name || 'another company'} on ${normDate} from ${item.startTime} to ${item.endTime || 'end'}.`,
      });
    }

    // 2. Faculty Panel Conflict check
    if (panelId && item.panelId && item.panelId._id.toString() === panelId.toString()) {
      conflicts.push({
        type: 'panel',
        message: `Faculty Panel "${item.panelId.name}" is already conducting an interview session on ${normDate} from ${item.startTime} to ${item.endTime || 'end'}.`,
      });
    }

    // 3. Venue Conflict check
    if (venueId && item.venueId && item.venueId._id.toString() === venueId.toString()) {
      // If venue is a physical room/lab with capacity 1 (or small room), cannot be double-booked
      const venueType = selectedVenue?.type || item.venueId?.type;
      const capacity = selectedVenue?.capacity || item.venueId?.capacity || 1;
      
      // Virtual bridges with large capacity (> 20) can hold simultaneous sessions if desired,
      // but physical rooms/labs cannot be double-booked.
      if (venueType !== 'Virtual Bridge' || capacity <= 5) {
        conflicts.push({
          type: 'venue',
          message: `Venue "${item.venueId.name}" is already reserved for an interview on ${normDate} from ${item.startTime} to ${item.endTime || 'end'}.`,
        });
      }
    }
  }

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
  };
}

