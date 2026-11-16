import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
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
    eligibilityStatus: {
      type: String,
      enum: ['Eligible', 'Ineligible'],
      required: true,
      index: true,
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
      index: true,
    },
    matchExplanation: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: [
        'Applied',
        'Under Review',
        'Shortlisted',
        'Interview Scheduled',
        'Offered',
        'Rejected',
        'Ineligible',
      ],
      default: 'Applied',
      index: true,
    },
    applicationDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    reviewNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications by same student for same job
applicationSchema.index({ studentId: 1, jobId: 1 }, { unique: true });

export const Application = mongoose.model('Application', applicationSchema);
export default Application;

