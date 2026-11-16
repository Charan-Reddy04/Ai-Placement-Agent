import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  techStack: [{ type: String }],
  github: { type: String },
  liveUrl: { type: String },
});

const certificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issuer: { type: String, required: true },
  date: { type: String },
  url: { type: String },
});

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    branch: {
      type: String,
      required: [true, 'Branch is required'],
      trim: true,
      index: true,
    },
    department: {
      type: String,
      default: 'School of Computing',
      trim: true,
    },
    cgpa: {
      type: Number,
      required: [true, 'CGPA is required'],
      min: [0, 'CGPA cannot be negative'],
      max: [10, 'CGPA cannot exceed 10'],
      index: true,
    },
    activeBacklogs: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      index: true,
    },
    graduationYear: {
      type: Number,
      required: [true, 'Graduation year is required'],
      index: true,
    },
    skills: [{ type: String, trim: true }],
    softSkills: [{ type: String, trim: true }],
    projects: [projectSchema],
    certifications: [certificationSchema],
    resume: {
      url: { type: String },
      originalName: { type: String },
      mimeType: { type: String },
      uploadedAt: { type: Date },
    },
    github: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    profileCompletion: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Method to recalculate profile completion
studentSchema.methods.calculateCompletion = function () {
  let score = 30; // base academic record
  if (this.phone) score += 5;
  if (this.github || this.linkedin) score += 10;
  if (this.skills && this.skills.length >= 3) score += 15;
  if (this.projects && this.projects.length >= 1) score += 20;
  if (this.certifications && this.certifications.length >= 1) score += 10;
  if (this.resume && this.resume.url) score += 10;
  this.profileCompletion = Math.min(100, score);
  return this.profileCompletion;
};

export const Student = mongoose.model('Student', studentSchema);
export default Student;

