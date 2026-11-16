import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: 'Pan India / Remote',
      trim: true,
    },
    package: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['Full-Time', 'Internship', 'Full-Time + Internship'],
      default: 'Full-Time',
    },
    minimumCGPA: {
      type: Number,
      required: true,
      default: 6.0,
      min: 0,
      max: 10,
      index: true,
    },
    maximumActiveBacklogs: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      index: true,
    },
    eligibleBranches: [
      {
        type: String,
        trim: true,
      },
    ],
    graduationYear: {
      type: Number,
      required: true,
      index: true,
    },
    requiredSkills: [{ type: String, trim: true }],
    preferredSkills: [{ type: String, trim: true }],
    experienceRequirements: {
      type: String,
      default: 'Freshers (2026 Batch)',
    },
    applicationDeadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Open', 'Closed'],
      default: 'Open',
      index: true,
    },
    applicantCount: {
      type: Number,
      default: 0,
    },
    rounds: [{ type: String }],
    structuredJDAnalysis: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Job = mongoose.model('Job', jobSchema);
export default Job;

