import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    round: {
      type: String,
      required: true,
      trim: true,
      default: 'Technical Round 1',
    },
    roundName: {
      type: String,
      trim: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    scheduledDate: {
      type: Date,
      index: true,
    },
    startTime: {
      type: String, // HH:MM AM/PM
      required: true,
    },
    endTime: {
      type: String, // HH:MM AM/PM
    },
    duration: {
      type: String,
      default: '45 mins',
    },
    panelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Panel',
      index: true,
    },
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      index: true,
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled'],
      default: 'Confirmed',
      index: true,
    },
    outcome: {
      type: String,
      enum: ['Pending', 'Selected', 'Rejected', 'Next Round'],
      default: 'Pending',
      index: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 10,
      default: null,
    },
    meetingLink: {
      type: String,
      trim: true,
      default: '',
    },
    feedback: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to synchronize round/roundName and date/scheduledDate
interviewSchema.pre('save', function (next) {
  if (this.round && !this.roundName) {
    this.roundName = this.round;
  } else if (this.roundName && !this.round) {
    this.round = this.roundName;
  }

  if (this.date && !this.scheduledDate) {
    this.scheduledDate = new Date(this.date);
  } else if (this.scheduledDate && !this.date) {
    this.date = this.scheduledDate.toISOString().split('T')[0];
  }

  next();
});

// Indexes to accelerate conflict queries
interviewSchema.index({ studentId: 1, date: 1 });
interviewSchema.index({ panelId: 1, date: 1 });
interviewSchema.index({ venueId: 1, date: 1 });

export const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;
